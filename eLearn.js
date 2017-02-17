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
var PDFDocument = require('pdfkit')

var prettyjson = require('prettyjson')

var Course = require('./models/Course')
var Enrollable = require('./models/Enrollable')
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
  });


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
router.use(express.static('build'));

// Quiz.find({}).exec().then(function(quiz) {
//   console.log("quizzes: ", quiz);
// })

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
  var name = req.body.name
  var email = req.body.email
  var password = req.body.password
  UserElearn.findOne({email: email}, function(err, user) {
    if (err) {
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
    if(user != null) {
      return res.status(400).json({
        message: "email already associated with an account"
      });
    }
    bcrypt.genSalt(10, function(err, salt) {
          if (err) {
              return res.status(500).json({
                  message: 'Internal server error'
              });
          }
          bcrypt.hash(password, salt, function(err, hash) {
              if (err) {
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
                      return res.status(500).json({
                          message: 'Internal server error'
                      });
                  }
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

router.get('/users/certificate/:course/:token', function(req, res) {
  if(req.params.token) {
    jwt.verify(req.params.token, TOKENSECRET, function(err, decoded) {
      if(err) {
        console.log("err: ", err)
        res.status(401).json({message: "unauthorized"})
      } else {
        var token = decoded;
        var doc = new PDFDocument({layout: 'landscape'});
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
           'Access-Control-Allow-Origin': '*',
           'Content-Disposition': 'inline; filename=Untitled.pdf'
        });
        doc.pipe(res)
        doc.image('utilities/Certificate.jpg', (doc.page.width - 720)/2)
        doc.font('Times-Roman')
        doc.fontSize(30)
        doc.text(token.name, {align: 'center'}, 250)
        doc.fontSize(20)
        doc.text(req.params.course, {align: 'center'}, 450)
        doc.end()
      }
    })
  } else {
    res.status(401).json({message: "unauthorized"});
  }
})

// router.get('/users/certificate', function(req, res) {
//   // console.log("token data: ", req.user.name);
//   var doc = new PDFDocument({layout: 'landscape'});
//   res.writeHead(200, {
//     'Content-Type': 'application/pdf',
//      'Access-Control-Allow-Origin': '*',
//      'Content-Disposition': 'inline; filename=Untitled.pdf'
//   });
//   doc.pipe(res)
//   doc.image('utilities/Certificate.jpg', (doc.page.width - 720)/2)
//   doc.font('Times-Roman')
//   doc.fontSize(30)
//   doc.text("user name here", {align: 'center'}, 250)
//   doc.fontSize(20)
//   doc.text("This Course", {align: 'center'}, 450)
//   doc.end()
// })


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
  .populate('passed', 'of')
  .exec()
  .then(function(user) {
    if(!user) return res.status(400)
    user.validatePassword(password, function(err, isValid) {
      if(err) {
        return res.status(400).json({message: 'Invalid token'})
      }
      if(!isValid) {
        return res.status(400).json({message: 'Incorrect password'})
      }
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
        passed: user.passed,
        token: token
      });
    })
  })
  .catch(function(err) {
    return res.status(500).json({message: 'Internal server error'})
  });
})

router.get('/course/enrollable/:course_id', passport.authenticate('bearer', {session: false}), function(req, res) {
  var course_id = req.params.course_id;
  var courseInToken = req.user.courses.find(function(courseInToken) {
    if(courseInToken._id === course_id) return true;
  });
  var admin = courseInToken.admin.find(function(admin) {
    if(admin === req.user._id) return true;
  });
  if(!admin) return res.status(401).json({message: "only course admin can see enrolled users"});
  Enrollable.find({course_id: course_id}).exec()
  .then(function(enrollable) {
    return res.status(200).json({enrollable: enrollable});
  })
  .catch(function(err) {
    console.log('Mongo error ', err)
    return res.status(500).json('Internal Server Error')
  });
});

router.post('/course/enrollable', jsonParser, passport.authenticate('bearer', {session: false}), function(req, res) {
  var course_id = req.body.course_id;
  var courseInToken = req.user.courses.find(function(courseInToken) {
    if(courseInToken._id === course_id) return true;
  });
  var admin = courseInToken.admin.find(function(admin) {
    if(admin === req.user._id) return true;
  });
  if(!admin) return res.status(401).json({message: "only admin can alter course"});
  var enrolled = new Enrollable();
  enrolled.email = req.body.email;
  enrolled.course_id = course_id;
  enrolled.admin = req.body.admin;
  enrolled.save()
  .then(function(enrolled) {
    return Enrollable.find({course_id: course_id}).exec();
  })
  .then(function(enrollable) {
    return res.status(201).json({enrollable: enrollable});
  })
  .catch(function(err) {
    console.log('Mongo error ', err)
    return res.status(500).json('Internal Server Error')
  });
});

router.delete('/course/enrollable', jsonParser, passport.authenticate('bearer', {session: false}), function(req, res) {
  var course_id = req.body.course_id;
  var courseInToken = req.user.courses.find(function(courseInToken) {
    if(courseInToken._id === course_id) return true;
  });
  var admin = courseInToken.admin.find(function(admin) {
    if(admin === req.user._id) return true;
  });
  if(!admin) return res.status(401).json({message: "only admin can alter course"});
  Enrollable.findOne({email: req.body.email, course_id: course_id}).remove().exec()
  .then(function(removedUser) {
    return Enrollable.find({course_id: course_id}).exec();
  })
  .then(function(enrollable) {
    return res.status(200).json({enrollable: enrollable});
  })
  .catch(function(err) {
    console.log('Mongo error ', err)
    return res.status(500).json('Internal Server Error')
  });
});

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
  if(quiz.courses[0] === "undefined") quiz.courses[0] = {id: req.body.courseID};
  console.log('quiz._id: ', quiz._id);
  console.log(!quiz._id || quiz._id == null);
  if(!quiz._id || quiz._id == null) {
    var newQuiz = new Quiz();
    newQuiz.title = quiz.title;
    newQuiz.courses = quiz.courses;
    newQuiz.items = quiz.items;
    newQuiz.minimumScore = quiz.minimumScore;
    newQuiz.live = quiz.live
    newQuiz.save()
    .then(function(quiz) {
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
      console.log("quiz created, sending response...");
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
    }, {new: true, upsert: true}, function(err, quiz) {
      if(err) {
        console.log('Mongo error ', err)
        return res.status(500).json('Internal Server Error')
      }
      console.log("quiz updated, sending response...");
      Course.findOne({_id: course._id}).populate({
                    path: 'quizzes',
                    select: '_id, title'
                  }).exec()
      .then(function(course) {
        course.admin = true;
        return res.status(201).json([quiz, course]);
      })
      .catch(function(err) {
        if(err) console.log("Mongo error: ", err);
        return res.status(500).json('Internal Server Error');
      });
    });
  }
});

