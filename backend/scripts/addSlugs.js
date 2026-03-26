const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected...");

  const products = await Product.find({});

  for (const p of products) {
    p.markModified("name");
    await p.save();
    console.log(`✅ ${p.name} → ${p.slug}`);
  }

  console.log("\n🎉 All products slugged!");
  process.exit();
}).catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});