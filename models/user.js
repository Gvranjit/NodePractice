const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const Order = require("../models/order");

const Order = require("./order");

const userSchema = new Schema({
     email: { type: String, required: true },
     password: { type: String, required: true },
     resetToken: String,
     resetTokenExpiration: Date,
     cart: {
          items: [
               {
                    productId: {
                         type: Schema.Types.ObjectId,
                         ref: "Product",
                         required: true,
                    },
                    qty: { type: Number, required: true },
               },
          ],
     },
});

userSchema.methods.emptyCart = function () {
     this.cart.items = [];
     return this.save();
};

userSchema.methods.getOrders = function () {
     return Order.find({ userId: this._id }).populate("userId", "-cart");
};

userSchema.methods.createOrder = function () {
     console.log("BEFORE POPULATING", this.cart.items);
     return this.populate("cart.items.productId")
          .execPopulate()
          .then((user) => {
               return user.cart.items;
          })
          .then((cartItems) => {
               console.log("CartItems", cartItems);
               const _orderItems = [...cartItems];
               console.log("Order Items", _orderItems);
               const order = new Order({
                    orderItems: [...cartItems],
                    userId: this._id,
               });
               console.log("After Making new order , before saving. ", order.orderItems);
               return order.save();
          })
          .then((result) => {
               console.log(result);
               return this.emptyCart();
          })
          .catch((err) => console.log(err));
};

userSchema.methods.addToCart = function (product) {
     let updatedCart;

     const cartProductIndex = this.cart.items.findIndex((cp) => {
          return cp.productId.toString() === product._id.toString();
     });

     if (cartProductIndex >= 0) {
          console.log("Edit complete");
          updatedCart = this.cart;
          updatedCart.items[cartProductIndex].qty += 1;
          this.cart = updatedCart;
     } else {
          console.log("NEW ENTRY ADDED");
          console.log(product);
          const existingCartItems = this.cart.items;
          updatedCart = {
               items: [...existingCartItems, { productId: product._id, qty: 1 }],
          };
          this.cart = updatedCart;
     }

     return this.save();
};

userSchema.methods.getCart = function () {
     return this.populate("cart.items.productId")
          .execPopulate()
          .then((user) => {
               return this.cart;
          });
};

userSchema.methods.removeFromCartById = function (productId) {
     const updatedCartItems = this.cart.items.filter((item) => {
          console.log(productId, item.productId);
          return item._id.toString() != productId.toString();
     });

     this.cart.items = updatedCartItems;
     return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");

// const { getDb, mongoConnect } = require("../helpers/database");
// const { findById } = require("./product");
// const Product = require("./product");

// class User {
//      constructor(username, email, id, cart) {
//           this.name = username;
//           this.email = email;
//           this._id = id ? mongodb.ObjectID(id) : null;
//           this.cart = typeof cart !== "undefined" ? cart : null;
//      }

//      save() {
//           const db = getDb();
//           return db
//                .collection("users")
//                .insertOne(this)
//                .then()
//                .catch((err) => {
//                     console.log(err);
//                     process.exit();
//                });
//      }
//      static findById(id) {
//           const db = getDb();
//           return db
//                .collection("users")
//                .find({ _id: mongodb.ObjectID(id) })
//                .next()
//                .then((user) => {
//                     console.log(user);
//                     return user;
//                })
//                .catch((err) => console.log(err));
//      }

//      addToCart(product) {
//           const db = getDb();
//           let updatedCart;
//           //to check whether the cart has been initialized or not.
//           if (!this.cart) {
//                console.log("New Cart for this USER", typeof hello);

//                return db
//                     .collection("users")
//                     .updateOne(
//                          { _id: new mongodb.ObjectId(this._id) },
//                          { $set: { cart: { items: [] } } }
//                     );
//           }
//           // ******************************************************

//           const cartProductIndex = this.cart.items.findIndex((cp) => {
//                console.log("THIS SHOULD COME FIRST");
//                return cp.productId.toString() === product._id.toString();
//           });
//           console.log("And this on the second");
//           console.log("CART PRODUCT INDEX", cartProductIndex);
//           if (cartProductIndex >= 0) {
//                console.log('THE ITEMS SHOULDN"T BE ADDED');
//                updatedCart = this.cart;
//                updatedCart.items[cartProductIndex].qty += 1;
//           } else {
//                console.log("NEW ENTRY ADDED");
//                const existingCartItems = this.cart.items;
//                updatedCart = {
//                     items: [
//                          ...existingCartItems,
//                          { productId: new mongodb.ObjectId(product._id), qty: 1 },
//                     ],
//                };
//           }

//           return db
//                .collection("users")
//                .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
//      }

//      getCart() {
//           const db = getDb();
//           const productIds = this.cart.items.map((item) => {
//                return item.productId;
//           });

//           //cleanup script

//           productIds.forEach((productId) => {
//                Product.findById(productId).then((product) => {
//                     if (!product) {
//                          this.removeCartItemById(productId);
//                     }
//                });
//           });

//           return db
//                .collection("products")
//                .find({ _id: { $in: productIds } })
//                .toArray()
//                .then((products) => {
//                     return products.map((product) => {
//                          return (product = {
//                               ...product,
//                               qty: this.cart.items.find((item) => {
//                                    return item.productId.toString() === product._id.toString();
//                               }).qty,
//                          });
//                     });
//                })

//                .catch((err) => {
//                     console.log(err);
//                });
//      }

//      removeCartItemById(productId) {
//           const db = getDb();
//           const existingCartItems = this.cart.items;
//           const updatedCartItems = existingCartItems.filter((item) => {
//                console.log(item.productId, productId);
//                return item.productId.toString() !== productId.toString();
//           });
//           console.log(existingCartItems);
//           return db
//                .collection("users")
//                .updateOne(
//                     { _id: mongodb.ObjectID(this._id) },
//                     { $set: { cart: { items: updatedCartItems } } }
//                )
//                .then((result) => console.log("I REACHED HERE"))
//                .catch((err) => console.log(err));
//      }
//      emptyCart() {
//           const db = getDb();
//           return db
//                .collection("users")
//                .updateOne({ _id: mongodb.ObjectID(this._id) }, { $set: { cart: { items: [] } } })
//                .then((result) => console.log("I REACHED HERE"))
//                .catch((err) => console.log(err));
//      }
//      addOrder() {
//           const db = getDb();
//           return this.getCart() //this returns an array so I don't have to work with object
//                .then((cartItems) => {
//                     return db.collection("orders").insertOne({
//                          items: cartItems,
//                          user: {
//                               userId: mongodb.ObjectID(this._id),
//                               name: this.name,
//                               email: this.email,
//                          },
//                     });
//                })
//                .then((result) => {
//                     console.log("Orders created");
//                     return this.emptyCart();
//                })
//                .catch((err) => console.log(err));
//      }

//      getOrders() {
//           const db = getDb();

//           return db
//                .collection("orders")
//                .find({
//                     "user.userId": mongodb.ObjectID(this._id),
//                })
//                .toArray()
//                .then((orders) => {
//                     return orders;
//                })
//                .catch((err) => console.log(err));
//      }
// }

// module.exports = User;
