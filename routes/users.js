var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

var User = require('../models/user');

// Register
router.get('/register', function (req, res) {
    res.render('index', {
        type: "register"
    });
});

// Login
router.get('/login', function (req, res) {
    if (req.session.username) {
        res.redirect('/users/feed');
    } else {
        res.render('index', {
            type: "login"
        });
    }
});

// Logout
router.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy(function (err) {
        res.redirect('/users/login');
    });

});

// Feed
router.get('/feed', (req, res) => {
    if (req.session.username) {
        res.render('feed');
    } else {
        res.render('index', {
            type: "login",
            error_msg: "Please Login first!"
        });
    }
});

router.get('/:id', (req, res, next) => {
    User.getUserById(ObjectId(req.params.id), (err, user) => {
        if (err) {
            next(err);
        } else {
            res.render('profile', {
                details: user,
                id: user._id
            });
        }
    });
});

// Register User
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var dob = req.body.dob;
    var pass = req.body.pass;
    var cpass = req.body.cpass;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('dob', 'DOB is required').notEmpty();
    req.checkBody('pass', 'Password is required').notEmpty();
    req.checkBody('cpass', 'Passwords do not match').equals(req.body.pass);

    var errors = req.validationErrors();

    if (errors) {
        res.render('index', {
            type: "register",
            errors: errors
        });
    } else {
        var newUser = new User({
            Name: name,
            Email: email,
            Username: username,
            Password: pass,
            DOB: dob
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });
        req.flash('success_msg', 'Account created successfully, Login Now!');
        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'pass'
    },
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'User not found!!'
                });
            }

            User.comparePassword(password, user.Password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password!!'
                    });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(ObjectId(id), function (err, user) {
        done(err, user);
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('index', {
                type: "login",
                error: info.message
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            req.session.username = user.Username;
            return res.render('feed', {
                id: user._id
            });
        });
    })(req, res, next);
});

router.post('/update/:id', (req, res) => {
    // User.updateDetails();
});

module.exports = router;