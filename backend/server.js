const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user');
const rankRoutes = require('./routes/rank');
const questRoutes = require('./routes/quest');
const telegramBot = require('./bot/telegramBot');
const inviteUserRoutes = require('./routes/inviteUser');

// Initialize Express app
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'clipboard-read=(), clipboard-write=()');
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

// Routes
app.use('/user', userRoutes);
app.use('/rank', rankRoutes);
app.use('/inviteUser', inviteUserRoutes);
app.use('/quest', questRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
