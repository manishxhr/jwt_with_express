const express= require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authRoutes = require("./auth");

const app= express();
app.use(express.json());

// Mount authentication routes
app.use("/auth", authRoutes);

app.use((req,res,next)=>{
    // console.log("middleware called");
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message:"Authorization header missing"
        })
    }
    const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});


app.get("/lib",(req,res)=>{
    res.send({
        "message": "testing server with url",
        "name":"test usrre"
    })
})




app.listen(2000,()=>{
    console.log("server started at 2000");
})