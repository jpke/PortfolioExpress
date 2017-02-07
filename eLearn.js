var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
// var cookieParser = require('cookie-parser')
var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var jwt = require('jsonwebtoken')
var passport = require('passport')
var bcrypt = require('bcryptjs')
var Strategy = require('passport-http-bearer').Strategy
var BoxSDK = require('box-node-sdk')
var fs = require('fs')
var path = require('path')

var prettyjson = require('prettyjson')

var Course = require('./models/Course')
var UserElearn = require('./models/UserElearn')
var Quiz = require('./models/Quiz').Quiz
var SubmittedItem = require('./models/SubmittedItem')

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


var jsonParser = bodyParser.json()

passport.use(new Strategy(
  function(token, done) {
    // console.log("token: ", token);
    if(token) {
      jwt.verify(token, TOKENSECRET, function(err, decoded) {
        if(err) {
          return done(err)
        }
        // console.log("token decoded: ", decoded);
        return done(null, decoded, {scope: 'all'})
      })
    } else {
      return done(null, false)
    }
  }
))
router.use(passport.initialize())

// seed database, assume default user already created
var quizData = require('./quizData')
// var rQuiz = Quiz.find({}).remove().exec()
// .then(function(){
//   return Course.find({}).remove().exec();
// })
// .then(function() {
//   return UserElearn.findOne({email: "jke5@georgetown.edu"}).exec()
// })
// .then(function(user) {
//   var course = new Course();
//   course.name = "Default Course";
//   course.admin = user._id;
//   return course.save().then(function(course) {return [user, course]});
// })
// .then(function(state) {
//   var user = state[0];
//   var course = state[1];
//   user.courses.push(course._id);
//   return user.save().then(function(user) {
//     state[0] = user;
//     return state;
//   });
// })
// .then(function(state) {
//   var quiz = new Quiz();
//   quiz.title = "Default Quiz";
//   quiz.courses.push({id: state[1]._id});
//   quiz.items = quizData;
//   quiz.minimumScore = 2;
//   return quiz.save().then(function(quiz) {
//     state.push(quiz)
//     return state;
//   });
// })
// .then(function(state) {
//   var user = state[0];
//   var course = state[1];
//   var quiz = state[2];
//   course.name = course.name;
//   course.quizzes.push(quiz._id);
//   return course.save().then(function(course) {
//     state[1] = course;
//     return state;
//   })
// })
// .then(function(stateArray) {
//   console.log("Course updated ", stateArray);
// })
// .catch(function(err) {
//   console.log("error: ", err);
// });

// UserElearn.find({})
//   .populate({
//     path: 'courses',
//     populate: {
//       path: 'quizzes',
//       // match: {name: "Default Course"},
//       select: '_id, name'
//     }
//   })
//   .exec()
//   .then(function(user) {
//     console.log("user courses: ", user);
//     return
//   })
//   .catch(function(err) {
//     console.log("error: ", err);
//   });

// Quiz.findOne({'submitted.user': '589672003c8e134ac1d00000'})
// Quiz.find({})
//   // .populate({
//   //   path: 'submitted',
//   //   match: {user: '589672003c8e134ac1d00000'},
//   // })
//   // .select('submitted')
//   // .submitted
//   // .find({user: "58992e51ade1017d808ce587"})
//   // .where('score').equals(0)
//   .exec()
//   .then(function(quiz) {
//     console.log('Quiz: ', quiz);
//     return
//   })
//   .catch(function(err) {
//     console.log("error: ", err);
//   });

  // Quiz.findOneAndUpdate({_id: "589672003c8e134ac1d93f59"},
  //   {$push:
  //     {submitted:
  //       {
  //         user: "589672003c8e134ac1d00000",
  //         submitted: new Date,
  //         score: 0,
  //         content: quizData
  //       }
  //     }
  //   }, function(err, post) {
  //   if(err) {
  //     console.log("Mongo ERROR: ", err)
  //     // res.status(500).json('Internal Server Error')
  //   } else {
  //     console.log("quiz submitted");
  //     // return res.status(200).json({message: "quiz submitted", score: score})
  //   }
  // });

  // SubmittedItem.find({user: "58993c3c3e83498401234d0d", of: "589672003c8e134ac1d93f59"}).exec()
  // .then(function(quiz) {
  //   console.log('submitted quiz: ', quiz);
  // })
  // .catch(function(err) {
  //   console.log("error: ", err);
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
              var token = jwt.sign(user, TOKENSECRET, {
                expiresIn: "24h"
              })
              user.save(function(err, user) {
                  if (err) {
                    console.log("Mongoose: ", err)
                      return res.status(500).json({
                          message: 'Internal server error'
                      });
                  }
                  console.log("user: ", user);
                  return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    courses: user.courses,
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
  UserElearn.findOne({email: req.body.email})
  .populate({
    path: 'courses',
    populate: {
      path: 'quizzes',
      select: '_id, title'
    }
  })
  .exec()
  .then(function(user) {
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
      // var cookies = new Cookies(req,res);
      // cookies.set("token", token, {httpOnly: false});
      return res.status(302).json({
        _id: user._id,
        name: user.name,
        courses: user.courses,
        token: token
      });
    })
  })
  .catch(function(err) {
    return res.status(500).json({message: 'Internal server error'})
  });
})

