var mongoose = require('mongoose'), Schema = mongoose.Schema
var Item = require('./Quiz').Item
var Answer = require('./Quiz').Answer

var SubmittedItemSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'UserElearn',
    required: true
  },
  of: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz'
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

var SubmittedItem = mongoose.model('SubmittedItem', SubmittedItemSchema)
module.exports = SubmittedItem
