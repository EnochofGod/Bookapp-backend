require('dotenv').config();
const connectDB = require('./db');
const app = require('./app');
const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    app.listen(PORT , () => 
    console.log(`Server is running on ${PORT} `)
)
};
start()