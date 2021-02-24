module.exports = (req, res, next) => {
     if (!req.session.isLoggedIn) {
          const error = new Error("Not Authenticated");
          throw error;
     } else {
          next();
     }
};
