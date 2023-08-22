//jshint esversion:6
// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import ejs from "ejs";
// import mongoose from "mongoose";
// import session from "express-session";
// import passport from "passport";
// import passportLocalMongoose from "passport-local-mongoose";
// import gs from "passport-google-oauth20";
// import findOrCreate from "mongoose-findorcreate";



// -----------------------------------------------------------------
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

// -----------------------------------------------------------------
const app = express();
const port = 3000;
// const GoogleStrategy = gs.Strategy;


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
    password: String,
    googleId: String
});

// USE PASSPORT-LOCAL-MONGOOSE ON THE USERSCHEMA
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// OAUTH FEATURE ADDED
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_CODE,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", (req, res)=>{
    res.render("home.ejs");
});

app.get("/auth/google", (req, res)=>{
    try {
        passport.authenticate("google", {scope: ["profile"]});
        console.log("Successfully logged in with google");
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
});

app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res)=>{
        res.redirect("/secrets");
    }
);

app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets.ejs");
    }else{
        res.redirect("/login");
    }
});

app.route("/register")
    .get((req, res)=>{
        res.render("register.ejs");
    })
    
    .post(async (req, res)=>{
        User.register({username: req.body.username}, req.body.password, function(error, user){
            if(error){
                console.log(error);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req, res, ()=>{
                    res.redirect("/secrets");
                });
            }
        });
    });


app.route("/login")
    .get((req, res)=>{
        res.render("login.ejs");
    })
    
    .post(async (req, res)=>{
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(error){
            if(error){
                console.log(error);
                res.redirect("/login");
            }else{
                res.redirect("/secrets");
            }
        });
    });

app.get("/logout", (req, res)=>{
    req.logout(function(error){
        if(!error){
            console.log("Logout successfully!!!");
            res.redirect("/");
        }else{
            console.log(error);
        }
    });
    
});
    
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});
