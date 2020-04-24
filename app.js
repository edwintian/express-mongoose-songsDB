const express = require("express");
const app = express();

// parse req.body as a json object
app.use(express.json());

const songsRouter = require("./routes/songs");
app.use("/songs", songsRouter);

app.use(function(err, req, res, next) {
  // Internal server error
  // console.log(err)
  res.status(err.statusCode || 500);
  res.send(`${err}`);
});

module.exports = app;
