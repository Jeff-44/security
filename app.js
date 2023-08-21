//jshint esversion:6
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";





const app = express();
const port = 3000;


// MIDDLEWARES
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// AUTHENTICATION USING EXPRESS-SESSION
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.initialize());
app.use(passport.session());


// DATABASE CONNECTION
(function (){
    try {
        mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
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

// USE PASSPORT-LOCAL-MONGOOSE ON THE USERSCHEMA
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
    res.render("home.ejs");
});

app.route("/register")
    .get((req, res)=>{
        res.render("register.ejs");
    })
    
    .post((req, res)=>{
        
        
    });


app.route("/login")
    .get((req, res)=>{
        res.render("login.ejs");
    })
    
    .post(async (req, res)=>{
        
    });
    
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});
