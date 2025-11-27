const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  image: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Make sure this is the correct reference to the 'User' model
    required: true,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
