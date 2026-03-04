const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Import Sublink model
const Sublink = require("./Sublink");

/* ===============================
   AUTO DELETE RELATED SUBLINKS
================================= */
linkSchema.pre("findOneAndDelete", async function () {
  const link = await this.model.findOne(this.getFilter());

  if (link) {
    await Sublink.deleteMany({ parent: link._id });
  }
});

module.exports = mongoose.model("Link", linkSchema);