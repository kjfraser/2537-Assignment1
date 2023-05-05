

async function toggleAdmin(id, action){
  console.log("toggleAdmin called");
  if(action == "add"){
    await Db.collection("users").updateOne({_id: id}, {$set: {user_type: "admin"}});
  }else if(action == "remove"){
    await Db.collection("users").updateOne({_id: id}, {$set: {user_type: "user"}});
  }};