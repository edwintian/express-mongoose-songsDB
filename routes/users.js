const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const {createJWTToken, protectRoute} = require("../utils/helper");

router.post("/logout", (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      const err = new Error("Bad Request");
      err.statusCode = 400;
      throw err;
    }

    const token = createJWTToken(user.username);

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = oneDay * 7;
    const expiryDate = new Date(Date.now() + oneWeek);

    // Can expiry date on cookie be changed? How about JWT token?
    res.cookie("token", token, {
      expires: expiryDate,
      httpOnly: true, // client-side js cannot access cookie info
      //secure: true, // use HTTPS
      signed: true,
    });

    res.send("You are now logged in!");
  } catch (err) {
    if (err.message === "Login failed") {
      err.statusCode = 400;
    }
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.send(newUser);
  } catch (err) {
    next(err);
  }
});

router.get("/:username", protectRoute, async (req, res, next) => {
  try {
    const username = req.params.username;
    const regex = new RegExp(username, "gi");
    const users = await User.find({ username: regex }, 'username').select('-_id');
    res.send(users);
  } catch (err) {
          next(err);
  }
});

module.exports = router;
