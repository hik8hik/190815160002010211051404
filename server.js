require("dotenv").config({ path: "./config.env" });
const cors = require("cors");
const express = require("express");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

//connecting DB
connectDB();

const app = express();

// START: middlewares
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));

////// ErrorHandler(errorhandler should be the last piece of middleware)///
app.use(errorHandler);

// END: middlewares

const PORT = process.env.PORT;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});
