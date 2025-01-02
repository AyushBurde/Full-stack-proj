const express = require("express");
const router = express.Router();

//Index-users 
router.get("/" , (req,res)=> {
    res.send ("GET for users");
})


//show-users 
router.get("/" , (req,res)=> {
    res.send ("GET for users");
})


//post-users 
router.post("/" , (req,res)=> {
    res.send ("post for users");
})


//Delete-users 
router.delete("/" , (req,res)=> {
    res.send (" delete for users");
})


module.exports = router ; 
