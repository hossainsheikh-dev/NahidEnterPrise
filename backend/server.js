const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
const express      = require("express");
const dotenv       = require("dotenv");
const cors         = require("cors");
const mongoose     = require("mongoose");
const cookieParser = require("cookie-parser");
const http         = require("http");
const { Server }   = require("socket.io");
const jwt          = require("jsonwebtoken");
const passport = require("./config/passport")


dotenv.config();
const app    = express();
const server = http.createServer(app);


//spcket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://nahid-enter-prise.vercel.app",
    ],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role || decoded.userType || 'subadmin';
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId   = socket.userId.toString();
  const userRole = socket.userRole;

  onlineUsers.set(userId, socket.id);
  io.emit("online_users", Array.from(onlineUsers.keys()));

  socket.on("send_message", async ({ receiverId, receiverModel, text, senderName, _tempId }) => {
    try {
      const Message = require("./models/Message");
      const senderModel   = (userRole === "admin" || userRole === "user") ? "User" : "SubAdmin";
      const senderIdStr   = userId.toString();
      const receiverIdStr = receiverId.toString();

      const msg = await Message.create({
        senderId: senderIdStr, senderModel, senderName,
        senderRole: userRole, receiverId: receiverIdStr, receiverModel, text,
      });

      const msgWithTemp = msg.toObject();
      if (_tempId) msgWithTemp._tempId = _tempId;

      const receiverSocket = onlineUsers.get(receiverIdStr);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", msgWithTemp);
      } else {
        console.log("Receiver not found:", receiverIdStr);
        console.log("Online users:", Array.from(onlineUsers.keys()));
      }

      socket.emit("message_sent", msgWithTemp);
    } catch (e) {
      console.log("❌ send_message error:", e.message);
      socket.emit("message_error", { error: e.message, _tempId });
    }
  });

  socket.on("typing", ({ receiverId, isTyping }) => {
    const receiverIdStr  = receiverId.toString();
    const receiverSocket = onlineUsers.get(receiverIdStr);
    if (receiverSocket) {
      io.to(receiverSocket).emit("user_typing", { senderId: userId, isTyping });
    }
  });

  socket.on("mark_seen", async ({ senderId }) => {
    try {
      const Message    = require("./models/Message");
      const senderIdStr = senderId.toString();
      await Message.updateMany(
        { senderId: senderIdStr, receiverId: userId, seen: false },
        { seen: true, seenAt: new Date() }
      );
      const senderSocket = onlineUsers.get(senderIdStr);
      if (senderSocket) {
        io.to(senderSocket).emit("messages_seen", { by: userId });
      }
    } catch (e) {
      console.log("mark_seen error:", e.message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId.toString());
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

app.set("io", io);



//core config
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://nahid-enter-prise.vercel.app",
  ],
  credentials: true,
}));



//middlewares
app.use(passport.initialize()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



//models
require("./models/User");
require("./models/SubAdmin");
require("./models/Customer");                      
require("./models/log_models/SubAdminLog");
require("./models/Message");
require("./models/log_models/ProductLog");
require("./models/log_models/LinkLog");

//db connectoin
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  });



//routes
app.get("/", (req, res) => {
  res.send("Nahid Enterprise Server Running");
});

app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/auth",          require("./routes/otpRoutes"));
app.use("/api/links",         require("./routes/linkRoutes"));
app.use("/api/sublinks",      require("./routes/sublinkRoutes"));
app.use("/api/navbar-links",  require("./routes/navbarLinkRoutes"));
app.use("/api/products",      require("./routes/productRoutes"));
app.use("/api/orders",        require("./routes/orderRoutes"));
app.use("/api/search",        require("./routes/searchRoutes"));
app.use("/api/category",      require("./routes/categoryRoutes"));
app.use("/api/subadmin",      require("./routes/subAdminRoutes"));
app.use("/api/subadmin-logs", require("./routes/subAdminLogRoutes"));
app.use("/api/chat",          require("./routes/chatRoutes"));
app.use("/api/analytics",     require("./routes/analyticsRoutes"));
app.use("/api/customer",      require("./routes/customerRoutes")); // ← NEW



//test rooute
app.get("/test-subadmin", async (req, res) => {
  try {
    const SubAdmin = require("./models/SubAdmin");
    const sub = await SubAdmin.findById("69b490b9e60da3f835c44c27").select("name email status");
    res.json(sub);
  } catch (err) {
    res.json({ error: err.message });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



//setting routes is here
require("./models/Settings"); // models preload এ
app.use("/api/settings", require("./routes/settingsRoutes")); // routes এ