

const {MongoClient, ServerApiVersion} = require('mongodb');
const mongodb = require('mongodb');
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const app = express();
const saltRounds = 12;

var port = process.env.PORT || 8000;
const Joi = require("joi");
const expireTime = 1000 * 60 * 60; // 1 hour

require('dotenv').config();
app.set('view engine', 'ejs');

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;


const uri = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`;
var mongoStore = MongoStore.create({
  mongoUrl: uri,
  crypto: {
    secret: mongodb_session_secret
  }
})

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const database = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await database.connect();
    // Send a ping to confirm a successful connection
    await database.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await database.close();
  }
}
run().catch(console.dir);

const userCollection = database.db(mongodb_database).collection("users");

app.use(express.urlencoded({ extended: false }));

app.use("/public",  express.static('./public/'));

app.use(session({ 
  secret: node_session_secret,
  store: mongoStore, //default is memory store 
  saveUninitialized: false, 
  resave: true
}
));

app.get("/", async (req, res) => {
  if(!req.session.authenticated){
    res.render("landing_loggedout.ejs");
    return;
  }
  var myAccount = await userCollection.find({email: req.session.email}).project({}).toArray();
  res.render("landing_loggedin.ejs", {username: myAccount[0].username});


});

app.get('/members', async (req, res) => {
  if(!req.session.authenticated){
    res.redirect('/');
    return;
  }
  var pics = new Array("/public/duck.png","/public/duck2.png","/public/goose.png");
  var randomNum = Math.floor(Math.random() * pics.length);
  var myAccount = await userCollection.find({email: req.session.email}).project({}).toArray();
  res.render('members.ejs', {username: myAccount[0].username, pic: pics[randomNum] });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post('/signupSubmit', async (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

 
  let usernameFilled = username != "";
  let emailFilled = email != "";
  let passwordFilled = password != "";
  if(!usernameFilled || !emailFilled || !passwordFilled){
    res.render("signup_error.ejs", {usernameFilled : usernameFilled, emailFilled : emailFilled, passwordFilled : passwordFilled});
    return;
  }

  const schema = Joi.object({
        username: Joi.string().alphanum().max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().max(20).required(),
    });
    const result = schema.validate({ username, email, password });
    if (result.error != null) {
      console.log(result.error);
      res.redirect("/signup");
      return;
    }

    var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({username: username, email: email, password: hashedPassword, user_type: "user"});
    req.session.authenticated = true;
    req.session.email = email;
    req.session.user_type = "user";
    req.session.cookie.maxAge = expireTime;
    res.redirect("/members");
});

app.get("/login", (req, res) => {
  var error = req.query.error != null;
  res.render('login.ejs', {error: error});
});

app.post('/loggingin', async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  const schema = Joi.string().email().required();
  const result = schema.validate(email);
  if (result.error != null) {
    console.log(result.error);
    res.redirect("/login");
    return;
  }

  const userGrab = await userCollection.find({email: email}).project({email: 1, password: 1, _id: 1, user_type: 1}).toArray();

  if(userGrab.length != 1 ){
    console.log("User not found");
    res.redirect("/login?error=user-not-found");
    return;
  }
  if(await bcrypt.compare(password, userGrab[0].password)){
    console.log("correct pass");
    req.session.authenticated = true;
    req.session.email = email;
    req.session.user_type = userGrab[0].user_type;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/members");
    return;
  }else{
    console.log("incorrect pass");
    res.redirect("/login?error=incorrect-password");
    return;
  }
});

app.get("/admin", async (req, res) => {
  if(!req.session.authenticated){
    res.redirect("/login");
    return;
  }
  let user = await userCollection.findOne({email: req.session.email});
  if(user.user_type != "admin"){
    res.render("notadmin.ejs");
    return;
  }
  var users = await userCollection.find({}).project({username: 1, email: 1, user_type: 1, _id: 1}).toArray();
 console.log(users);
  res.render('admin.ejs', {users: users});

}); 

app.post("/toggleAdmin", async (req, res) => {
  if(!req.session.authenticated){
    res.redirect("/login");
    return;
  }
  let user = await userCollection.findOne({email: req.session.email});
  if(user.user_type != "admin"){
    res.redirect("/members");
    return;
  }
  var id = req.body.id;
  var newRole = req.body.newRole;
  await userCollection.updateOne({_id: new mongodb.ObjectId(id)}, {$set: {user_type: newRole}});
  res.redirect("/admin");
});


app.get("/dashboard", async (req, res) => {
  if(!req.session.authenticated){
    res.redirect("/login");
    return;
  }
  var myAccount = await userCollection.find({email: req.session.email}).project({}).toArray();
  res.render('dashboard.ejs', {username: myAccount[0].username});
});

//TODO: add a route for logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/*", (req, res) => {
  res.render("notfound.ejs");
});

app.listen(port, () => {
  console.log("Server running at port= " + port);
});