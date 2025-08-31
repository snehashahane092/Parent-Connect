const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Assignment = require('../models/Homework');
const Announcement = require('../models/Announcement');
const Attendance = require('../models/Attendance');

// Middleware to check if user is parent
const isParent = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'parent') {
        return res.redirect('/login');
    }
    next();
};

// Parent dashboard
router.get('/dashboard', isParent, async (req, res) => {
    try {
        const parent = await User.findById(req.session.user.id).populate('children');
        const announcements = await Announcement.find({
            $or: [
                { targetAudience: 'all' },
                { targetAudience: 'parents' }
            ],
            isActive: true
        }).sort({ createdAt: -1 }).limit(5);
        
        res.render('parent/dashboard', {
            user: req.session.user,
            parent,
            announcements
        });
    } catch (error) {
        console.error('Parent dashboard error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// View child details
router.get('/child/:id', isParent, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('parent')
            .populate('classTeacher');
        
        if (!student || student.parent._id.toString() !== req.session.user.id) {
            return res.status(403).send('Access denied');
        }
        
        const assignments = await Assignment.find({ 
            class: student.class 
        }).populate('teacher').sort({ createdAt: -1 }).limit(10);
        
        const attendance = await Attendance.find({ 
            student: student._id 
        }).sort({ date: -1 }).limit(30);
        
        res.render('parent/child-details', {
            user: req.session.user,
            student,
            assignments,
            attendance
        });
    } catch (error) {
        console.error('Child details error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// View assignments
router.get('/assignments', isParent, async (req, res) => {
    try {
        const parent = await User.findById(req.session.user.id).populate('children');
        const childClasses = parent.children.map(child => child.class);
        
        const assignments = await Assignment.find({
            class: { $in: childClasses }
        }).populate('teacher').sort({ createdAt: -1 });
        
        res.render('parent/assignments', {
            user: req.session.user,
            assignments
        });
    } catch (error) {
        console.error('Assignments error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
