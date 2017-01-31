var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var cors = require('cors');
var prettyjson = require('prettyjson')
var blog = require('./blog')
var medReminder = require('./medReminder')
var eLearn = require('./eLearn')

require("dotenv").config({silent: true});
var DATABASE_URI = process.env.DATABASE_URI
var TOKENSECRET = process.env.SECRET

var app = express()
app.use(cors());
app.use('/blog', blog)
app.use('/med', medReminder)
app.use('/elearn', eLearn)

// console.log("DATABASE ", process.env.DATABASE_URI || 'mongodb://<database name>')
mongoose.connect(process.env.DATABASE_URI || 'mongodb://<database name>').then(function() {
  var PORT = process.env.PORT || 8080
  app.listen(PORT)
  console.log("Server is listening on ", PORT)
  // var data = [{data: 1, name: 'JP'}, {data: 2, name: 'Ray'}]
  // console.log(prettyjson.render(data))
}).catch(function(error) {
  console.log("Server error: ", error)
})
