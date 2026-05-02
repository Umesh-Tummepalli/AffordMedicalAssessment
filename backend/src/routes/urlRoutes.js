const express = require("express");

const {
  createShortUrl,
  deleteShortUrl,
  getShortUrl,
  getShortUrlStats,
  listShortUrls,
} = require("../controllers/urlController");
const requireAccessToken = require("../middleware/requireAccessToken");

const router = express.Router();

router.use(requireAccessToken);
router.post("/", createShortUrl);
router.get("/", listShortUrls);
router.get("/:shortCode/stats", getShortUrlStats);
router.get("/:shortCode", getShortUrl);
router.delete("/:shortCode", deleteShortUrl);

module.exports = router;
