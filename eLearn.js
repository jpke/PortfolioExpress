var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var passport = require('passport')
var bcrypt = require('bcryptjs')
var Strategy = require('passport-http-bearer').Strategy
var BoxSDK = require('box-node-sdk')
var fs = require('fs')
var path = require('path')
var base64url = require('base64url')
var uuid = require('uuid')

var UserElearn = require('./models/UserElearn')
var Quiz = require('./models/Quiz')
var Lesson = require('./models/Lesson')
var quizData = require('./quizData')

require("dotenv").config({silent: true});
var TOKENSECRET = process.env.SECRET
var KID = process.env.KID;
var CLIENT_ID = process.env.BOX_CLIENT_ID;
var CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
var PUBLIC_KEY_ID = process.env.BOX_PUBLIC_KEY_ID;
// var PRIVATE_KEY = process.env.BOX_PRIVATE_KEY;
var PRIVATE_KEY_PASSPHRASE = process.env.BOX_PRIVATE_KEY_PASSPHRASE;
var APP_ID = process.env.BOX_APP_ID;
var ENTERPRISE_ID = process.env.ENTERPRISE_ID;

// var uniqueID = uuid();
// fs.readFile("private_key.pem", 'utf-8', function(err, PRIVATE_KEY) {
//   console.log("KEY: ", PRIVATE_KEY);
  // var claims = {
  //     "iss": CLIENT_ID,
  //     "sub": ENTERPRISE_ID,
  //     "box_sub_type": "enterprise",
  //     "aud": "https://api.box.com/oauth2/token",
  //     "jti": uuid(),
  //     "exp": Date.now() / 1000 | 0 + 60
  // };
  // var options = {
  //   algorithm: 'RS256',
  //   header: {
  //     "alg": "RS256",
  //     "typ": "JWT",
  //     "kid": APP_ID
  //   }
  // };
  // var key = {
  //   key: PRIVATE_KEY,
  //   passphrase: PRIVATE_KEY_PASSPHRASE
  // };
  // var token = jwt.sign(claims, key, options);
  // console.log("token generated: ", token);

var PRIVATE_KEY = fs.readFileSync("private_key.pem", 'utf-8');
  var sdk = new BoxSDK({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    appAuth: {
      keyID: PUBLIC_KEY_ID,
      privateKey: PRIVATE_KEY,
      passphrase: PRIVATE_KEY_PASSPHRASE
    }
  });

  var box = sdk.getAppAuthClient('enterprise', ENTERPRISE_ID);

  box.users.get(box.CURRENT_USER_ID, null, function(err, currentUser) {
    if(err) console.log("error: ", err);
    // console.log("currentUser: ", currentUser);
  });

  // box.folders.create('0', "newFolder", function(err, data) {
  //   if(err) console.log("error: ", err);
  //   if(data) console.log("data: ", data);
  //   console.log("complete");
  // })

  // var stream = fs.createReadStream(path.resolve(__dirname, 'Example PDF.pdf'));

  // box.files.uploadFile('18155048374', "Example PDF2.pdf", stream, function(err, data) {
  //   if(err) console.log("error: ", err);
  //   if(data) console.log("data: ", data);
  //   console.log("complete");
  // })

  // box.files.update("130865866472", {shared_link: box.accessLevels.DEFAULT}, function(err, link) {
  //     if(err) console.log("error: ", err);
  //     if(link) console.log("data: ", link);
  //     console.log("complete");
  // })

//   box.folders.get(
//     '0',
//     {fields: 'name,shared_link,permissions,collections,sync_state'},
//     function(err, link) {
//         if(err) console.log("error: ", err);
//         if(link) console.log("data: ", link);
//         console.log("complete");
//     }
// );

box.folders.getItems(
    '18155048374',
    {
        fields: 'name,modified_at,size,url,permissions,sync_state',
        offset: 0,
        limit: 25
    },
    function(err, link) {
            if(err) console.log("error: ", err);
            if(link) console.log("data: ", link);
            console.log("complete");
        }
);

  // box.files.getReadStream('130861063664', null, function(err, stream) {
  //   if(err) console.log("error: ", error);
  //   var output = fs.createWriteStream('/Users/JP/Desktop/Apps/testDownload.pdf');
  //   stream.pipe(output);
  // })
  // console.log(__dirname);

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

// Quiz.find({}).remove().exec()
// // Seed database
// Quiz.create({title: "default quiz", created: new Date, quiz: quizData}, function(err, quiz) {
//   if(err) console.log("err ", err);
//   console.log('Quiz created: ', quiz);
// })

router.post('/users', jsonParser, function(req,res) {
  console.log("body: ",req.body)
  var name = req.body.name
  var email = req.body.email
  var password = req.body.password
  UserElearn.findOne({email: email}, function(err, user) {
    if (err) {
      console.log("Mongoose: ", err)
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
    if(user != null) {
      console.log("user found by email: ", user);
      return res.status(400).json({
        message: "email already associated with an account"
      });
    }
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

              user.save(function(err, user) {
                  if (err) {
                    console.log("Mongoose: ", err)
                      return res.status(500).json({
                          message: 'Internal server error'
                      });
                  }
                  var token = jwt.sign(user, TOKENSECRET, {
                    expiresIn: "24h"
                  })
                  console.log("user: ", user._id);
                  return res.status(201).json({
                    sucess: true,
                    _id: user._id,
                    message: 'Token created',
                    token: token
                  });
              });
          });
      });
  })
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
        _id: user._id,
        userName: user.name,
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

router.post('/quiz/submit', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
  // console.log("params ", req.params);

  Quiz.create({
    title: req.body.title,
    created: new Date,
    quiz: req.body.quiz,
    instanceOf: req.body.instanceOf,
    user: req.body.user,
    score: req.body.score
    }, function(err, post) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      res.status(500).json('Internal Server Error')
    }
    return res.status(200).json({message: "quiz submitted"})
  })
})

router.delete('/quiz', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
  Quiz.remove({_id: req.body._id}, function(err, post) {
    if(err) res.status(501).json({"message": "internal server error"});

    res.status(200).json("quiz deleted");
  })
})


//seed lessons
// Lesson.create({title: "default lesson", created: new Date, lesson: "path to pdf"}, function(err, lesson) {
//   if(err) console.log("err ", err);
// });

//link to Box
// var privateKey = fs.readFile("private_key.pem");

CLIENT_ID = CLIENT_ID;
CLIENT_SECRET = CLIENT_SECRET;
PUBLIC_KEY_ID = PUBLIC_KEY_ID;
// PRIVATE_KEY = PRIVATE_KEY;
PRIVATE_KEY_PASSPHRASE = PRIVATE_KEY_PASSPHRASE;

// var sdk = new BoxSDK({
//   clientID: CLIENT_ID,
//   clientSecret: CLIENT_SECRET,
//   appAuth: {
//     keyID: PUBLIC_KEY_ID,
//     privateKey: PRIVATE_KEY,
//     passphrase: PRIVATE_KEY_PASSPHRASE
//   }
// });
//
// var box = sdk.getAppAuthClient('enterprise', ENTERPRISE_ID);
//
// box.users.get(box.CURRENT_USER_ID, null, function(err, currentUser) {
//   if(err) console.log("error: ", err);
//   console.log("currentUser: ", currentUser);
// });

router.get('/lessons',  function(req, res) {
  Lesson.find({}, function(err, lessons) {
    if(err) {
      console.log("Mongo ERROR: ", err)
      return res.status(500).json('Internal Server Error')
    }
    return res.status(200).json(lessons)
  });
})

module.exports = router
