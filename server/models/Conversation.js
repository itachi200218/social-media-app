const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: { type: String, required: true },
    message: { type: String, required: true } // This must be a string
});

const ConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    history: [MessageSchema]
});

module.exports = mongoose.model('Conversation', ConversationSchema);
