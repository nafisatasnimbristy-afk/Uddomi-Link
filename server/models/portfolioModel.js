const mongoose = require('mongoose');

const portfolioSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: true,
        enum: ['artwork', 'handicraft', 'textile', 'pottery', 'jewelry', 'performance', 'service', 'other']
    },
    media: [{
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['image', 'video'],
            default: 'image'
        },
        caption: String,
        thumbnail: Boolean
    }],
    tags: [{
        type: String,
        trim: true
    }],
    skills: [{
        type: String,
        trim: true
    }],
    priceRange: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'BDT'
        }
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'limited', 'unavailable'],
        default: 'available'
    },
    featured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
portfolioSchema.index({ title: 'text', description: 'text', tags: 'text', skills: 'text' });

module.exports = mongoose.model('Portfolio', portfolioSchema);
