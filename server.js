const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://mern9-client.onrender.com',
    credentials: true
  })
);

app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));