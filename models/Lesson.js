var mongoose = require('mongoose')

var LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  lesson: {
    type: "string",
    required: true
  }
})

var Lesson = mongoose.model('Lesson', LessonSchema)
module.exports = Lesson
