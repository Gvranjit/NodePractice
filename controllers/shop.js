const Product = require("../models/product.js");

// //const Cart = require("../models/cart");
// const { get } = require("../routes/shop.js");
// const User = require("../models/user.js");
// // const products = new Product();
// // const cart = new Cart();

exports.getProducts = (req, res, next) => {
     Product.find()
          .then((products) => {
               res.render("./shop/product-list", {
                    pageTitle: "Product List",
                    prods: products,
                    path: "product-list",
                    isAuthenticated: req.session.isLoggedIn,
               });
          })
          .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
     req.session.user
          .getCart()
          .then((cartItems) => {
               console.log(cartItems);
               res.render("shop/cart", {
                    pageTitle: "Cart",
                    path: "cart",
                    prods: cartItems,

                    totalPrice: 1,
                    isAuthenticated: req.session.isLoggedIn,
               });
          })
          .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
     let user = req.session.user;
     console.log("hi", user.name);
     const productId = req.body.productId;
     console.log(productId);
     Product.findById(productId)
          .then((product) => {
               return user.addToCart(product);
          })
          .then((result) => {
               res.redirect("/cart");
          });
};

exports.removeFromCart = (req, res, next) => {
     const productId = req.params.productId;
     let fetchedCart;
     // const price = req.body.productPrice; // this looks like a dirty wway of solving it. so finding another way below.
     req.session.user
          .removeFromCartById(productId)
          .then((result) => {
               res.redirect("/cart");
          })
          .catch((err) => console.log(err));
};

exports.getProductDetail = (req, res, next) => {
     const productId = req.params.productId;

     Product.findById(productId)
          .then((product) => {
               res.render("shop/product-detail", {
                    product: product,
                    pageTitle: "Product Detail",
                    path: "product-list",
                    isAuthenticated: req.session.isLoggedIn,
               });
          })
          .catch((err) => console.log(err));
};
exports.getIndex = (req, res, next) => {
     Product.find()
          .populate("userId")
          .then((products) => {
               console.log(products);
               console.log("I REACHED THE  INDEX");

               res.render("./shop/index", {
                    pageTitle: "Shop",
                    prods: products,
                    path: "index",
               });
          })
          .catch((err) => console.log(err));
};
exports.getOrders = (req, res, next) => {
     req.session.user
          .getOrders()
          .then((orders) => {
               console.log(orders);
               res.render("shop/orders", {
                    pageTitle: "Your Orders",
                    path: "orders",
                    orders: orders,
                    isAuthenticated: req.session.isLoggedIn,
               });
          })
          .then((orders) => {
               // console.log("**********************************************", products);
          })
          .catch((err) => console.log(err));
};

exports.postCreateOrder = (req, res, next) => {
     req.session.user
          .createOrder()

          .then((result) => {
               res.redirect("/orders");
          })
          .catch((err) => console.log(err));
};

// //.console.log(adminData.products);
