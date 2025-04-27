const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const db = require('./config/db');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    let auth = require('./middleware/auth')(req, res, next);
    app.use(auth.initialize());
    if (req.session.token && req.session.token != null) {
        req.headers['token'] = req.session.token;
    }
    next();
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/category', require('./routes/category.routes'));
app.use('/api/product', require('./routes/product.routes'));

app.listen(process.env.PORT, async () => {
    await db.connectDb();
    console.log("DB Connected Successfully!");
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});