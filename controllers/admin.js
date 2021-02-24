const Product = require("../models/product.js");
// const products = new Product();
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const path = require("../helpers/path.js");

const { ITEMS_PER_PAGE } = require("../config.json").shop;

const fileHelper = require("../helpers/file");
function throw500(err) {}

exports.getAddProduct = (req, res, next) => {
     // console.log('In the add-product middleware');

     res.render("admin/edit-product", {
          pageTitle: "Add Products",
          path: "add-product",
          editMode: "false",
     });
};

exports.postAddProduct = (req, res, next) => {
     console.log("TESTINGGGGGGGGGGGGGGG", req.file);

     const r = req.body;
     console.log("IMAGE :  ", req.file);
     const image = req.file;

     const errors = validationResult(req);
     if (!req.file) {
          return res.status(422).render("admin/edit-product", {
               pageTitle: "Add Product",
               path: "add-product",
               editMode: false,
               hasError: true,
               errorMessage: [{ msg: "attached image is not valid" }],
               product: {
                    title: r.title,
                    description: r.description,
                    price: r.price,
               },
          });
     }

     if (!errors.isEmpty()) {
          return res.status(422).render("admin/edit-product", {
               pageTitle: "Add Product",
               path: "add-product",
               editMode: false,
               hasError: true,
               errorMessage: errors.array(),
               product: {
                    title: r.title,
                    description: r.description,
                    price: r.price,
                    image: req.file,
               },
          });
     }

     //EVERYTHING looks good, now i can generate Image URL and proceed to store

     const imageUrl = image.path;
     console.log("THIS IS A PLACE IS HOULD BE IN ", imageUrl);
     const product = new Product({
          title: r.title,
          description: r.description,
          price: r.price,
          imageUrl: imageUrl,
          userId: req.session.user, //you could do  user._id but its not necessary because Mongoose Filters the ID out for you.
     });

     product
          .save()
          .then((result) => {
               console.log("Product Created ");
               req.flash("message", "New Product was added successfully");
               res.redirect("/admin/add-product");
          })
          .catch((err) => {
               console.log("THERE WAS A SYSTEM ERRRORRR");
               const error = new Error(err);
               error.httpStatusCode = 500;
               console.log("THIS IS SUPER WEIRD", error);
               return next(error);
          });
};
exports.getEditProduct = (req, res, next) => {
     // console.log('In the add-product middleware');
     const editMode = req.query.edit;

     if (!editMode) {
          console.log("Invalid query! ");
          return res.redirect("/");
     }
     console.log(editMode);
     let productId = req.params.productId;

     Product.findById(productId)

          .then((products) => {
               if (!products) {
                    console.log("No products found ! ");
                    return res.redirect("/admin/admin-product-list");
               }
               res.render("admin/edit-product", {
                    pageTitle: productId,
                    path: "edit-product",
                    editMode: editMode,
                    product: products,
               });
          })
          .catch((err) => console.log(err));
};

exports.postUpdateProduct = (req, res, next) => {
     const productId = req.body.productId;
     const updatedTitle = req.body.title;
     const updatedPrice = req.body.price;
     const updatedDescription = req.body.description;
     const updatedImageUrl = req.body.imageUrl;
     const image = req.file;

     const errors = validationResult(req);
     console.log(errors);
     if (!errors.isEmpty()) {
          return res.render("admin/edit-product", {
               pageTitle: "Edit Product",
               path: "edit-product",
               editMode: "true",
               hasError: true,
               errorMessage: errors.array(),
               product: {
                    title: updatedTitle,
                    description: updatedDescription,
                    price: updatedPrice,
                    imageUrl: updatedImageUrl,
                    _id: productId,
               },
          });
     }
     Product.findById(productId)

          .then((p) => {
               if (p.userId.toString() !== req.session.user._id.toString()) {
                    console.log("redirecting");
                    return res.redirect("/");
               }
               if (req.file) {
                    p.imageUrl = image.path;
               }

               p.title = updatedTitle;
               p.description = updatedDescription;
               p.price = updatedPrice;
               fileHelper.deleteFile(product.imageUrl);
               return p.save().then((result) => {
                    res.redirect("/admin/admin-product-list");
               });
          })

          .catch((err) => console.log(err));

     // /
};

exports.deleteProduct = (req, res, next) => {
     const productId = req.params.productId;
     // const productPrice = req.body.productPrice;
     // since the above is a dirty method,this is not preferable
     Product.findById(productId)
          .then((product) => {
               if (!product) {
                    return next(new Error("Product Not found"));
               }
               fileHelper.deleteFile(product.imageUrl);
               return Product.deleteOne({ userId: req.session.user._id, _id: productId });
          })

          .then((result) => {
               res.status(200).json({
                    message: "Success",
               });
          })

          .catch((err) => {
               res.status(500).json({ message: "Deleting product failed" });
          });
};

exports.getAdminProductList = (req, res, next) => {
     const page = +req.query.page || 1;
     let totalItems;

     Product.find({})
          .countDocuments()
          .then((numProducts) => {
               totalItems = numProducts;
               return Product.find({ userId: req.session.user._id })
                    .populate("userId")
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE)
                    .populate("userId");
          })

          .then((products) => {
               console.log(products);
               res.render("admin/admin-product-list", {
                    prods: products,
                    pageTitle: "Admin panel Products",
                    path: "admin-p roduct-list",
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
