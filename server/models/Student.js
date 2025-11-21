const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  interests: { type: [String] }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
