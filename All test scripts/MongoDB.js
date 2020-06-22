const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

MongoClient.connect(
     "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false"
)
     .then((client) => {
          console.log("CLIENT CONNECTED SUCCESSFULLY");
          _db = client.db("test");
          return _db;
     })
     .then((result) => {
          class User {
               constructor(username, email) {
                    this.name = username;
                    this.email = email;
               }

               save() {
                    const db = getDb();
                    return db
                         .collection("users")
                         .insertOne(this)
                         .then()
                         .catch((err) => {
                              console.log(err);
                              process.exit();
                         });
               }
               static findById(id) {
                    const db = getDb();
                    return db
                         .collection("users")
                         .find({ _id: mongodb.ObjectID(id) })
                         .next()
                         .then((user) => {
                              console.log(user);
                              return user;
                         })
                         .catch((err) => console.log(err));
               }
          }

          user = User.findById("5ee45baaceb10284f01f7432").then((user) => {
               // console.log(user);
          });
     })
     .then((result) => {
          console.log("Added data ");
          return;
     })
     .catch((err) => {
          console.log(err);
          process.exit();
     });

// **************************************************************************************************************

function getDb() {
     if (_db) {
          return _db;
     } else {
          throw "No DB was found";
     }
}
