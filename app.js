//jshint esversion:6
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";




const app = express();
const port = 3000;
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

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

const User = mongoose.model("User", userSchema);

app.get("/", (req, res)=>{
    res.render("home.ejs");
});

app.route("/register")
    .get((req, res)=>{
        res.render("register.ejs");
    })
    
    .post((req, res)=>{
        const username = req.body.username;
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            email: username,
            password: hash
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
        
        try {
            const foundUser = await User.findOne({email: username});

            if(foundUser){
               if(bcrypt.compareSync(req.body.password, foundUser.password)){ 
                    res.render("secrets.ejs");
                }else{
                    res.send("Password does not match");
                }

            }else{
                res.send("User does not exist");
            }
            
        } catch (error) {
            res.send(error.message);
        }
    });
    
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});
