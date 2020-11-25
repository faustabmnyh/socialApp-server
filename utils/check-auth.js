const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

module.exports = (context) => {
  // because the context will have an object and have the headersand  many things

  // inside the header wo need to get the authorization header
  const authHeader = context.req.headers.authorization;
  // we need check of this because maybe someone didnt send this header
  if (authHeader) {
    // Bearer ....
    // why we need the space , because the space we want to put the token
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("invalid/Expired Token");
      }
    }

    throw new Error("Authentication token must be 'Bearer [token]'");
  }
  throw new Error("Authorization header must be provided");
};
