var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport = require('passport')
var Strategy = require('passport-http-bearer').Strategy
var Post = require('./models/Post')
require("dotenv").config({silent: true});
var DATABASE_URI = process.env.DATABASE_URI

var app = express()
var jsonParser = bodyParser.json()

// passport.serializeUser(function(user, done) {
//   done(null, user)
// })
// passport.deserializeUser(function(user, done) {
//   done(null, user)
// })
// passport.use(new Strategy(
//   function(token, done) {
//     User.findOne({token: token}, function(err, user) {
//       if(err) {return done(err)}
//       if(!user) {return done(null, false)}
//       return done(null, user, {scope: 'all'})
//     })
//   }
// ))
// app.use(passport.initialize())

app.get('/posts', function(req, res) {
  console.log("GET call made to server")
  Post.find({}, function(err, posts) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      return res.status(500).json('Internal Server Error')
    }
    return res.status(200).json(posts)
  })
})

app.post('/posts', jsonParser, function(req, res) {
  Post.create({
    title: req.body.title,
    description: req.body.description,
    body: req.body.body
    }, function(err, post) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      res.status(500).json('Internal Server Error')
    }
    return res.status(200).json(post)
  })
})

console.log("DATABASE ", process.env.DATABASE_URI || 'mongodb://<database name>')
mongoose.connect(process.env.DATABASE_URI || 'mongodb://<database name>').then(function() {
  var PORT = process.env.PORT || 8080
  app.listen(PORT)
  console.log("Server is listening on ", PORT)
}).catch(function(error) {
  console.log("Server error: ", error)
})
