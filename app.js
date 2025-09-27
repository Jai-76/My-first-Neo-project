const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const rideRoutes = require('./routes/ride');
const config = require('./config/config');

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);

// MongoDB connection
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = config.port || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});