const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const authRouter = require('./routes/auth')
const bookRouter = require('./routes/books')
const multer = require('multer');

if(process.env.NODE_ENV === 'production'){
    app.use(cors());
}else{
    app.use(cors({
    origin: 'http://localhost:5173',
    }))
}

app.use('/auth', authRouter);
app.use('/books', bookRouter);

app.use((err,req,res,next) => {
    if(err instanceof multer.MulterError) {
        if(err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 5MB limit' });
        }
        return res.status(400).json({ error: err.message });
    }else if(err.message === 'Only image files are allowed') {
        return res.status(400).json({ error: 'Only image files are allowed' });
    }
    next(err);
})

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


module.exports= app;