const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Register user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!isValid(username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    users.push({ username, password });

    return res.status(200).json({
        message: "User successfully registered"
    });
});

// Get all books
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const book = books[req.params.isbn];

    return book
        ? res.status(200).send(JSON.stringify(book, null, 2))
        : res.status(404).json({ message: "Book not found" });
});

// Get by author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const result = {};

    Object.keys(books).forEach((key) => {
        if (books[key].author === author) {
            result[key] = books[key];
        }
    });

    return Object.keys(result).length > 0
        ? res.status(200).send(JSON.stringify(result, null, 2))
        : res.status(404).json({ message: "No books found for this author" });
});

// Get by title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const result = {};

    Object.keys(books).forEach((key) => {
        if (books[key].title === title) {
            result[key] = books[key];
        }
    });

    return Object.keys(result).length > 0
        ? res.status(200).send(JSON.stringify(result, null, 2))
        : res.status(404).json({ message: "No books found with this title" });
});

// Get reviews
public_users.get('/review/:isbn', function (req, res) {
    const book = books[req.params.isbn];

    return book
        ? res.status(200).send(JSON.stringify(book.reviews, null, 2))
        : res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;

public_users.get('/asyncbooks', async function (req, res) {
    try {
        const response = await axios.get("http://localhost:5000/");

        return res.status(200).json({
            message: "Books fetched successfully (Async/Await)",
            data: response.data
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});