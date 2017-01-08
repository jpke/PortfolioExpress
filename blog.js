var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var passport = require('passport')
var bcrypt = require('bcryptjs')
var Strategy = require('passport-http-bearer').Strategy
var Post = require('./models/Post')
var User = require('./models/User')

require("dotenv").config({silent: true});
var DATABASE_URI = process.env.DATABASE_URI
var TOKENSECRET = process.env.SECRET

var jsonParser = bodyParser.json()

passport.serializeUser(function(user, done) {
  done(null, user)
})
passport.deserializeUser(function(user, done) {
  done(null, user)
})
passport.use(new Strategy(
  function(token, done) {
    if(token) {
      jwt.verify(token, TOKENSECRET, function(err, decoded) {
        if(err) {
          return done(err)
        }
        return done(null, decoded, {scope: 'all'})
      })
    } else {
      return done(null, false)
    }
  }
))
app.use(passport.initialize())
// User.find({}).remove().exec()
// Post.find({}).remove().exec()
app.post('/users', jsonParser, function(req,res) {
  console.log(req.body)
  var name = req.body.name
  var email = req.body.email
  var password = req.body.password
  bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          console.log(err)
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
              console.log("!!!", err)
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }
            var user = new User({
                name: name,
                email: email,
                password: hash
            });

            user.save(function(err) {
                if (err) {
                  console.log("Mongoose: ", err)
                    return res.status(500).json({
                        message: 'Internal server error'
                    });
                }
                var token = jwt.sign(user, TOKENSECRET, {
                  expiresIn: "24h"
                })
                return res.status(201).json({
                  sucess: true,
                  message: 'Token created',
                  token: token
                });
            });
        });
    });
})

app.get('/users', passport.authenticate('bearer', {session: false}), function(req, res) {
  return res.status(200).json({message: "Token validated"})
})

app.post('/login', jsonParser, function(req, res) {
  console.log('Login endpoint accessed')
  var password = req.body.password
  User.findOne({email: req.body.email}, function(err, user) {
    console.log('return from mongo', user)
    if(err) return res.status(500).json({message: 'Internal server error'})
    if(!user) return res.status(400)
    user.validatePassword(password, function(err, isValid) {
      if(err) {
        console.log("bcrypt error: ", err)
        return res.status(400)
      }
      if(!isValid) {
        console.log('password incorrect')
        return res.status(400).json({message: 'Incorrect password'})
      }
      var token = jwt.sign(user, TOKENSECRET, {
        expiresIn: "24h"
      })
      console.log('validated response sent')
      return res.status(200).json({
        sucess: true,
        message: 'Token created',
        token: token
      });
    })
  })
})

app.get('/posts', function(req, res) {
  Post.find({}, function(err, posts) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      return res.status(500).json('Internal Server Error')
    }
    return res.status(200).json(posts)
  })
})

app.post('/posts', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
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

module.exports = router

// console.log("DATABASE ", process.env.DATABASE_URI || 'mongodb://<database name>')
// mongoose.connect(process.env.DATABASE_URI || 'mongodb://<database name>').then(function() {
//   var PORT = process.env.PORT || 8080
//   app.listen(PORT)
//   console.log("Server is listening on ", PORT)
//   var data = [{data: 1, name: 'JP'}, {data: 2, name: 'Ray'}]
//   console.log(prettyjson.render(data))
// }).catch(function(error) {
//   console.log("Server error: ", error)
// })
