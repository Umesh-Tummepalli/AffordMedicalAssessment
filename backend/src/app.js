const cors = require("cors");
const express = require("express");

const env = require("./config/env");
const { redirectToOriginalUrl } = require("./controllers/urlController");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const requestContext = require("./middleware/requestContext");
const requestLogger = require("./middleware/requestLogger");
const apiRouter = require("./routes");

const app = express();

app.set("publicBaseUrl", env.publicBaseUrl);
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(requestContext);
app.use(requestLogger);
app.get("/r/:shortCode", redirectToOriginalUrl);
app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
