const User = require("../models/user.model.js");
const userData = require("../data/testUserData");
const request = require("supertest");
const app = require("../app");
const { teardownMongoose } = require("../test/mongoose");
const jwt = require("jsonwebtoken");
let signedInAgent;

describe("users route", () => {

  afterAll(async () => await teardownMongoose());

  beforeEach(async () => {
    await User.create(userData);
    signedInAgent = request.agent(app);
    const something = await signedInAgent.post("/users/login").send(userData);
    //console.log(something);
  });

  afterEach(async () => {
    await User.deleteMany();
    jest.resetAllMocks();
  });

  it("1) POST should return new user", async () => {
    const expectedUser = {
      username: "newuser",
      password: "123456789"
    };
    const { body: actualUser } = await request(app)
      .post("/users")
      .send(expectedUser)
      .expect(200);

    expect(actualUser.username).toBe(expectedUser.username);
    expect(actualUser.password).not.toBe(expectedUser.password);
  });

  it("2) GET should return new user", async () => {
    const { password, username } = userData;
    const expectedUserName = username;
    jwt.verify = jest.fn();
    jwt.verify.mockReturnValueOnce({ name: expectedUserName });
    const { body: actualUser } = await signedInAgent
      .get(`/users/${expectedUserName}`)
      .set("Cookie", "token=dummy-token")
      .expect(200);
    expect(jwt.verify).toBeCalledTimes(1);
    expect(actualUser[0].username).toBe(expectedUserName);
  });

  it("3) GET should respond with 403 Forbidden for incorrect user ", async () => {
    const { password } = userData;
    const expectedUserName = "wrongUser";
    jwt.verify = jest.fn();
    jwt.verify.mockReturnValueOnce({ name: "ash3" });
    const { body: actualUser } = await signedInAgent
      .get(`/users/${expectedUserName}`)
      .set("Cookie", "token=dummy-token")
      .expect(403);
    expect(jwt.verify).toBeCalledTimes(1);
  });

  it("4) GET should respond with 401 Unauthorized when there is no token", async () => {
    const { password } = userData;
    const expectedUserName = "ash3";
    const { body: actualUser } = await request(app)
      .get(`/users/${expectedUserName}`)
      .set("Cookie", "missingToken=nonsense")
      .expect(401);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("5) GET should respond with 401 Unauthorized when token is invalid", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error();
    });
    const { password } = userData;
    const userName = "ash3";
    const { body: actualUser } = await signedInAgent
      .get(`/users/${userName}`)
      .set("Cookie", "token=invalid")
      .expect(401);
    expect(jwt.verify).toBeCalledTimes(1);
  });

  it("6) POST should logs owner in if password is correct", async () => {
    const { username, password } = userData;
    const expectedUser = {
      username,
      password
    };
    const { text } = await request(app)
      .post("/users/login")
      .send(expectedUser)
      .expect(200);
    expect(text).toEqual("You are now logged in!");
  });

  it("7) POST should not log user in when password is incorrect", async () => {
    const { username } = userData;
    const expectedUser = {
      username,
      password: "nonsense"
    };
    const { text } = await request(app)
      .post("/users/login")
      .send(expectedUser)
      .expect(400);
    expect(text).toEqual("Error: Bad Request");
  });

  it("8) POST should display logout message to useras expected", async () => {
    const { username } = userData;
    const expectedUser = {
      username,
      password: "nonsense"
    };
    const response = await request(app)
      .post("/users/logout")
      .send(expectedUser)
      .expect(200);
    expect(response.text).toEqual("You are now logged out!");
    expect(response.headers["set-cookie"][0]).toMatch(/^token=/);
  });
});