router.delete('/quiz/:quizId/:courseId', passport.authenticate('bearer', {session:false}), function(req, res) {
  var course = Course.findOneAndUpdate({_id: req.params.courseId},
      { $pull: {
        quizzes: {$in: [req.params.quizId]}
      }
    }).exec()
    course.then(function(course) {
      return Quiz.remove({_id: req.params.quizId}).exec();
    })
    .then(function(quiz) {
      return Quiz.findOne({_id: req.params.quizId}).exec()
    })
    .then(function(quiz){
      if(quiz) {
        throw new err;
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
    return Quiz.findOne({_id: submission.of}).exec()
    .then(function(quiz) {
      console.log("sub and quiz: ", submission.score, quiz.minimumScore);
      if(submission.score >= quiz.minimumScore) {
        return [submission, true]
      } else {
        return [submission, false]
      }
    })
  })
  .then(function(state) {
    if(state[1]) {
      return UserElearn.findOne({_id: req.body.user_Id}).exec()
      .then(function(user) {
        user.passed.push(state[0]._id);
        return user.save()
        .then(function(user) {
          return state;
        })
      })
    }
    else {
      return state;
    }
  })
  .then(function(state) {
    return res.status(200).json({
      message: "quiz submitted",
      score: state[0].score,
      attempt: state[0],
      passed: state[1]
    })
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
    console.log("loading BOX lessons");
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

router.get('*', function(req, res) {
  console.log("endpoint hit");
  console.log(express.static('build'))
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//for file upload- work in progress
router.post('/lessons',
  function(req, res) {
    console.log("file?: ", req.post);
    res.status(201);
  }
)

module.exports = router
