const express = require("express");
const router  = express.Router();
const Product = require("../models/Product");

//Levenshtein distance (edit distance between two strings)
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}


function fuzzyScore(productName, query) {
  if (!productName || !query) return 0;
  const q     = query.toLowerCase().trim();
  const words = productName.toLowerCase().split(/[\s\-_,./]+/).filter(Boolean);
  const tol   = q.length <= 4 ? 1 : q.length <= 6 ? 2 : 3;

  let best = 0;
  for (const word of words) {
    //exact match
    if (word === q)                        { best = Math.max(best, 100); continue; }
    //query is contained in word (prefix/substring)
    if (word.includes(q))                  { best = Math.max(best, 80);  continue; }
    //fuzzy (edit distance)
    const dist = levenshtein(word, q);
    if (dist <= tol) best = Math.max(best, Math.max(0, 70 - dist * 10));
  }
  return best;
}


router.get("/", async (req, res) => {
  try {
    const q     = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit) || 8, 40);

    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const all = await Product.find({})
      .select("name slug image images price discountType discountValue stock createdAt")
      .lean();

    const scored = all
      .map(p => ({ p, score: fuzzyScore(p.name, q) }))
      .filter(x => x.score >= 60)           // minimum threshold
      .sort((a, b) => b.score - a.score)    // best match first
      .slice(0, limit);

    const data = scored.map(({ p }) => {
      // salePrice
      let salePrice = p.price;
      if (p.discountType === "percentage" && p.discountValue > 0)
        salePrice = Math.round(p.price * (1 - p.discountValue / 100));
      else if (p.discountType === "fixed" && p.discountValue > 0)
        salePrice = Math.max(0, p.price - p.discountValue);

      // image
      let image = "";
      if (p.image?.url)                              image = p.image.url;
      else if (typeof p.image === "string" && p.image) image = p.image;
      else if (Array.isArray(p.images) && p.images[0])
        image = p.images[0]?.url || p.images[0] || "";

      return { _id: p._id, name: p.name, slug: p.slug, image, price: p.price, salePrice, stock: p.stock, createdAt: p.createdAt };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("SEARCH ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;