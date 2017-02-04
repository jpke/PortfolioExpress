var mongoose = require('mongoose'), Schema = mongoose.Schema
// var UserElearn = require('./UserElearn')
// var Course = require('./Course')

// lessons store in BOX, can reference their ids and titles here for quiz submission records
var Lesson = new Schema({
  id: String,
  title: String
})

var Course = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessons: [Lesson]
})

var Answer = new Schema({
  answer: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  }
})

var Item = new Schema({
  question: {
    type: String,
    required: true
  },
  answers : [Answer],
  idSelected: Schema.Types.ObjectId,
  itemSelected: Number,
  correct: Boolean
})

var SubmittedQuiz = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'UserElearn',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  submitted: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    required: true
  },
  item: {
    type: [Item],
    required: true
  }
})

var QuizSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  courses: [Course],
  items: {
    type: [Item]
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
