const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    },
    likes:{
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    }
})

module.exports = mongoose.model('Post', postSchema);