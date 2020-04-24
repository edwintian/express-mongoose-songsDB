require("../utils/db");
const Joi = require("@hapi/joi");
const Song = require("../models/simpleSong.model");
//need to explore findByRegexp

const findAll = async () => {
  const foundSongs = await Song.find();
  return foundSongs;
};

const getAllSongs = (req, res, next) => {
  findAll()
    .then(data => {
      res.json(data);
    })
    .catch(err => next(err));
};

const findById = async input => {
  const filteredSong = await Song.findOne({ songId: input });
  return filteredSong;
};

const getOneSong = (req, res, next) => {
  findById(req.params.songId)
    .then(data => {
      if (data !== null) {
        res.json(data);
      } else {
        const err = new Error(
          "Unable to fetch songs due to id not found in songlist"
        );
        err.statusCode = 404;
        next(err);
      }
    })
    .catch(err => next(err));
};

const deleteOneById = async songId => {
  const deletedSong = await Song.findOneAndDelete(songId);
  return deletedSong;
};

const removeOneSong = (req, res, next) => {
  const songIdKey = Number(req.params.songId);
  deleteOneById(songIdKey)
    .then(data => {
      res.json(data);
    })
    .catch(err => next(err));
};

const findOneAndUpdate = async (filter, update) => {
  const updatedSong = await Song.findOneAndUpdate(filter, update, {
    new: true
  });
  return updatedSong;
};

const songSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  artist: Joi.string()
    .min(3)
    .max(30)
    .required()
});

const replaceOneSong = (req, res, next) => {
  const putContent = req.body;
  const result = songSchema.validate(putContent);
  if (result.error) {
    const err = new Error(result.error.details[0].message);
    err.statusCode = 400;
    next(err);
    //note that we should not have any more processing after calling next(err)
  } else {
    const songIdKey = Number(req.params.songId);
    findOneAndUpdate(
      { songId: songIdKey },
      { name: putContent.name, artist: putContent.artist }
    )
      .then(data => {
        if (data !== null) {
          res.json(data);
        } else {
          const err = new Error(
            "Unable to fetch songs due to id not found in songlist"
          );
          err.statusCode = 404;
          next(err);
        }
      })
      .catch(err => next(err));
  }
};

const getNextId = async () => {
  const latestId = await Song.find()
    .sort({ songId: -1 })
    .limit(1);
  let newId = 1;
  if (latestId.length > 0) {
    newId += latestId[0].songId;
  }
  return newId;
};

const createOne = async input => {
  const newSong = new Song(input);
  const createdObj = await newSong.save();
  return createdObj;
};

const createOneSong = async (req, res, next) => {
  const postContent = req.body;
  const result = songSchema.validate(postContent);
  if (result.error) {
    const err = new Error(result.error.details[0].message);
    err.statusCode = 400;
    next(err);
    //note that we should not have any more processing after calling next(err)
  } else {
    const id = await getNextId();
    postContent.id = id;
    createOne({
      songId: postContent.id,
      name: postContent.name,
      artist: postContent.artist
    })
      .then(data => {
        res.status(201).json(data);
      })
      .catch(err => next(err));
  }
};

module.exports = {
  getAllSongs,
  getOneSong,
  createOneSong,
  replaceOneSong,
  removeOneSong
};
