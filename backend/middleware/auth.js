const jwt = require("jsonwebtoken");
const secret_key = require('../config/auth.config.js');

const verifyToken = (request, response, next) => {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
  
    if (!token) {
      return response.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token, secret_key.secret);
      request.user = decoded;
    } catch (err) {
      return response.json({loggedin: false, message: "Invalid Token"});
    }
    return next();
  };
  
  module.exports = verifyToken;