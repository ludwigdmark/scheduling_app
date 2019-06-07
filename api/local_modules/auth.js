module.exports = function(app) {

    const passport = require('passport');

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function (id, cb) {
        cb(null, {
            id: id, username: "dale2"
        });
    });

    const LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy(
        function (username, password, done) {
            if (username !== "test")
                return done(null, false);

            if (username == "test" && password !== "test")
                return done(null, false);

            if (username == "test" && password == "test")
                return done(null, {
                    id: 1, username: "dale"
                });
        }
    ));

    return passport;

};