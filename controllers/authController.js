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
        });   // ACCOUNT CREATION

        //FETCHING USER DATA THEN TO GET HIM LOGGED IN
        const user_fetch = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: email },
                    { email: email }
                ]
            }
        });

        const token = jwt.sign({ id: user_fetch.id, role: user_fetch.role }, JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({ token: token, role: user_fetch.role, username: user_fetch.username, name: user_fetch.name });  // ALSO SENDING USER DATA

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "User registration failed." });
    }
};

// User Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: email },
                    { email: email }
                ]
            }
        });

        // console.log(user);
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.hash_password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect Password" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "1h",
        });
        // console.log(token);

        res.json({ token: token, role: user.role, username: user.username, name: user.name });  // ALSO SENDING USER DATA
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Login failed" });
    }
};