const express  = require("express");
const router   = express.Router();
const Order    = require("../models/Order");
const Product  = require("../models/Product");
const Link     = require("../models/Link");
const Sublink  = require("../models/Sublink");
const SubAdmin = require("../models/SubAdmin");
const { protect } = require("../middleware/authMiddleware"); 



//fullanalytics snapshot for the admin
router.get("/", protect, async (req, res) => {
  try {
    const now    = new Date();
    const y      = now.getFullYear();
    const m      = now.getMonth(); // 0-indexed

    //all order
    const allOrders = await Order.find({}).lean();

    //12 months revenue
    const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
      const d     = new Date(y, m - 11 + i, 1);
      const label = d.toLocaleString("en-BD", { month: "short", year: "2-digit" });
      const mn    = d.getMonth();
      const yr    = d.getFullYear();
      const rev   = allOrders
        .filter(o =>
          ["delivered","confirmed"].includes(o.status) &&
          new Date(o.createdAt).getMonth()      === mn &&
          new Date(o.createdAt).getFullYear()   === yr
        )
        .reduce((s, o) => s + (o.total || 0), 0);
      const orders = allOrders.filter(o =>
        new Date(o.createdAt).getMonth()    === mn &&
        new Date(o.createdAt).getFullYear() === yr
      ).length;
      return { label, revenue: rev, orders };
    });

    //ordered bby status
    const statusCount = ["pending","confirmed","processing","shipped","delivered","cancelled"]
      .map(s => ({ status: s, count: allOrders.filter(o => o.status === s).length }));

    //order by payment method
    const paymentCount = ["cod","bkash","nagad"].map(p => ({
      method: p,
      count: allOrders.filter(o => o.paymentMethod === p).length,
      revenue: allOrders
        .filter(o => o.paymentMethod === p && ["delivered","confirmed"].includes(o.status))
        .reduce((s, o) => s + (o.total || 0), 0),
    }));

    //order details
    const dailyOrders = Array.from({ length: 30 }, (_, i) => {
      const d   = new Date(now); d.setDate(now.getDate() - 29 + i);
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const next= new Date(day); next.setDate(day.getDate() + 1);
      const label = d.toLocaleString("en-BD", { day: "numeric", month: "short" });
      const count = allOrders.filter(o => {
        const c = new Date(o.createdAt);
        return c >= day && c < next;
      }).length;
      const revenue = allOrders
        .filter(o => {
          const c = new Date(o.createdAt);
          return c >= day && c < next && ["delivered","confirmed"].includes(o.status);
        })
        .reduce((s, o) => s + (o.total || 0), 0);
      return { label, count, revenue };
    });

    //top 5 product
    const soldMap = {};
    allOrders
      .filter(o => ["delivered","confirmed"].includes(o.status))
      .forEach(o => (o.items || []).forEach(item => {
        const id = String(item.productId || item.name);
        if (!soldMap[id]) soldMap[id] = { name: item.name, qty: 0, revenue: 0 };
        soldMap[id].qty     += item.quantity || 1;
        soldMap[id].revenue += (item.salePrice || item.price || 0) * (item.quantity || 1);
      }));
    const topProducts = Object.values(soldMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    //top districts
    const districtMap = {};
    allOrders.forEach(o => {
      const d = o.customer?.district || "Unknown";
      districtMap[d] = (districtMap[d] || 0) + 1;
    });
    const topDistricts = Object.entries(districtMap)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    //summary kpis
    const totalRevenue    = allOrders.filter(o => ["delivered","confirmed"].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders     = allOrders.length;
    const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;
    const cancelledOrders = allOrders.filter(o => o.status === "cancelled").length;
    const avgOrderValue   = totalOrders > 0 ? Math.round(totalRevenue / Math.max(deliveredOrders, 1)) : 0;

    //last month vs current month
    const thisMonth = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    const lastMonth = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      const lm = m === 0 ? 11 : m - 1;
      const ly = m === 0 ? y - 1 : y;
      return d.getMonth() === lm && d.getFullYear() === ly;
    });
    const thisMonthRevenue = thisMonth.filter(o => ["delivered","confirmed"].includes(o.status)).reduce((s,o) => s+(o.total||0), 0);
    const lastMonthRevenue = lastMonth.filter(o => ["delivered","confirmed"].includes(o.status)).reduce((s,o) => s+(o.total||0), 0);
    const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

    //countess
    const [totalProducts, totalLinks, totalSublinks, totalSubAdmins] = await Promise.all([
      Product.countDocuments(),
      Link.countDocuments(),
      Sublink.countDocuments(),
      SubAdmin.countDocuments({ status: "approved" }),
    ]);

    res.json({
      success: true,
      data: {
        kpi: {
          totalRevenue, totalOrders, deliveredOrders, cancelledOrders,
          avgOrderValue, revenueGrowth,
          thisMonthRevenue, lastMonthRevenue,
          totalProducts, totalLinks, totalSublinks, totalSubAdmins,
          deliveryRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
          cancelRate:   totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0,
        },
        revenueByMonth,
        dailyOrders,
        statusCount,
        paymentCount,
        topProducts,
        topDistricts,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;