const express = require("express");
const app = express()
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const flash = require("connect-flash");



app.listen (3000 , ( ) =>{
    console.log("server is listening to 3000")
});