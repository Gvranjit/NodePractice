const events = require("events");
const { rawListeners } = require("process");
const EventEmitter = events.EventEmitter;
const myEmmiter = new EventEmitter();

myEmmiter.on("status", (code, msg) => {
     console.log(code, msg);
});
myEmmiter.on("status", (code, msg) => {
     console.log(code, msg, "haha");
});
for (i = 0; i < 6; i++) {
     myEmmiter.emit("status", 200, "ok");
}

console.log(myEmmiter.listenerCount("status"));

myEmmiter
     .rawListeners("status")
     .find()
     .then((result) => {
          console.log(result);
     });
