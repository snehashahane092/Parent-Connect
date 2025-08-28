const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    class: {
        type: String,
        required: true
    },
    section: String,
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    subjects: [String],
    admissionDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profileImage: String
});

module.exports = mongoose.model('Student', studentSchema);
