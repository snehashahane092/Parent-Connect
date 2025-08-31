const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');

// Home page
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect(`/${req.session.user.role}/dashboard`);
    }
    res.render('auth/login', { error: null });
});

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect(`/${req.session.user.role}/dashboard`);
    }
    res.render('auth/login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, isActive: true });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.render('auth/login', { 
                error: 'Invalid email or password' 
            });
        }
        
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        res.redirect(`/${user.role}/dashboard`);
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login', { 
            error: 'An error occurred. Please try again.' 
        });
    }
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null, success: null });
});

// Register POST
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/register', { 
                error: 'Email already exists', 
                success: null 
            });
        }
        
        const user = new User({
            name,
            email,
            password,
            role,
            phone
        });
        
        await user.save();
        
        res.render('auth/register', { 
            error: null, 
            success: 'Registration successful! Please login.' 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.render('auth/register', { 
            error: 'An error occurred. Please try again.', 
            success: null 
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
