const sum = (a, b) => {
     if (a & b) {
          return a + b;
     }
     throw new Error("Invalid Argument");
};
try {
     console.log(sum(1));
} catch {
     console.log("error occured");
     // console.log(error);
}
console.log("this works ");
