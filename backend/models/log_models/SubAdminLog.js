const mongoose = require("mongoose");

const subAdminLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "registered",        
        "approved",        
        "rejected",          
        "deleted",           
        "profile_updated",  
        "password_changed", 
        "change_requested", 
        "change_approved",   
        "change_rejected",   
      ],
      required: true,
    },

    //subadmin
    subAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
      default: null,
    },
    subAdminName:  { type: String, required: true },
    subAdminEmail: { type: String, required: true },

    //who did it
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "performedByModel",
      default: null,
    },
    performedByModel: {
      type: String,
      enum: ["User", "SubAdmin"],
      default: "SubAdmin",
    },
    performedByName:  { type: String, default: "" },
    performedByRole:  { type: String, default: "subadmin" },

    //which changes
    changes: { type: Object, default: null },
    note:    { type: String, default: "" },
  },
  { timestamps: true }
);

const SubAdminLog =
  mongoose.models.SubAdminLog ||
  mongoose.model("SubAdminLog", subAdminLogSchema);

module.exports = SubAdminLog;