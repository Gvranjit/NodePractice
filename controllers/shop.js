//file system related imports
const fs = require("fs");
const path = require("path");

//MODELS
const Product = require("../models/product.js");
const Order = require("../models/order.js");

//PDFkit
const PDFDocument = require("pdfkit");
const order = require("../models/order.js");
const { bold } = require("../helpers/path.js");
const { ITEMS_PER_PAGE } = require("../config.json").shop;
// //const Cart = require("../models/cart");
// const { get } = require("../routes/shop.js");
// const User = require("../models/user.js");
// // const products = new Product();
// // const cart = new Cart();

exports.getProducts = (req, res, next) => {
     const page = req.query.page;
     console.log("****************************", ITEMS_PER_PAGE);
     Product.find()
          .skip((page - 1) * ITEMS_PER_PAGE)
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
     const page = +req.query.page || 1;
     let totalItems;

     Product.find()
          .countDocuments()
          .then((numProducts) => {
               totalItems = numProducts;
               return Product.find()
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE)
                    .populate("userId");
          })

          .then((products) => {
               console.log("I REACHED THE  INDEX");

               res.render("./shop/index", {
                    pageTitle: "Shop",
                    prods: products,
                    path: "index",
                    totalProducts: totalItems,
                    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                    currentPage: page,
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

exports.postSendInvoice = (req, res, next) => {
     const orderId = req.body.orderId;
     const orderUserId = req.body.userId;
     const userId = req.session.user._id;
     const fileName = "invoice-" + orderId.toString() + ".pdf";
     const filePath = path.join(
          __dirname,
          "..",
          "/data/order-invoices/invoice-" + orderId.toString() + ".pdf"
     );
     // return fs.readFile(filePath, (err, fileContent) => {
     //      if (err) {
     //           next(err);
     //      } else {
     //           res.setHeader("content-type", "application/pdf");
     //           res.setHeader("content-disposition", "attachment;filename=" + fileName);
     //           return res.send(fileContent);
     //      }
     // });
     return Order.findById(orderId)
          .then((order) => {
               const pdfDoc = new PDFDocument();
               pdfDoc.pipe(fs.createWriteStream(filePath));
               pdfDoc.pipe(res);
               pdfDoc.fontSize(26).text("Invoice", {
                    underline: false,
               });
               pdfDoc.text("________________________________\n.");
               let totalPrice = 0;
               order.orderItems.forEach((orderItem) => {
                    console.log(orderItem);
                    pdfDoc
                         .fontSize(16)
                         .text(
                              `${orderItem.productId.title} : ${orderItem.qty} x ${
                                   orderItem.productId.price
                              } = Rs. ${orderItem.qty * orderItem.productId.price}`
                         );
                    totalPrice += orderItem.productId.price;
               });
               pdfDoc.text("________________________________\n\n");
               pdfDoc.fontSize(20).text(`Total Price :  Rs. ${totalPrice}`);
               pdfDoc.end();
          })
          .catch((err) => {
               next(err);
          });

     throw new Error("PAGE RENDER HAS NOT BEEN PROPERLY SET HERE\n");
};

// //.console.log(adminData.products);
