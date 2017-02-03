var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

var CoursesSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    required: true
  }
})

var UserSchema = new mongoose.Schema({
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
  courses: [CoursesSchema]
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
