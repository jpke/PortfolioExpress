var mongoose = require('mongoose')
var Schema = mongoose.Schema;
// var Course = require('./Course')

//lessons are stored in BOX, their BOX folder ids are stored here
var LessonFolder = new Schema({
  lesson: {
    type: String,
    required: true
  }
})

var QuizCourse = new Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
  }
})

var CourseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    required: true
  },
  lessonFolders: [LessonFolder],
  quizzes: [QuizCourse]
})

var Course = mongoose.model('Course', CourseSchema)
module.exports = Course
