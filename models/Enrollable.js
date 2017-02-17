var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EnrollableSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
  },
  admin: Boolean
})

var Enrollable = mongoose.model('Enrollable', EnrollableSchema)
module.exports = Enrollable
