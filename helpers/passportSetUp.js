const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/Usermodel");
const jwt = require("jsonwebtoken");
const Subscription = require("../models/SubscriptionModel");
const SubscriptionOrder = require("../models/SubscriptionOrderModel");
require("dotenv").config();

const myPassportConfig = () => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["displayName", "emails", "photos"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error("No email found in Facebook profile."));
          }

          let user = await User.findOne({
            where: { email: profile.emails[0].value },
          });

          if (!user) {
            const subscription = await Subscription.findOne({
              where: { id: 1 },
            });
            const referalCode = `${profile.name.givenName}-${Date.now()}`;

            user = await User.create({
              email: profile.emails[0].value,
              fname: profile.name.givenName,
              lname: profile.name.familyName,
              isVerified: true,
              imageFilePath:
                profile.photos && profile.photos.length > 0
                  ? profile.photos[0].value
                  : null,
              provider: "facebook",
              referalCode,
              level_id: 1,
            });

            const currentDate = new Date();
            user.subscription_id = subscription.id;
            user.referalCode = referalCode;
            user.expirationDate = new Date(
              currentDate.setFullYear(currentDate.getFullYear() + 1)
            );
            await user.save();

            const orderNumber = `subOrder-${Date.now()}`;
            await SubscriptionOrder.create({
              user_id: user.id,
              totalPrice: subscription.price,
              receiptImage: "No image",
              subscription_id: subscription.id,
              subscriptionType: "Yearly",
              status: "APPROVED",
              reviewedBy: "Default",
              orderNumber,
            });
          }

          const token = jwt.sign(
            {
              id: user.id,
              fname: user.fname,
              role: user.role,
              level: user.level,
            },
            process.env.JWT_USER_SECRET,
            { expiresIn: "2h" }
          );

          done(null, { user, token });
        } catch (err) {
          console.error("Error during Facebook authentication:", err);
          done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        // passReqToCallback: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // console.log(accessToken,profile)
          let user = await User.findOne({
            where: { email: profile.emails[0].value },
          });
          //console.log(user)
          if (!user) {
            const subscription = await Subscription.findOne({
              where: { id: 1 },
            });

            const referalCode = `${profile.name.givenName}-${Date.now()}`;
            user = await User.create({
              email: profile.emails[0].value,
              fname: profile._json.given_name,
              lname: profile._json.family_name,
              isVerified: true,
              imageFilePath: profile.photos[0].value,
              provider: "google",
              referalCode,
              level_id: 1,
            });

            const currentDate = new Date();
            user.subscription_id = subscription.id;
            user.referalCode = referalCode;

            user.expirationDate = new Date(
              currentDate.setFullYear(currentDate.getFullYear() + 1)
            );
            await user.save();
            orderNumber = `subOrder-${Date.now()}`;

            await SubscriptionOrder.create({
              user_id: user.id,
              totalPrice: subscription.price,
              receiptImage: "No image",
              subscription_id: subscription.id,
              subscriptionType: "Yearly",
              status: "APPROVED",
              reviewedBy: "Default",
              orderNumber,
            });
          }

          const token = jwt.sign(
            { id: user.id, fname: user.fname, role: user.role },
            process.env.JWT_USER_SECRET,
            { expiresIn: "3h" }
          );
          //  console.log('hhhhh',token)

          return done(null, { user, token });
        } catch (err) {
          console.error("hhhhh", err);
          done(err);
        }
      }
    )
  );
};

module.exports = { myPassportConfig };
