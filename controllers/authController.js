const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();
const JWT_SECRET = "your_super_secret_key";

// User Registration
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, username, email, role, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name,
                username: username,
                email: email,
                role: role,
                hash_password: hashedPassword
            },
        });
        console.log(user);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "User registration failed." });
    }
};

// User Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        // console.log(user);
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.hash_password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });
        // console.log(token);
        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Login failed" });
    }
};