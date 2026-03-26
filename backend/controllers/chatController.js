const Message = require("../models/Message");



//get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const myId = req.user?._id || req.subAdmin?._id;

    if (!myId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const otherId = req.params.otherId;

    const messages = await Message.find({
      $or: [
        { senderId: myId.toString(),    receiverId: otherId.toString() },
        { senderId: otherId.toString(), receiverId: myId.toString()    },
      ],
    }).sort({ createdAt: 1 }).limit(100);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.log("getChatHistory error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//mark message in seen
exports.markSeen = async (req, res) => {
  try {
    const myId = req.user?._id || req.subAdmin?._id;

    if (!myId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const otherId = req.params.otherId;

    await Message.updateMany(
      { senderId: otherId.toString(), receiverId: myId.toString(), seen: false },
      { seen: true, seenAt: new Date() }
    );

    res.json({ success: true });
  } catch (error) {
    console.log("markSeen error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



//get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const myId = req.user?._id || req.subAdmin?._id;

    if (!myId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const count = await Message.countDocuments({
      receiverId: myId.toString(),
      seen: false,
    });

    res.json({ count });
  } catch (error) {
    console.log("getUnreadCount error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};