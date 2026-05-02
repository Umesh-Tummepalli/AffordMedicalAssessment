const express = require("express");

const { issueToken, refreshToken } = require("../controllers/authController");

const router = express.Router();

router.post("/token", issueToken);
router.post("/refresh", refreshToken);

module.exports = router;
