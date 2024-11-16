// test/restaurant.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); 
const assert = require('assert');
const jwt = require("jsonwebtoken");



// Connect to a test database before tests
before(async () => {
    await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
});


// Close the database connection after tests
after(async () => {
    await mongoose.connection.close();
});

// Mock JWT token
const mockToken = (userId="6736db2b67909bf7fe940230",role="restaurant_owner") => {
    return jwt.sign({userId, role }, 'your_secret_key', { expiresIn: '1h' });
};


describe('Restaurant API', () => {
    let restaurantId;

    it('should create a new restaurant', async () => {
        const res = await request(app)
            .post('/restaurants')
            .set('Authorization',`Bearer ${mockToken()}`)
            .send({ name: 'Test Restaurant', address: '123 Test St', hours: '9am - 9pm' });
        
        assert.equal(res.status, 201);
        assert.ok(res.body._id); // Check that _id exists
        restaurantId = res.body._id; // Save the restaurant ID for later tests
    });

    it('should list all restaurants', async () => {
        const res = await request(app)
            .get('/restaurants')
            .set('Authorization',`Bearer ${mockToken()}`)
        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body)); // Check that the response is an array
        assert.ok(res.body.length > 0); // Ensure that the array has elements
    });

    it('should retrieve a specific restaurant', async () => {
        const res = await request(app)
            .get(`/restaurants/${restaurantId}`)
            .set('Authorization',`Bearer ${mockToken()}`)

        assert.equal(res.status, 200);
        assert.equal(res.body._id, restaurantId); // Check that the retrieved restaurant has the correct ID
    });

    it('should update a restaurant', async () => {
        const res = await request(app)
            .put(`/restaurants/${restaurantId}`)
            .set('Authorization',`Bearer ${mockToken()}`)
            .send({ name: 'Updated Restaurant' });
        
        assert.equal(res.status, 200);
        assert.equal(res.body.name, 'Updated Restaurant'); // Check that the name was updated
    });

    it('should delete a restaurant', async () => {
        const res = await request(app)
            .delete(`/restaurants/${restaurantId}`)
            .set('Authorization',`Bearer ${mockToken()}`)
        
        assert.equal(res.status, 200);
        assert.equal(res.body.message, 'Restaurant deleted successfully'); // Check the success message
    });

    it('should return 404 for non-existing restaurant', async () => {
        const res = await request(app)
            .get(`/restaurants/${restaurantId}`)
            .set('Authorization',`Bearer ${mockToken()}`)
        
        assert.equal(res.status, 404);
        assert.equal(res.body.message, 'Restaurant not found'); // Check the not found message
    });
});