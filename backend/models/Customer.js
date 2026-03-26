const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const customerSchema = mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  phone:    { type: String, default: "" },
  avatar:   { type: String, default: "" },

  // adress
  address: {
    label:    { type: String, default: "" },  
    street:   { type: String, default: "" },  
    thana:    { type: String, default: "" },   
    district: { type: String, default: "" },   
    phone:    { type: String, default: "" }, 
    note:     { type: String, default: "" },   
  },

  addresses: [
    {
      label:    { type: String, default: "Home" },
      address:  { type: String },
      city:     { type: String },
      phone:    { type: String },
      isDefault:{ type: Boolean, default: false },
    }
  ],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

  // OAuth
  googleId:   { type: String, default: "" },
  facebookId: { type: String, default: "" },
  provider:   { type: String, enum: ["local", "google", "facebook"], default: "local" },

  isVerified: { type: Boolean, default: false },
  isBlocked:  { type: Boolean, default: false },

}, { timestamps: true });

customerSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);