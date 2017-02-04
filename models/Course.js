var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var Admin = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true
  }
})
//lessons are stored in BOX, their BOX folder ids are stored here
var Lessons = new Schema({
  lesson: {
    type: String,
    required: true
  }
})

var Quiz = new Schema({
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
    type: [Admin],
    required: true
  },
  lessonFolders: [Lessons],
  quizzes: [Quiz]
})

var Course = mongoose.model('Course', CourseSchema)
module.exports = Course
