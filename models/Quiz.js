var mongoose = require('mongoose'), Schema = mongoose.Schema

// lessons store in BOX, can reference their ids and titles here for quiz submission records
var Course = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessons: [{id: String, title: String}]
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
  live: Boolean
})

var Quiz = mongoose.model('Quiz', QuizSchema)
module.exports = {
  Quiz: Quiz,
  Item: Item,
  Answer: Answer,
}
