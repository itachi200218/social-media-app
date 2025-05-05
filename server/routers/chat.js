const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation'); // MongoDB model
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chat - Chat with Gemini
router.post('/', authMiddleware, async (req, res) => {
    const { message: userMessage } = req.body;
    const userIdFromToken = req.user._id;

    console.log('Received message from user:', userMessage);
    console.log('User ID from token:', userIdFromToken);

    if (!userMessage) {
        return res.status(400).json({ response: 'Message is required.' });
    }

    try {
        let conversation = await Conversation.findOne({ userId: userIdFromToken });
        if (!conversation) {
            conversation = new Conversation({ userId: userIdFromToken, history: [] });
        }

        // Add user message
        conversation.history.push({ role: 'user', message: String(userMessage) });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat();

        const contextMessages = conversation.history
            .map(entry => `${entry.role}: ${entry.message}`)
            .join('\n');
        console.log('Context messages:', contextMessages);

        const result = await chat.sendMessage(`${contextMessages}\nuser: ${userMessage}`);

        const geminiResponse = getTextFromResponse(result?.response);

        console.log('Gemini response:', geminiResponse);

        if (!geminiResponse) {
            console.error('Gemini did not return a valid response:', result);
            return res.status(500).json({ response: "Gemini did not return a valid response." });
        }

        // Add Gemini response (ensuring it's a string)
        conversation.history.push({
            role: 'bot',
            message: String(geminiResponse || "No response from Gemini.")
        });

        await conversation.save();
        return res.json({ response: geminiResponse });

    } catch (error) {
        console.error("Gemini error:", error);
        return res.status(500).json({ response: "Sorry, something went wrong. Please try again." });
    }
});

// ✅ FIXED: Always returns a string
const getTextFromResponse = (response) => {
    try {
        if (!response) return "No response from Gemini.";

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && Array.isArray(parts)) {
            return parts.map(part => part.text).join('').trim();
        }

        const fallback = response.candidates?.[0]?.content?.text;
        if (fallback) {
            return String(fallback).trim();
        }

        return "No content received.";
    } catch (error) {
        console.error("Error processing Gemini response:", error);
        return "Sorry, there was an error with the response.";
    }
};
// GET /api/chat/history - Fetch chat history
router.get('/history', authMiddleware, async (req, res) => {
    const userIdFromToken = req.user._id;

    try {
        const conversation = await Conversation.findOne({ userId: userIdFromToken });

        if (!conversation) {
            return res.status(404).json({ response: 'No conversation history found.' });
        }

        return res.json({ history: conversation.history });
    } catch (error) {
        console.error("Error fetching conversation history:", error);
        return res.status(500).json({ response: 'Something went wrong while fetching history.' });
    }
});

module.exports = router;

