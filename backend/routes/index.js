var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const { register, login } = require("../controllers/authController");
const { check } = require("express-validator");
const process = require('process');
require("dotenv").config();

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

router.post("/GuestSignIn", (req, res) => {
  
  const guestId = `guest_${crypto.randomUUID()}`;
  const token = jwt.sign(
    { id: guestId,
      role: "guest"
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({
    token,
    role: "guest",
    username: "Guest",
    avatar: "/default-avatar.png",
    name:"Mr. X",
    Id:"guestId"
  });

});

// Login Route
router.post("/Login", login);

module.exports = router;
