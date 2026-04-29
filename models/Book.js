const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    author:{
        type: String,
        required: [true, 'Author is required'],
        trim: true
    },
    publishedDate: {
        type: Date,
        default: null
    },
    pages:{
        type: Number,
        default: 0
    },
    coverUrl:{
        type: String,
        default: ''
    },
    coverPublicId:{
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    {timestamps: true}
);
module.exports = mongoose.model('Book', bookSchema);