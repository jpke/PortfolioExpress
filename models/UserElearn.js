var mongoose = require('mongoose'), Schema = mongoose.Schema
var bcrypt = require('bcryptjs')
// var Course = require('./Course')

// var Course = new Schema({
//   course: {
//     _id: {
//       type: Schema.Types.ObjectId,
//       ref: 'Courses'
//     }
// })

var UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  courses: [{type: Schema.Types.ObjectId, ref: 'Course'}],
  passed: [{type: Schema.Types.ObjectId, ref: 'SubmittedItem'}]
})

UserSchema.methods.validatePassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, isValid) {
    if(err) {
      callback(err)
      return
    }
    callback(null, isValid)
  })
}

var UserElearn = mongoose.model('UserElearn', UserSchema)
module.exports = UserElearn
