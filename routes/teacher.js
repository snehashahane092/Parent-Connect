const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Assignment = require('../models/Homework');
const Announcement = require('../models/Announcement');
const Attendance = require('../models/Attendance');

// Middleware to check if user is teacher
const isTeacher = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'teacher') {
        return res.redirect('/login');
    }
    next();
};

// Teacher dashboard
router.get('/dashboard', isTeacher, async (req, res) => {
    try {
        const teacher = await User.findById(req.session.user.id);
        const students = await Student.find({ 
            class: { $in: teacher.classes } 
        });
        
        const assignments = await Assignment.find({ 
            teacher: req.session.user.id 
        }).sort({ createdAt: -1 }).limit(5);
        
        const announcements = await Announcement.find({ 
            author: req.session.user.id 
        }).sort({ createdAt: -1 }).limit(5);
        
        res.render('teacher/dashboard', {
            user: req.session.user,
            teacher,
            students,
            assignments,
            announcements
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Create assignment page
router.get('/assignment/create', isTeacher, async (req, res) => {
    try {
        const teacher = await User.findById(req.session.user.id);
        res.render('teacher/create-assignment', {
            user: req.session.user,
            teacher
        });
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Create assignment POST
router.post('/assignment/create', isTeacher, async (req, res) => {
    try {
        const { title, description, subject, class: className, section, dueDate } = req.body;
        
        const assignment = new Assignment({
            title,
            description,
            subject,
            class: className,
            section,
            teacher: req.session.user.id,
            dueDate: new Date(dueDate)
        });
        
        await assignment.save();
        
        // Notify parents via socket.io
        req.io.to(className).emit('new-assignment', {
            title,
            subject,
            class: className,
            dueDate
        });
        
        res.redirect('/teacher/assignments');
    } catch (error) {
        console.error('Create assignment POST error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// View assignments
router.get('/assignments', isTeacher, async (req, res) => {
    try {
        const assignments = await Assignment.find({ 
            teacher: req.session.user.id 
        }).sort({ createdAt: -1 });
        
        res.render('teacher/assignments', {
            user: req.session.user,
            assignments
        });
    } catch (error) {
        console.error('Teacher assignments error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Mark attendance page
router.get('/attendance', isTeacher, async (req, res) => {
    try {
        const teacher = await User.findById(req.session.user.id);
        const students = await Student.find({ 
            class: { $in: teacher.classes } 
        }).sort({ name: 1 });
        
        res.render('teacher/attendance', {
            user: req.session.user,
            students,
            today: new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Attendance page error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Mark attendance POST
router.post('/attendance', isTeacher, async (req, res) => {
    try {
        const { date, attendance } = req.body;
        const attendanceDate = new Date(date);
        
        for (const studentId in attendance) {
            const status = attendance[studentId];
            
            await Attendance.findOneAndUpdate(
                { student: studentId, date: attendanceDate },
                {
                    student: studentId,
                    date: attendanceDate,
                    status,
                    markedBy: req.session.user.id
                },
                { upsert: true, new: true }
            );
        }
        
        res.redirect('/teacher/attendance?success=true');
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
