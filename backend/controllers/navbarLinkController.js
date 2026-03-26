const Link = require("../models/Link");
const Sublink = require("../models/Sublink");


//get navbar links with sublinks 
exports.getNavbarLinks = async (req, res) => {
  try {

    // get all active links
    const links = await Link.find({ isActive: true })
      .sort({ createdAt: 1 })
      .lean();

    // get all active sublinks
    const sublinks = await Sublink.find({ isActive: true })
      .lean();

    // attached sublink with their parents
    const navbarData = links.map(link => ({
      _id: link._id,
      name: link.name,
      slug: link.slug,
      sublinks: sublinks.filter(
        sub => sub.parent.toString() === link._id.toString()
      ),
    }));

    res.status(200).json({
      success: true,
      data: navbarData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};