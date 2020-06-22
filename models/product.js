const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
     title: {
          type: String,
          require: true,
     },
     description: String,
     imageUrl: String,
     price: {
          type: Number,
          required: true,
     },
     userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
     },
});

module.exports = mongoose.model("Product", productSchema);
// const getDb = require("../helpers/database").getDb;
// const mongodb = require("mongodb");
// const User = require("../models/user");
// class Product {
//      constructor(title, price, description, imageUrl, id, userId) {
//           this.title = title;
//           this.description = description;
//           this.imageUrl = imageUrl;
//           this.price = price;
//           this._id = id ? new mongodb.ObjectId(id) : null;
//           this.userId = userId;
//      }

//      save() {
//           const db = getDb();
//           let dbOp;
//           if (this._id) {
//                dbOp = db.collection("products").updateOne({ _id: this._id }, { $set: this });
//           } else {
//                dbOp = db.collection("products").insertOne(this);
//           }
//           return dbOp

//                .then((result) => {
//                     console.log(result);
//                })
//                .catch((err) => console.log(err));
//      }

//      static fetchAll() {
//           const db = getDb();
//           return db
//                .collection("products")
//                .find()
//                .toArray() //requires pagination
//                .then((products) => products)
//                .catch((err) => console.log(err));
//      }
//      static findById(id) {
//           const db = getDb();
//           return db
//                .collection("products")
//                .find({ _id: new mongodb.ObjectID(id) })
//                .next()
//                .then((product) => {
//                     console.log(product);
//                     return product;
//                })
//                .catch((err) => console.log(err));
//      }
//      static deleteById(id) {
//           const db = getDb();
//           return db
//                .collection("products")
//                .deleteOne({ _id: mongodb.ObjectID(id) })
//                .then((result) => {
//                     console.log("deleted");
//                })
//                .catch((err) => console.log(err));
//      }
// }

// module.exports = Product;
