const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'urgent', 'event', 'holiday', 'exam'],
        default: 'general'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'parents', 'teachers', 'class-specific'],
        default: 'all'
    },
    class: String,
    section: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: Date,
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', announcementSchema);
