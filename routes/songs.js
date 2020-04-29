const express = require("express");
const router = express.Router();
const { requireJsonContent } = require("../utils/helper");
const {
  getAllSongs,
  getOneSong,
  createOneSong,
  replaceOneSong,
  removeOneSong
} = require("../controllers/songs.controller");
const {protectRoute} = require("../utils/helper");

router.get("", getAllSongs);

router.get("/:songId", getOneSong);

router.delete("/:songId", protectRoute, removeOneSong);

router.put("/:songId", protectRoute, requireJsonContent, replaceOneSong);

router.post("", requireJsonContent, createOneSong);

module.exports = router;
