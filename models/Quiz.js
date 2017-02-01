var mongoose = require('mongoose')

var QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  quiz: {
    type: Array,
    required: true
  },
  instanceOf: mongoose.Schema.Types.ObjectId,
  user: mongoose.Schema.Types.ObjectId,
  score: {
    type: Number
  }
})

var Quiz = mongoose.model('Quiz', QuizSchema)
module.exports = Quiz
