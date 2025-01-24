
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const { Strategy: JtwStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local')
const passport = require('passport');
const UserModel = require('../model/userModel');
const bcrypt = require('bcryptjs');

const connectPassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const user = await UserModel.findOne({ GoogleId: profile.id });
                if (!user) {
                    const newUser = await UserModel.create({
                        GoogleId: profile.id,
                        FullName: profile.displayName,
                        Email: profile.emails[0].value,
                    });
                    console.log(newUser)
                    return done(null, newUser)
                } else {
                    return done(null, user)
                }
            } catch (error) {
                console.error("Error in Google Strategy:", error);
                return done(error, null);
            }
        }
    )
    );

    passport.use(new FacebookStrategy({
        clientID: "test",
        clientSecret: "test",
        callbackURL: "test"
    },
        async function (accessToken, refreshToken, profile, done) {
            const user = await UserModel.findOne({ GoogleId: profile.id });
            console.log(user)
            if (!user) {
                const newUser = await UserModel.create({
                    GoogleId: profile.id,
                    FullName: profile.displayName,
                    Email: profile,
                });
                return done(null, newUser)
            } else {
                return done(null, user)
            }
        }

    ))

    passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const user = await UserModel.findOne({ GithubId: profile.id });
                if (!user) {
                    const newUser = await UserModel.create({
                        GithubId: profile.id,
                        userName: profile.username,
                        Email: profile.emails?.[0]?.value,
                    });
                    console.log(newUser)
                    return done(null, newUser)
                } else {
                    return done(null, user)
                }
            } catch (error) {
                console.error("Error in Github Strategy:", error);
                return done(error, null);
            }
        }
    ))

    // passport.use(new JtwStrategy({
    //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //     secretOrKey: process.env.JWT_SECRET,
    // }, async (jwtPayload, done) => {
    //     try {
    //         const user = await UserModel.findById(jwtPayload.id);
    //         if (user) {
    //             return done(null, user);
    //         }
    //         return done(null, false, { message: 'Invalid Token' });
    //     } catch (error) {
    //         console.error("Error in JWT Strategy:", error);
    //         return done(error, false);
    //     }
    // }));

    // passport.use(new LocalStrategy({
    //     usernameField: 'email',
    //     passwordField: 'password',
    // }, async (email, password, done) => {
    //     try {
    //         const user = await UserModel.findOne({ Email: email });
    //         if (!user) {
    //             return done(null, false, { message: 'Invalid Email or Password' });
    //         }

    //         const isPasswordValid = await bcrypt.compare(password, user.Password);
    //         if (!isPasswordValid) {
    //             return done(null, false, { message: 'Invalid Email or Password' });
    //         }

    //         return done(null, user);
    //     } catch (error) {
    //         console.error("Error in Local Strategy:", error);
    //         return done(error, null);
    //     }
    // }));



    passport.serializeUser((user, done) => {
        done(null, user._id)
    });
    passport.deserializeUser(async (id, done) => {
        const user = UserModel.findById(id);
        done(null, user)
    })
}


module.exports = { connectPassport }