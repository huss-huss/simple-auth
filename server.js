const express = require("express");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json())
const users = []

app.get("/users",(req,res)=>{
    res.json(users)
})

app.post("/users",async (req,res)=>{

    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        
        console.log(salt);
        console.log(hashedPassword);
        const user= { name:req.body.name,password:hashedPassword}
       
        users.push(user)
        res.status(201).send()
    } catch{

        res.status(500).send()
    }
    
})

app.post("/users/login",async (req,res)=>{
    const userFound = users.find(user => user.name = req.body.password)
    if(!userFound){
        return res.status(400).send(" U R NOT A USER")
    }

    try {
        if(await bcrypt.compare(req.body.password,userFound.password)){
            res.send("Succesfully logged in");
        }else{
            res.send("Incorrect Password");
        }
        
    } catch {
        res.status(500).send()
    }
})

app.listen(3000,(req,res)=>{
    console.log("server is running on port 3000...");
})