var mongoose = require('mongoose')

var postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  body: {
    type: String,
    required: true
  }
})

var Post = mongoose.model('Post', postSchema)
module.exports = Post
