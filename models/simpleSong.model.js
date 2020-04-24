const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const simpleSongSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    unique: true
  },
  artist: {
    type: String,
    minlength: 3,
    maxlength: 30,
    required: true
  },
  songId: {
    type: Number,
    required: true
  },
});

const SimpleSong = mongoose.model("SimpleSong", simpleSongSchema);
module.exports = SimpleSong;
