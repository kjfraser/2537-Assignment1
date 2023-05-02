

const {MongoClient, ServerApiVersion} = require('mongodb');
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
    res.send(`Hello! <br><form action='/login'><button>Login</button></form>
    <br><form action='/signup'><button>Create Account</button></form>`);
    return;
  }

  var myAccount = await userCollection.find({email: req.session.email}).project({}).toArray();
  res.send(`Hello, ${myAccount[0].username}!
  <form action='/members'><button>Go to Members Area</button></form>
  <form action='/logout'><button>Logout</button></form>
  `);
 // res.send(`You are logged in><form action='/logout'><button>Logout</button></form> `);
  return;
  console.log("User is logged in");
});

app.get('/members', async (req, res) => {
  if(!req.session.authenticated){
    res.redirect('/');
    return;
  }
  var myAccount = await userCollection.find({email: req.session.email}).project({}).toArray();
  var page = `<h1>Hello, ${myAccount[0].username}.</h1><br>`;
  var pics = new Array("/public/duck.png","/public/duck2.png","/public/goose.png");
  var randomNum = Math.floor(Math.random() * pics.length);
  page += `<img src="${pics[randomNum]}" alt="duck?" ></img><br>`;
  page += `<form action='/logout'><button>Sign out</button></form>`;
  
  res.send(page);

});

app.get("/signup", (req, res) => {
  res.send(`<form action="/signupSubmit" method='post'><input type='text' name='username' placeholder='name'><br>
  <input type='email' name='email'placeholder='email'><br>
  <input type='password' name='password' placeholder='password'><br><button>Submit</button></form>`);
});



app.post('/signupSubmit', async (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  var errorMsg = "";
  if(username == ""){
    errorMsg += "Name is required<br>";
  }
  if(email == ""){
    errorMsg += "Email is required<br>";
  }
  if(password == ""){
    errorMsg += "Password is required<br>";
  }
  if(errorMsg != ""){
    res.send(errorMsg + `
    <a href='/signup'>Try again</a>
    `)
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

    await userCollection.insertOne({username: username, email: email, password: hashedPassword});
    console.log("New User Approved");
    res.send("New User Approved");
});

app.get('/signupSubmit', (req,res) => {
  res.send("New User Approved");
});

app.get("/login", (req, res) => {
  res.send(`<form action='/loggingin' method='post'> <input type='email' name='email' placeholder='email'><br>
  <input type='password' name='password' placeholder='password'><br><button>Submit</button></form>`);
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

  const result2 = await userCollection.find({email: email}).project({email: 1, password: 1, _id: 1}).toArray();

  console.log(result2);
  if(result2.length != 1){
    console.log("User not found");
    res.redirect("/login");
    return;
  }
  if(await bcrypt.compare(password, result2[0].password)){
    console.log("correct pass");
    req.session.authenticated = true;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/dashboard");
    return;
  }else{
    console.log("incorrect pass");
    res.redirect("/login");
    return;
  }
});

app.get("/dashboard", async (req, res) => {
  if(!req.session.authenticated){
    res.redirect("/login");
    return;
  }
  var myAccount = await userCollection.find({email: req.session.email}).project({}).toArray();
  res.send(`You are logged in ${myAccount[0].username} <br><form action='/logout'><button>Logout</button></form> `);
  
});

//TODO: add a route for logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/*", (req, res) => {
  res.send("Page not found - 404 :(");
});


app.listen(port, () => {
  console.log("Server running at port= " + port);
});