const express= require("express");
const bcrypt=require("bcrypt");
const db=require("./db");
const jwt= require("jsonwebtoken");
require("dotenv").config();
const router=express.Router();
console.log("tytytyty");

router.post("/register", async (req,res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    if(!name||!email||!password){
        return res.status(400).json({
            "message":"name email and password are required"
        });
    }
    const hashedPass= await bcrypt.hash(password,12);
    const [result]= await db.execute("insert into users (name,email,password) VALUES (?,?,?)",[name,email,hashedPass]);

    return res.status(201).json({
        "message":"user inserted successfully",
    })
})

router.post("/login", async (req,res)=>{
    const email=req.body.email;
    const upassword= req.body.password;
       if(!email||!upassword){
        return res.status(400).json({
            "message":" email and password are required"
        });
    }

const [row]= await db.execute("select * from users where email = ?",[email.trim().toLowerCase()]);
if(row.length==0){
    return res.status(404).json({
        message:"wrong cedemtials"
    });
}
const passwordmatch= await bcrypt.compare(upassword,row[0].password);
if(!passwordmatch){
    return res.status(404).json({
        message:"wrong cedemtials"
    })
}
//generate JWT
const token= jwt.sign(
    {
        id: row[0].id,
        email: row[0].email
    },
    process.env.JWT_SECRET,
     {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
     }
)
return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: row[0].id,
                name: row[0].name,
                email: row[0].email
            }
        });
    


})



module.exports= router;