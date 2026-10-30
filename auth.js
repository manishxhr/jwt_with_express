const express= require("express");
const bcrypt=require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
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
        expiresIn: process.env.JWT_EXPIRES_IN || "15m"
     }
)

    const refreshToken= crypto.randomBytes(64).toString("hex");
    const familyId= uuidv4(); // generate family ID for the refresh token
    const tokenhash= await crypto.createHash("sha256").update(refreshToken).digest("hex");
    const tokenExpiry= new Date(Date.now() + 7*24*60*60*1000); // 7 days from now

    await db.execute("insert into refresh_tokens (user_id, refresh_tokens, token_hash, family_id, expires_at) VALUES (?, ?, ?, ?, ?)",
        [row[0].id,refreshToken,tokenhash,familyId,tokenExpiry]);

    return res.status(200).json({
        message: "Login successful",
        token: token,
        refreshToken: refreshToken,
        user: {
            id: row[0].id,
            name: row[0].name,
            email: row[0].email
        }
    });

})

//refresh token route
router.post("/refresh",async(req,res)=>{
    const refreshToken=req.body.refreshToken;
    if(!refreshToken){
        return res.status(400).json({
            message:"refresh token is required"
        })
    }
    const tokenhash= crypto.createHash("sha256").update(refreshToken).digest("hex");
    const [row]= await db.execute("select * from refresh_tokens where token_hash = ?",[tokenhash]);
    if(row.length==0){
        return res.status(401).json({
            message:"invalid refresh token"
        })
    }
    const tokenExpiry= new Date(row[0].expires_at);
    if(tokenExpiry<new Date()){
        return res.status(401).json({
            message:"refresh token expired"
        })
    }
    const storedToken= row[0];
    if(storedToken.revoked_at!==null){
        await db.execute("update refresh_tokens set revoked_at = ? where family_id = ?",[new Date(),storedToken.family_id]);
        return res.status(401).json({
            message:"refresh token revoked"
        })
    }
    //generate new JWT
    const [userRow]= await db.execute("select * from users where id = ?",[row[0].user_id]);
    if(userRow.length==0){
        return res.status(404).json({
            message:"user not found"
        })
    }
    const token= jwt.sign(
        {
            id: userRow[0].id,
            email: userRow[0].email
        },
        process.env.JWT_SECRET,
         {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m"
         }
    )
    const refreshTokenNew= crypto.randomBytes(64).toString("hex");
    const tokenhashNew= crypto.createHash("sha256").update(refreshTokenNew).digest("hex");
    const tokenExpiryNew= new Date(Date.now() + 7*24*60*60*1000); // 7 days from now

    await db.execute("insert into refresh_tokens (user_id, refresh_tokens, token_hash, family_id, expires_at) VALUES (?, ?, ?, ?, ?)",
        [userRow[0].id,refreshTokenNew,tokenhashNew,storedToken.family_id,tokenExpiryNew]);

    await db.execute("update refresh_tokens set revoked_at = ? where id = ?",[new Date(),storedToken.id]);  
    return res.status(200).json({
        message:"token refreshed successfully",
        token: token,
        refreshToken: refreshTokenNew
    })          

})


module.exports= router;