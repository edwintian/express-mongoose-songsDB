const request = require("supertest");
const app = require("./app");
//const Song = require("./models/simpleSong.model");
const { teardownMongoose } = require("./test/mongoose");

describe("/songs", () => {
  afterAll(async () => await teardownMongoose());

  it("POST /songs respond with status 400 and correct string when sending non-json", async () => {
    const { text } = await request(app)
      .post("/songs")
      .send("This is not json!")
      .expect(400);
    expect(text).toEqual("Server wants application/json!");
  });

  it("POST /songs should add a song and return a new song object", async () => {
    const newSong = { name: "test movie", artist: "rhianna" };
    const expectedSong = { name: "test movie", artist: "rhianna" };

    const { body: actualSong } = await request(app)
      .post("/songs")
      .send(newSong)
      .expect(201);

    expect(actualSong).toMatchObject(expectedSong);
  });

  it("GET /songs should return an array of songs", async () => {
    const expectedSong = [{ name: "test movie", artist: "rhianna" }];
    const { body: actualSong } = await request(app)
      .get("/songs")
      .expect(200);
    expect(actualSong).toMatchObject(expectedSong);
  });  

  it("POST /songs should add a song with a new id", async () => {
    const newSong = { name: "test 2", artist: "rhianna" };

    const { body: actualSong } = await request(app)
      .post("/songs")
      .send(newSong)
      .expect(201);

      const expectedSongRetrieved = { name: "test 2", artist: "rhianna" };
      const { body: actualRetrievedSong } = await request(app)
        .get("/songs/2")
        .expect(200);
      expect(actualRetrievedSong).toMatchObject(expectedSongRetrieved);
  });

  it("GET /songs/:id should return the correct song", async () => {
    const expectedSong = { name: "test movie", artist: "rhianna" };
    const { body: actualSong } = await request(app)
      .get("/songs/1")
      .expect(200);
    expect(actualSong).toMatchObject(expectedSong);
  });

  it("PUT /songs/:id should modify existing song and return a new song object", async () => {
    const newSong = { name: "test movie 2", artist: "rhianna" };
    const expectedSong = { name: "test movie 2", artist: "rhianna" };

    const { body: actualSong } = await request(app)
      .put("/songs/1")
      .send(newSong)
      .expect(200);

    expect(actualSong).toMatchObject(expectedSong);
  });

  it("DELETE /songs/:id should remove song and return a new song object", async () => {
    const expectedSong = { name: "test movie 2", artist: "rhianna" };
    const { body: actualSong } = await request(app)
      .delete("/songs/1")
      .expect(200);
    expect(actualSong).toMatchObject(expectedSong);
  });

  it("GET /songs/:id should return 404 when songid does not exist", async () => {
    await request(app)
      .get("/songs/1")
      .expect(404);
  });

  it("PUT /songs/:id should return 404 when songid does not exist", async () => {
    await request(app)
      .put("/songs/1")
      .send({ name: "test movie 2", artist: "rhianna" })
      .expect(404);
  });

  it("PUT /songs/:id should return 400 when client input does not pass JOI", async () => {
    await request(app)
      .put("/songs/1")
      .send({ nonsenseKey: "test movie 2", artist: "rhianna" })
      .expect(400);
  });

  it("POST /songs should return 400 when client input does not pass JOI", async () => {
    await request(app)
      .post("/songs")
      .send({ nonsenseKey: "test movie 2", artist: "rhianna" })
      .expect(400);
  });
});
