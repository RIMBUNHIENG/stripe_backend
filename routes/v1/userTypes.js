const express = require('express');
const router = express.Router();
const { UserType } = require('../../models');

// GET /api/v1/user-types - Get all user types
router.get('/', async (req, res) => {
  try {
    const userTypes = await UserType.findAll();
    res.json(userTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/user-types - Create a new user type
router.post('/', async (req, res) => {
  try {
    const { user_type_name } = req.body;
    if (!user_type_name) {
      return res.status(400).json({ error: 'user_type_name is required' });
    }
    const newUserType = await UserType.create({ user_type_name });
    res.status(201).json(newUserType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
