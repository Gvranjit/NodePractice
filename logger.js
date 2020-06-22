const os = require('os');
const fs = require('fs');

const logger = (...args) => {
    //let time = (os.freemem()/1024/1024/1024).toFixed(2) + 'GB';
    //console.log(time);
    var date = new Date;
    let fullTime = `[${date.getDate()}/${date.getMonth()}/${date.getFullYear()}] ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} >> `;
    let fileOut = fullTime +  [...args] + "\n";
    fs.appendFile(`${date.getDate()}${date.getMonth()}${date.getFullYear()}.log`, fileOut, () => {
        console.log(fullTime, ...args);
    });
};
module.exports = logger;
