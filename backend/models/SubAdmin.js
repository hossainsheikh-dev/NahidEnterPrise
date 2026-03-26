const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");


//subadmin schema
const subAdminSchema = mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone:    { type: String, default: "" },
    role:     { type: String, default: "subadmin" },
    status:   { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },

    inviteToken: { type: String, required: true },

    changeRequests: [
      {
        type:      { type: String, enum: ["email", "phone"] },
        newValue:  { type: String },
        status:    { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

subAdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt   = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

subAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("SubAdmin", subAdminSchema);