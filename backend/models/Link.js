const mongoose = require("mongoose");


//link shcema
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



//import sublink
const Sublink = require("./Sublink");

//delete related sublinks
linkSchema.pre("findOneAndDelete", async function () {
  const link = await this.model.findOne(this.getFilter());

  if (link) {
    await Sublink.deleteMany({ parent: link._id });
  }
});

module.exports = mongoose.model("Link", linkSchema);