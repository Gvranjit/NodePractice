const Product = require("../models/product.js");
// const products = new Product();

exports.getAddProduct = (req, res, next) => {
     // console.log('In the add-product middleware');

     res.render("admin/edit-product", {
          pageTitle: "Add Products",
          path: "add-product",
          editMode: "false",
     });
};

exports.postAddProduct = (req, res, next) => {
     //console.log(req.body);

     const r = req.body;

     const product = new Product({
          title: r.title,
          description: r.description,
          price: r.price,
          imageUrl: r.imageUrl,
          userId: req.session.user, //you could do  user._id but its not necessary because Mongoose Filters the ID out for you.
     });

     product
          .save()
          .then((result) => {
               console.log("Product Created ");
               res.redirect("/admin/add-product");
          })
          .catch((err) => console.log(err));
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

     Product.findById(productId)
          .then((p) => {
               p.title = updatedTitle;
               p.description = updatedDescription;
               p.price = updatedPrice;
               p.imageUrl = updatedImageUrl;
               return p.save();
          })
          .then((result) => {
               res.redirect("/admin/admin-product-list");
          })
          .catch((err) => console.log(err));

     // /
};

exports.postDeleteProduct = (req, res, next) => {
     const productId = req.params.productId;
     // const productPrice = req.body.productPrice;
     // since the above is a dirty method,this is not preferable
     Product.findByIdAndDelete(productId)

          .then((result) => {
               res.redirect("/admin/admin-product-list");
          })

          .catch((err) => console.log(err));
};

exports.getAdminProductList = (req, res, next) => {
     Product.find({ userId: req.session.user._id })
          .populate("userId")
          // .select("title price -_id")
          // .populate("userId", "name email -_id")
          .then((products) => {
               console.log(products);
               res.render("admin/admin-product-list", {
                    prods: products,
                    pageTitle: "Admin panel Products",
                    path: "admin-p roduct-list",
               });
          })
          .catch((err) => console.log(err));
};
