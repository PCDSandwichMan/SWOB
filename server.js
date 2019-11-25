const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const config = require("./utils/config");
const helmet = require("helmet");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// Route Imports
const userRoute = require("./routes/userRoutes");
const dataRoute = require("./routes/dataRoutes");
const notificationRoute = require("./routes/notificationsRoutes");
const squadRoute = require("./routes/squadRoutes");

const database = mongoose.connection;

database.on("error", err => console.log(err));

database.once("open", () => {
  // Route Setup
  app.use("/user", userRoute);
  app.use("/data", dataRoute);
  app.use("/notifications", notificationRoute);
  app.use("/squad", squadRoute);
  

  // Route 404 Fallback
  app.use((req, res, next) => {
    if (req.accepts("json")) {
      res.status(404).json({ error: "this route could not be found" });
    }
    next();
  });

  // Server Connection
  app.listen(config.PORT, () =>
    console.log(`app listening on PORT: ${config.PORT}`)
  );
});
