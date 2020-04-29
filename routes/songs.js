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
//const {protectRoute} = require("../utils/helper");

router.get("", getAllSongs);

router.get("/:songId", getOneSong);

router.delete("/:songId", removeOneSong);

router.put("/:songId", requireJsonContent, replaceOneSong);

router.post("", requireJsonContent, createOneSong);

module.exports = router;
