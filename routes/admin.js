const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Announcement = require('../models/Announcement');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
};

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalParents = await User.countDocuments({ role: 'parent' });
        
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.render('admin/dashboard', {
            user: req.session.user,
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalParents
            },
            recentUsers
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Manage users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/users', {
            user: req.session.user,
            users
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Create announcement page
router.get('/announcement/create', isAdmin, async (req, res) => {
    res.render('admin/create-announcement', {
        user: req.session.user
    });
});

// Create announcement POST
router.post('/announcement/create', isAdmin, async (req, res) => {
    try {
        const { title, content, type, targetAudience, class: className, section } = req.body;
        
        const announcement = new Announcement({
            title,
            content,
            type,
            targetAudience,
            class: className,
            section,
            author: req.session.user.id
        });
        
        await announcement.save();
        
        // Notify users via socket.io
        req.io.emit('new-announcement', {
            title,
            type,
            targetAudience
        });
        
        res.redirect('/admin/announcements');
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
