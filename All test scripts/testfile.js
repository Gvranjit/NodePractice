const e = require("express");

let b = 100;

function cbFunction(err, cb) {
     const a = async () => {
          let b = 2;
          if (b != 4) {
               err("There was an error ! ");
          } else {
               cb(b);
          }
     };
     a();
}

console.log(b);
cbFunction(
     (err) => console.log(err),
     (b) => console.log(b)
);
