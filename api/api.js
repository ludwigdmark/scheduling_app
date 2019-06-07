const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const db = require('diskdb');
const bcrypt = require('bcryptjs');
const app = express();

dotenv.config({ path: '.env' });

db.connect('./local_db', ['users']);

var demo_user = {
    "first_name": "Dale",
    "last_name": "Ludwig",
    "mobile_no": "0760338917",
    "pass_hash": bcrypt.hashSync('IAoq19qa', 8),
    "email": "ludwigdmark@gmail.com",
    "is_active": "1",
    "auth_group": "admin",
    "_id": "6fd96737f96e45d39fd2e2351c6920f1"
};

function getUser(id, cb) {
    cb(db.users.findOne({ _id: id }));
}

db.users.update({ _id: demo_user._id }, demo_user, { upsert: true });

app.use(session({ secret: process.env.API_SECRET }));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

passport.serializeUser(function (user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
    getUser(id, (user) => {
        cb(null, user);
    });
});

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        var user = db.users.findOne({ email: username });
        if (!user) {
            return done(null, false);
        }
        if (!bcrypt.compareSync(password, user.pass_hash)) {
            return done(null, false);
        }
        if (bcrypt.compareSync(password, user.pass_hash)) {
            return done(null, user);
        }
        return done(null, false);
    }
));

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get('/', (req, res) => {
    if (req.user) {
        res.redirect('/home');
    }
    res.sendFile('login.html', { root: __dirname });
});

app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});


app.get('/home', loggedIn, (req, res) => res.sendFile('index.html', { root: __dirname }));

app.get('/error', (req, res) => res.send("error logging in"));

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/error' }),
    function (req, res) {
        res.redirect('/home');
    });

app.listen(process.env.API_PORT); 