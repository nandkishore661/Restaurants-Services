// routes/restaurant.js
const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");
const MenuItem = require("../models/menuItem");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

// Middleware to check if the user is the owner
const checkOwner = (req, res, next) => {
    // Implement your logic to check if the user is the owner
    // For this example, we will assume the owner_id is passed in the request
    const { role } = req.user; // In a real app, get this from the token or session
    if (role !== "restaurant_owner" && role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
  next();
};

const authenticateJWT = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
};

// List all restaurants
router.get("/", authenticateJWT, async (req, res) => {
  const restaurants = await Restaurant.find();
  res.json(restaurants);
});

// Retrieve details of a specific restaurant
router.get("/:restaurant_id", authenticateJWT, checkOwner, async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurant_id);
  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });
  res.json(restaurant);
});

// Create a new restaurant
router.post("/", authenticateJWT, checkOwner, async (req, res) => {
  const { name, address, hours } = req.body;
  const newRestaurant = new Restaurant({ name, address, hours });
  await newRestaurant.save();
  res.status(201).json(newRestaurant);
});

// Update restaurant information
router.put("/:restaurant_id", authenticateJWT, checkOwner, async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.restaurant_id,
    req.body,
    { new: true }
  );
  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });
  res.json(restaurant);
});

// Delete a restaurants
router.delete(
  "/:restaurant_id",
  authenticateJWT,
  checkOwner,
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findByIdAndDelete(
        req.params.restaurant_id
      );
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      // Optionally, you might want to delete all menu items associated with this restaurant
      await MenuItem.deleteMany({ restaurant_id: req.params.restaurant_id });
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Add a menu item
router.post(
  "/:restaurant_id/menu",
  authenticateJWT,
  checkOwner,
  async (req, res) => {
    const { name, description, price } = req.body;
    const newMenuItem = new MenuItem({
      restaurant_id: req.params.restaurant_id,
      name,
      description,
      price,
    });
    await newMenuItem.save();
    res.status(201).json(newMenuItem);
  }
);

// Get all menu items for a specific restaurant
router.get("/:restaurant_id/menu", authenticateJWT, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant_id: req.params.restaurant_id,
    }); // Fetch menu items for the specified restaurant
    if (menuItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No menu items found for this restaurant" });
    }
    res.json(menuItems); // Return the menu items as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" }); // Handle any errors
  }
});

// Update a menu item
router.put(
  "/:restaurant_id/menu/:item_id",
  authenticateJWT,
  checkOwner,
  async (req, res) => {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.item_id,
      req.body,
      { new: true }
    );
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.json(menuItem);
  }
);

// Delete a menu item
router.delete(
  "/:restaurant_id/menu/:item_id",
  authenticateJWT,
  checkOwner,
  async (req, res) => {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.item_id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted successfully" });
  }
);

module.exports = router;
