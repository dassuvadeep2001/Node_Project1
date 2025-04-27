const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require('../models/auth.model');
const mongoose = require('mongoose');
const ExtractJWT = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const params = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJWT.fromExtractors([
       ExtractJWT.fromHeader("x-access-token"),
       ExtractJWT.fromHeader("token")
    ]),
};

module.exports = () => {
     const strategy = new JwtStrategy(params, async (payload, done) => {
        console.log("payload", payload);
        
        if (!payload.id) {
            return res.json({
                status: 400,
                message: "Invalid token payload",
                data: {}
            });
        }
        const user= await User.aggregate([
            { $match: 
                {
                     _id: new mongoose.Types.ObjectId(payload.id),
                      "isDeleted": false 
                } 
            }
        ]).exec()
        if (user) {
            return done(null, user[0]);
        } else {
            return done(null, false);
        }
});
    passport.use(strategy);
    return {
        initialize: () => {
            return passport.initialize();
        },
        authenticate: (req, res, next) => {
            passport.authenticate("jwt", process.env.JWT_SECRET, (err, user) => {
            if (err){
                return res.send({
                    status: 500,
                    message: "please provide a valid token",
                })
            }
            if (!user) {
                return res.send({
                    status: 401,
                    message: "User not found",  
                });
            }
                req.user = user;
                return next();
        })(req, res, next);
        },
        //for admin
        adminAuthenticate: (req, res, next) => {
            passport.authenticate("jwt", process.env.JWT_SECRET, (err, user) => {
                if (err){
                    return res.send({
                        status: 500,
                        message: "please provide a valid token",
                    })
                }
                if (!user || user.role != "admin") {
                    return res.send({
                        status: 401,
                        message: "This route is only for admin",  
                    });
                }
                    req.user = user;
                    return next();
            })(req, res, next);
        }
    }
}