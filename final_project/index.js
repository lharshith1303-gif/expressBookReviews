const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware for customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if session and authorization exist
  if (!req.session || !req.session.authorization) {
    return res.status(403).json({
      message: "User not logged in",
    });
  }

  const token = req.session.authorization.accessToken;

  try {
    // Verify token
    const decoded = jwt.verify(token, "fingerprint_customer");

    // Attach user info to request
    req.user = decoded;

    // Proceed to next middleware/route
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
});

const PORT = 5000;

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));