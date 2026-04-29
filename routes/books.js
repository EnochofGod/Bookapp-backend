const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary');
const upload = require('../middleware/upload');
const streamifier = require('streamifier');
const softAuth = require('../middleware/softAuth');


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve,reject) =>{
        const stream = cloudinary.uploader.upload_stream(
            {folder: 'books_covers'},
            (error,result) => {
                if(result) resolve(result)
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};


router.get('/', softAuth, async (req, res, next) => {
    try{
        let query = {};
        const Page = parseInt(req.query.page) || 1;
        const Limit = parseInt(req.query.limit) || 10;
        const allowedsort = ['createdAt', 'updatedAt', 'title', 'author'];
        let sortField ='createdAt';
        let sortOrder = -1;

        if(Limit > 100) {
            return res.status(400).json({ error: "Limit cannot exceed 100" });
        }
        if(Page < 1) {
            return res.status(400).json({ error: "Page must be at least 1" });
        }

        if(req.query.sort){
            const isDesc= req.query.sort.startsWith('-');
            const field = isDesc ? req.query.sort.slice(1) : req.query.sort;
            if(allowedsort.includes(field)){
                sortField = field;
                sortOrder = isDesc ? -1 : 1;
            }
        }

        if(req.query.search){
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: searchRegex },
                { author: searchRegex }
            ];
        }
        if(req.query.hasCover === 'true') {
            query.coverUrl = { $ne: '' };
        }

        if(req.query.mine === 'true' && req.user) {
            query.owner = req.user._id;
        }

        const totalBooks = await Book.countDocuments(query);
        const totalPages = Math.ceil(totalBooks / Limit) || 1;

        if(Page > totalPages) {
            return res.json({ data: [], page: Page, limit: Limit, totalBooks, totalPages });
        }

        const skip = (Page - 1) * Limit;

        const books = await Book.find(query)
        .select('title author coverUrl owner createdAt')
        .sort({ [sortField]: sortOrder })
        .lean()
        .skip(skip)
        .limit(Limit);
        res.status(200).json({
            data: books,
            page: Page,
            limit: Limit,
            totalPages,
            totalBooks
        });
    } catch (err) {
        next(err);
    }
})
router.get('/:id', async(req,res) =>{
    try{
    const book = await Book.findById(req.params.id);
    if(!book) return res.status(404).json({ error: "Book not found"});
    res.status(200).json(book);
    }catch(err){
        if(err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        next(err);
    }
})
router.post('/', auth, async (req, res) => {
    try{
        const { title, author, publishedDate, coverUrl } = req.body;
        if(!title || !author) {
            return res.status(400).json({ error: "Title and author are required" });
        }
        const book = await Book.create({
            title,
            author,
            publishedDate: publishedDate ? new Date(publishedDate) : null,
            coverUrl: coverUrl || '',
            owner: req.user._id
        });
        res.status(201).json(book);
    }catch(err){
        if(err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
})

router.post('/:id/cover', auth, upload.single('cover'), async (req, res, next) => {
    try {
        if(!req.file) {
            return res.status(400).json({ error: "Cover image is required" });
        }
        const book = await Book.findById(req.params.id);
        if(!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        if(book.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({error:'Not your book'})
        }
        if(book.coverPublicId){
            await cloudinary.uploader.destroy(book.coverPublicId);
        }
        const result = await uploadToCloudinary(req.file.buffer);
        book.coverUrl = result.secure_url;
        book.coverPublicId = result.public_id;
        await book.save();
        res.status(200).json({
            message: "Cover updated successfully",
            coverUrl: book.coverUrl
        });
    }catch(err){
        next(err);
    }
})
        
router.put('/:id', async (req, res, next) => {
    try {
        const {title, author} = req.body;
         if(!title || !author) {
            return res.status(400).json({ error: "Title and author are required" });
        }
        const book = await Book.findByIdAndUpdate(
            req.params.id, 
            { title, author }, 
            { new: true }, { runValidators: true });
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.status(200).json(book);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        next(err);
    }
});
router.patch('/:id', async (req,res, next) => {
    try{
        const book = await Book.findByIdAndUpdate(req.params.id,
            req.body, 
            { new: true, runValidators: true });
        if(!book) return res.status(404).json({ error: "Book not found" });
        res.status(200).json(book);
    }
    catch(err){
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }        next(err);
    }
});

router.delete('/:id', auth, async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        if(book.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({error:'Not your book'})
        }
        if(book.coverPublicId){
            await cloudinary.uploader.destroy(book.coverPublicId);
        }
        await book.deleteOne();
        res.status(204).send();
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        next(err);
    }
});


module.exports = router;