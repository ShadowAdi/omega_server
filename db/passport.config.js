const passport = require("passport");
require('dotenv').config();
const User = require("../models/UserModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    // Create a new user if not found
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profileImage: profile.photos[0].value,
                        provider: "google",
                        password: null, // No password required for Google users
                        mobileNo: null, // Mobile number is not provided by Google
                    });
                    await user.save();
                }
                done(null, user);
            } catch (error) {
                console.error(error);
                done(error, null);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
