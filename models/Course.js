var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CourseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  admin: {
    type: [{type: Schema.Types.ObjectId, required: true}],
    required: true
  },
  lessonFolders: [{type: String, required: true}],
  quizzes: [{type: Schema.Types.ObjectId, ref: 'Quiz'}]
})

var Course = mongoose.model('Course', CourseSchema)
module.exports = Course
