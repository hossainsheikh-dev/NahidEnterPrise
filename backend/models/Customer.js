const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const customerSchema = mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, default: "" },

    // ✅ phone — unique কিন্তু empty/null allow করবে (sparse)
    phone: {
      type:    String,
      default: undefined,
      sparse:  true,
    },

    avatar: { type: String, default: "" },

    // single saved address
    address: {
      label:    { type: String, default: "" },
      street:   { type: String, default: "" },
      thana:    { type: String, default: "" },
      district: { type: String, default: "" },
      phone:    { type: String, default: "" },
      note:     { type: String, default: "" },
    },

    // multiple addresses (future use)
    addresses: [
      {
        label:     { type: String, default: "Home" },
        address:   { type: String },
        city:      { type: String },
        phone:     { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // OAuth
    googleId:   { type: String, default: "" },
    facebookId: { type: String, default: "" },
    provider: {
      type:    String,
      enum:    ["local", "google", "facebook"],
      default: "local",
    },

    isVerified: { type: Boolean, default: false },
    isBlocked:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ phone unique index — শুধু যখন phone একটা real value আছে তখনই enforce হবে
// empty string বা null কে ignore করবে
customerSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: "string", $gt: "" } },
  }
);

// ─── pre-save hook ────────────────────────────────────────
customerSchema.pre("save", async function () {
  // ✅ phone "" হলে undefined করো — sparse index কাজ করবে
  if (this.phone === "" || this.phone === null) {
    this.phone = undefined;
  }

  if (!this.isModified("password") || !this.password) return;
  const salt   = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── instance method ──────────────────────────────────────
customerSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Customer", customerSchema);