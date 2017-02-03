var mongoose = require('mongoose')

var AnswersSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  }
})

var QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answers : [AnswersSchema],
  idSelected: mongoose.Schema.Types.ObjectId,
  itemSelected: Number,
  correct: Boolean
})

var SubmittedQuiz = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  submitted: {
    type: Date,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  quiz: {
    type: [QuestionSchema],
    required: true
  }
})

var QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  items: {
    type: [QuestionSchema]
  },
  minimumScore: {
    type: Number,
    required: true
  },
  submitted: {
    type: [SubmittedQuiz],
    required: false
  }
})

var Quiz = mongoose.model('Quiz', QuizSchema)
module.exports = Quiz
