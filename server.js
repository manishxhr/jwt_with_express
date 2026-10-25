const express= require("express");
const authRoutes = require("./auth");
const app= express();
app.use(express.json());

app.use((req,res,next)=>{
    console.log("middleware called");
    next();
})

// Mount authentication routes
app.use("/auth", authRoutes);


app.get("/",(req,res)=>{
    res.send({
        "message": "testing server with url"
    })
})




app.listen(2001,()=>{
    console.log("server started at 2001");
})