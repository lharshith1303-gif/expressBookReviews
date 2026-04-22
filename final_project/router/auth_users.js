const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// ✅ Shared users array
let users = [];

// ✅ Check if username is NEW (for register)
const isValid = (username) => {
    return !users.find((user) => user.username === username);
};
module.exports.isValid = isValid;

// ✅ Check login credentials
const authenticatedUser = (username, password) => {
    return users.find(
        (user) => user.username === username && user.password === password
    );
};

// ✅ LOGIN ROUTE
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    const user = authenticatedUser(username, password);

    if (!user) {
        return res.status(401).json({
            message: "Invalid login credentials"
        });
    }

    // Generate JWT
    const accessToken = jwt.sign(
        { username: user.username },
        "fingerprint_customer",
        { expiresIn: "1h" }
    );

    // Store in session
    req.session.authorization = {
        accessToken
    };

    return res.status(200).json({
        message: "User successfully logged in",
        token: accessToken
    });
});


// ✅ Task 8: Add / Modify Review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully"
    });
});


// ✅ Task 9: Delete Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "No review found for this user"
        });
    }

    // Delete only this user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully"
    });
});


// ✅ Export routes + users
module.exports.authenticated = regd_users;
module.exports.users = users;