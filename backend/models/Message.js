const mongoose = require("mongoose");


//admin-subadmin message schema
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'SubAdmin']
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true,
    enum: ['admin', 'subadmin']
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'SubAdmin']
  },
  receiverName: String,
  text: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  seenAt: Date,

  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);