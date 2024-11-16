// services/restaurantService.js
const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menuItem');

const restaurantService = {
    async listRestaurants() {
        return await Restaurant.find();
    },

    async getRestaurantById(restaurantId) {
        return await Restaurant.findById(restaurantId);
    },

    async createRestaurant(data) {
        const newRestaurant = new Restaurant(data);
        return await newRestaurant.save();
    },

    async updateRestaurant(restaurantId, data) {
        return await Restaurant.findByIdAndUpdate(restaurantId, data, { new: true });
    },

    async addMenuItem(restaurantId, data) {
        const newMenuItem = new MenuItem({ restaurant_id: restaurantId, ...data });
        return await newMenuItem.save();
    },

    async updateMenuItem(itemId, data) {
        return await MenuItem.findByIdAndUpdate(itemId, data, { new: true });
    },

    async deleteMenuItem(itemId) {
        return await MenuItem.findByIdAndDelete(itemId);
    }
};

module.exports = restaurantService;