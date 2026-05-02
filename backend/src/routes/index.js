const express = require("express");

const { getHealth } = require("../controllers/healthController");
const authRoutes = require("./authRoutes");
const registrationRoutes = require("./registrationRoutes");
const urlRoutes = require("./urlRoutes");

const router = express.Router();

router.get("/health", getHealth);
router.use("/register", registrationRoutes);
router.use("/auth", authRoutes);
router.use("/urls", urlRoutes);

module.exports = router;
