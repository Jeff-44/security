//jshint esversion:6
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";



const app = express();
const port = 3000;
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


// DATABASE CONNECTION
(function (){
    try {
        mongoose.connect("mongodb://127.0.0.1:27017/userDB");
        console.log("Successfully connected to the userDB");
    } catch (error) {
        console.log(error);
    }
})();

// USER SCHEMA || MODEL
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);


app.get("/", (req, res)=>{
    res.render("home.ejs");
});

app.route("/register")
    .get((req, res)=>{
        res.render("register.ejs");
    })
    
    .post((req, res)=>{
        const username = req.body.username
        const password = req.body.password

        const newUser = new User({
            email: username,
            password: password
        });

        try {
            newUser.save();
            console.log("User successfully saved in database");
            res.render("secrets.ejs");
        } catch (error) {
            console.log("Error in registering new user: " + error);
            res.send(error.message);
        }
        
    });

app.route("/login")
    .get((req, res)=>{
        res.render("login.ejs");
    })
    
    .post(async (req, res)=>{
        const username = req.body.username;
        const password = req.body.password;

        try {
            const foundUser = await User.findOne({email: username});
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets.ejs");
                }
            }
            
        } catch (error) {
            res.send(error.message);
        }
    });

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});