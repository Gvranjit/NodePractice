const con = require("mysql2");

const database = con.createPool({
     host: "localhost",
     user: "root",
     password: "lovely",
     database: "testing",
});

const db = database.promise();

db.execute("INSERT INTO names(player_name, player_rank) VALUES(?,?)", [
     "Subu",
     "English",
]).then(() => {
     db.end();
});
