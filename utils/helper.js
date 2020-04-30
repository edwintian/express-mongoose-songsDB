const jwt = require("jsonwebtoken");

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing secrets to sign JWT token");
  }
  return secret;
};

const createJWTToken = username => {
  const today = new Date();
  const exp = new Date(today);

  const secret = getJWTSecret();
  exp.setDate(today.getDate() + 60); // adding days

  const payload = { name: username, exp: parseInt(exp.getTime() / 1000) };
  const token = jwt.sign(payload, secret);
  return token;
};

const requireJsonContent = (req, res, next) => {
  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send("Server wants application/json!");
  } else {
    next();
  }
};

const protectRoute = (req, res, next) => {
  try {
    //no token check
    if (!req.signedCookies.token) {
      const err = new Error("You are not authorized");
      err.statusCode = 401;
      throw err;
    }
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    //invalid user check
    if (
      req.params.username &&
      req.user.name !== req.params.username
    ) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }
    next();
  } catch (err) {
    // jwt.verify threw error, meaning invalid token
    if (!err.statusCode) {
      err.statusCode = 401;
    }
    next(err);
  }
};

module.exports = {
  requireJsonContent,
  createJWTToken,
  protectRoute
};
