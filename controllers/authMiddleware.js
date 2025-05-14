const jwt = require("jsonwebtoken");
const process = require('process');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Verify JWT
exports.authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Unauthorized access" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Role-based Authorization
exports.roleMiddleware = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
};
