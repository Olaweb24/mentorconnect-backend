const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String },
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
