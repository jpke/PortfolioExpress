var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var passport = require('passport')
var bcrypt = require('bcryptjs')
var Strategy = require('passport-http-bearer').Strategy

var UserElearn = require('./models/UserElearn')
var Quiz = require('./models/Quiz')
var quizData = require('./quizData')

require("dotenv").config({silent: true});
var TOKENSECRET = process.env.SECRET

var jsonParser = bodyParser.json()

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
router.use(passport.initialize())

// Seed database
// Quiz.create({title: "default quiz", created: new Date, quiz: quizData}, function(err, quiz) {
//   if(err) console.log("err ", err);
//   console.log('Quiz created: ', quiz);
// })

router.post('/users', jsonParser, function(req,res) {
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
            var user = new UserElearn({
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

router.get('/users', passport.authenticate('bearer', {session: false}), function(req, res) {
  return res.status(200).json({message: "Token validated"})
})

router.post('/login', jsonParser, function(req, res) {
  console.log('elearn Login endpoint accessed')
  var password = req.body.password
  UserElearn.findOne({email: req.body.email}, function(err, user) {
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

router.get('/quiz', passport.authenticate('bearer', {session:false}), function(req, res) {
  Quiz.findOne({}, function(err, quiz) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      return res.status(500).json('Internal Server Error')
    }
    return res.status(200).json(quiz)
  })
})

router.post('/quiz', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
  Quiz.create({
    title: req.body.title,
    created: new Date,
    quiz: req.body.quiz,
    user: req.body.user,
    taken: new Date,
    passed: req.body.passed
    }, function(err, post) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      res.status(500).json('Internal Server Error')
    }
    return res.status(200).json(post)
  })
})

router.delete('/quiz', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
  Quiz.remove({_id: req.body._id}, function(err, post) {
    if(err) res.status(501).json({"message": "internal server error"});

    res.status(200).json("quiz deleted");
  })
})

module.exports = router
