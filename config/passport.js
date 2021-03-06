const JwtStrategy = require('passport-jwt').Strategy;
const ExctractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('Users');
const keys = require('../config/keys');



const opts = {};
opts.jwtFromRequest = ExctractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done)=>{
            User.findById(jwt_payload.id)
                .then(user => {
                    if(user){
                        return done(null, user);
                    }
                        return done(null, false);
                })
                .catch(err => console.log(err));
    }));
};
