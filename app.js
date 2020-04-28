require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
// parse req.body as a json object
app.use(express.json());
app.use(cookieParser());

app.use(function (req, res, next) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
  console.log('Signed Cookies: ', req.signedCookies);  
  next();
})

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const songsRouter = require("./routes/songs");
app.use("/songs", songsRouter);

app.use(function(err, req, res, next) {
  // Internal server error
  // console.log(err)
  res.status(err.statusCode || 500);
  res.send(`${err}`);
});

module.exports = app;
