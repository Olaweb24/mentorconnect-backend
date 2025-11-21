const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  mentor: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
