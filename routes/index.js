var express = require('express');
var router = express.Router();
const { register, login } = require("../controllers/authController");
const { check } = require("express-validator");
/* GET home page. */
router.get("/", function (req, res) {
  res.send("done");
})

// Register Route
router.post(
  "/SignUp",
  [
    check("email", "Valid email is required").isEmail(),
    check("password", "Password must be 6+ characters").isLength({ min: 6 }),
  ],
  register
);

// Login Route
router.post("/Login", login);

module.exports = router;