router.get('/quiz/:quizId/:userId', passport.authenticate('bearer', {session:false}), function(req, res) {
  console.log("quiz: id: ", req.params.quizId);
  Quiz.find({_id: req.params.quizId}).exec()
  .then(function(quiz) {
    return SubmittedItem.find({user: req.params.userId, of: req.params.quizId})
    .exec()
    .then(function(submitted) {
      return [quiz, submitted];
    });
  })
  .then(function(results) {
    console.log("Quiz sent");
    return res.status(200).json(results)
  })
  .catch(function(err) {
    console.log("Mongo ERROR: ", err)
    return res.status(500).json('Internal Server Error')
  });
})

router.put('/quiz/:quizId/:userId', passport.authenticate('bearer', {session: false}), function(req, res) {
console.log("token decoded: ", prettyjson.render(req.user._doc.admin[0].isAdmin))
  var isAdmin = req.user._doc.admin[0].isAdmin;
  if(!isAdmin) return res.status(401).json('admin privileges needed to edit quizes')
  Quiz.find({_id: req.params.quizId}, function(err, quiz) {
    if(err) {
      console.log('Mongo error ', err)
      return res.status(500).json('Internal Server Error')
    }

  })
})

router.post('/quiz/submit', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
  // console.log("params ", req.params);
  // score
  let quizData = req.body.quizData;
  let score = quizData.map(question => {
    return question.correct ? 1 : 0;
  });
  score = score.reduce((a,b) => {return a + b}, 0);

  var submission = new SubmittedItem;
  submission.user = req.body.user_Id;
  submission.submitted = new Date;
  submission.score = score;
  submission.item = quizData;
  submission.of = req.body.quiz_Id;
  submission.save()
  .then(function(submission) {
    console.log("quiz submitted");
    return res.status(200).json({message: "quiz submitted", score: submission.score})
  })
  .catch(function(err) {
    console.log("Mongo ERROR: ", err)
    res.status(500).json('Internal Server Error')
  })
})

router.delete('/quiz', passport.authenticate('bearer', {session:false}), jsonParser, function(req, res) {
  Quiz.remove({_id: req.body._id}, function(err, post) {
    if(err) res.status(501).json({"message": "internal server error"});

    res.status(200).json("quiz deleted");
  })
})

router.get('/lessons',
  passport.authenticate('bearer',
  {session:false}),
  function(req, res) {
    //box folder id is first arg
  box.folders.getItems(
      '18155048374',
      {
          fields: 'name,modified_at,size,url,sync_state',
          offset: 0,
          limit: 25
      },
      function(err, data) {
          if(err) {
            console.log("error: ", err);
            res.status(500).json('Internal Server Error');
          } else {
            console.log("data: ", data);
            res.status(200).json(data);
          }
      }
  );
})

router.get(
  '/lessons/:id',
  passport.authenticate('bearer', {session:false}),
  function(req, res) {
    box.files.update(
      req.params.id,
      {
        shared_link: box.accessLevels.DEFAULT
      },
      function(err, link) {
        if(err) {
          console.log("error: ", err);
          res.status(500).json('Internal Server Error');
        }
        res.status(200).json({
          selectedPdf: {
                          preview: link.shared_link.url,
                          download: link.shared_link.download_url,
                          name: link.name,
                          id: link.id
                        }
        });
    })
})

//for file upload- work in progress
router.post('/lessons',
  function(req, res) {
    console.log("file?: ", req.post);
    res.status(201);
  }
)

module.exports = router
