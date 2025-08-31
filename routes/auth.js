const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Existing routes can be added here if any

// API login route for AJAX login
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Set session user info
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        // Return success with redirect URL based on role
        let redirectUrl = '/';
        if (user.role === 'admin') redirectUrl = '/admin/dashboard';
        else if (user.role === 'teacher') redirectUrl = '/teacher/dashboard';
        else if (user.role === 'parent') redirectUrl = '/parent/dashboard';
        else redirectUrl = '/';

        return res.json({ user: req.session.user, redirectUrl });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
