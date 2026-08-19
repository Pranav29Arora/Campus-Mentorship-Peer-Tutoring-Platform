const express = require('express');
const mentorController = require('../controllers/mentorController');
const router = express.Router();

router.get('/', mentorController.getMentors);
router.get('/:id', mentorController.getMentorById);

module.exports = router;
