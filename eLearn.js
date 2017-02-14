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
// var quizData = require('./quizData')
// var rQuiz = Quiz.find({}).remove().exec()
// .then(function(){
//   return Course.find({}).remove().exec();
// })
// .then(function() {
//   return UserElearn.findOne({email: "jpearnest08@gmail.com"}).exec()
// })
// .then(function(user) {
//   var course = new Course();
//   course.name = "Default Course";
//   course.admin = user._id;
//   return course.save().then(function(course) {return [user, course]});
// })
// .then(function(state) {
//   // console.log(state[0]._id, state[1].admin[0]);
//   var user = state[0];
//   var course = state[1];
//   user.courses.push(course._id);
//   return user.save().then(function(user) {
//     state[0] = user;
//     return state;
//   });
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
              user.save(function(err, user) {
                  if (err) {
                    console.log("Mongoose: ", err)
                      return res.status(500).json({
                          message: 'Internal server error'
                      });
                  }
                  console.log("user: ", user);
                  var token = jwt.sign({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    courses: user.courses
                  }, TOKENSECRET, {
                    expiresIn: "24h"
                  });
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
      console.log("user: ", {
        _id: user._id,
        name: user.name,
        email: user.email,
        courses: user.courses
      });
      var token = jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        courses: user.courses
      }, TOKENSECRET, {
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

router.put('/quiz', jsonParser, passport.authenticate('bearer', {session: false}), function(req, res) {
  console.log("save quiz request received");
  var course = req.user.courses.find(function(course) {
    if(course._id === req.body.courseID) return true;
  });
  var admin = course.admin.find(function(admin) {
    if(admin === req.user._id) return true;
  });
  if(!admin) return res.status(401).json({message: "only admin can alter course"});

  var quiz = req.body.quiz;
  console.log("quiz to save: ", quiz);
  if(quiz.courses[0] === "undefined") quiz.courses[0] = {id: req.body.courseID};
  if(!quiz._id || quiz._id == null) {
    var newQuiz = new Quiz();
    newQuiz.title = quiz.title;
    newQuiz.courses = quiz.courses;
    newQuiz.items = quiz.items;
    newQuiz.minimumScore = quiz.minimumScore;
    newQuiz.live = quiz.live
    newQuiz.save()
    .then(function(quiz) {
      console.log("quiz id: ", quiz._id);
      return Course.findOne({_id: course._id}).populate({
                path: 'quizzes',
                select: '_id, title'
              }).exec()
      .then(function(courseToUpdate) {
        courseToUpdate.quizzes.push({_id: quiz._id, title: quiz.title});
        return courseToUpdate.save();
      })
      .then(function(course) {
        course.admin = true;
        return [quiz, course]
      });
    })
    .then(function(state) {
      console.log("quiz created, sending response...", state);
      console.log("quiz id: ", state[0]._id);
      return res.status(201).json(state);
    }).catch(function(err) {
      console.log("error: ", err);
      return res.status(500).json("Internal server error");
    })
  } else {
    Quiz.findOneAndUpdate({_id: quiz._id}, {
      title: quiz.title,
      courses: quiz.courses,
      items: quiz.items,
      minimumScore: quiz.minimumScore,
      live: quiz.live
    }, {new: true}, function(err, quiz) {
      if(err) {
        console.log('Mongo error ', err)
        return res.status(500).json('Internal Server Error')
      }
      console.log("quiz id: ", quiz._id);
      console.log("quiz updated, sending response...", "quiz: ", quiz, "course: ", course);
      return res.status(201).json([quiz, course]);
    });
  }
});

router.delete('/quiz/:quizId/:courseId', passport.authenticate('bearer', {session:false}), function(req, res) {
  console.log("token data: ", req.user, req.user.courses[0].admin);
  var course = Course.findOneAndUpdate({_id: req.params.courseId},
      { $pull: {
        quizzes: {$in: [req.params.quizId]}
      }
    }).exec()
    course.then(function(course) {
      console.log("course quizzes: ", course.quizzes);
      return Quiz.remove({_id: req.params.quizId}).exec();
    })
    .then(function(quiz) {
      console.log("quiz removed: ", quiz.result);
      return Quiz.findOne({_id: req.params.quizId}).exec()
    })
    .then(function(quiz){
      if(quiz) {
        throw new err;
        console.log("quiz still there: ", quiz);
      }
    })
    .then(function() {
      return UserElearn.findOne({email: req.user.email})
      .populate({
        path: 'courses',
        populate: {
          path: 'quizzes',
          select: '_id, title'
        }
      })
      .exec()
    })
    .then(function(user) {
      res.status(200).json({courses: user.courses});
    })
    .catch(function(err) {
      if(err) {
        console.log("error: ", err);
        res.status(500).json("Internal server error");
      }
    })
});

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
