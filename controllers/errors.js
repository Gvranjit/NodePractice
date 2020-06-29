exports.get404 = (req, res, next) => {
     res.status(404).render("error", {
          layout: false,
          pageTitle: "ERROR",
          path: "error",
     });
};

exports.get500 = (req, res, next) => {
     res.status(500).render("500", {
          layout: false,
          pageTitle: "ERROR",
          path: "500",
     });
};
