// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const restaurantRoutes = require('./routes/restaurant.js');
const connectDB = require('./dbConfig.js');
const dotenv = require('dotenv');

// Determine which .env file to load
const envFile = `.env.${process.env.NODE_ENV || 'dev'}`;
dotenv.config({ path: envFile });

const app = express();
app.use(cors());
app.use(express.json());


// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.use('/restaurants', restaurantRoutes);

// Start the server if not in test mode
// if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
// }

module.exports = app; // Export the app for testing


