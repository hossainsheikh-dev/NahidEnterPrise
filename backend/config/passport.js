console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET");

const passport         = require("passport");
const GoogleStrategy   = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const Customer         = require("../models/Customer");


//google login backend handling here
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/customer/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let customer = await Customer.findOne({ googleId: profile.id });
      if (!customer) {
        customer = await Customer.findOne({ email: profile.emails?.[0]?.value });
        if (customer) {
          customer.googleId = profile.id;
          customer.provider = "google";
          if (!customer.avatar) customer.avatar = profile.photos?.[0]?.value || "";
          await customer.save();
        } else {
          customer = await Customer.create({
            name:       profile.displayName,
            email:      profile.emails?.[0]?.value || "",
            googleId:   profile.id,
            avatar:     profile.photos?.[0]?.value || "",
            provider:   "google",
            isVerified: true,
          });
        }
      }
      return done(null, customer);
    } catch (err) { return done(err, null); }
  }));
}

//facebook login handling here using passport
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID:      process.env.FACEBOOK_APP_ID,
    clientSecret:  process.env.FACEBOOK_APP_SECRET,
    callbackURL:   `${process.env.BACKEND_URL}/api/customer/auth/facebook/callback`,
    profileFields: ["id", "displayName", "emails", "photos"],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let customer = await Customer.findOne({ facebookId: profile.id });
      if (!customer) {
        const email = profile.emails?.[0]?.value;
        if (email) customer = await Customer.findOne({ email });
        if (customer) {
          customer.facebookId = profile.id;
          customer.provider   = "facebook";
          if (!customer.avatar) customer.avatar = profile.photos?.[0]?.value || "";
          await customer.save();
        } else {
          customer = await Customer.create({
            name:       profile.displayName,
            email:      profile.emails?.[0]?.value || `fb_${profile.id}@nahid.com`,
            facebookId: profile.id,
            avatar:     profile.photos?.[0]?.value || "",
            provider:   "facebook",
            isVerified: true,
          });
        }
      }
      return done(null, customer);
    } catch (err) { return done(err, null); }
  }));
}

module.exports = passport;