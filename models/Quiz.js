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
  user: mongoose.Schema.Types.ObjectId,
  taken: {
    type: Array
  },
  passed: {
    type: Boolean
  }
})

var Quiz = mongoose.model('Quiz', QuizSchema)
module.exports = Quiz
