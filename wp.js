// var express = require('express')
// var router = express.Router()
// var passport = require('passport')
// var WordpressStrategy = require('passport-wordpress').Strategy
// var bodyParser = require('body-parser')
// var fetch = require('isomorphic-fetch')
// var fs = require('fs')
// require("dotenv").config({silent: true});
//
// passport.use(new WordpressStrategy({
//     clientID: process.env.WP_CLIENT_ID,
//     clientSecret: process.env.WP_CLIENT_SECRET,
//     callbackURL: process.env.WP_CALLBACK_URL
//   },
//   function(accessToken, refreshToken, profile, done) {
//     console.log("access Token: ", accessToken, "refresh Token: ", refreshToken, "profile: ", profile);
//     return done(profile);
//   }
// ));
//
// router.get('/', function(req, req) {
//   res.json({message: "root wp endpoint. if you see this, auth went wrong"});
// })
//
// router.get('/posts', passport.authenticate())
//
// router.get('/auth', passport.authorize('wordpress'));
//
// router.get('/redirect',
//   passport.authorize('wordpress', {failureRedirect: "/"}),
//   function(res, res) {
//     console.log("wp auth success", res.user);
//     res.json({message: "wp auth success"});
// });
//
// module.exports = router
