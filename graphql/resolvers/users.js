const { UserInputError } = require("apollo-server");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");
const User = require("../../models/User");
const { SECRET_KEY } = require("../../config");

const generateToken = (res) => {
  return jwt.sign(
    {
      id: res.id,
      email: res.email,
      username: res.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
};

module.exports = {
  Mutation: {
    login: async (_, { username, password }) => {
      const { errors, valid } = validateLoginInput(username, password);
      const user = await User.findOne({ username });

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      } else if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      // for check the user password if correct or not
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Credential";
        throw new UserInputError("Wrong Credential", { errors });
      }

      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    register: async (
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) => {
      // validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        password,
        email,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // make sure user doesnt already exist
      const user = await User.findOne({ username });
      // this is for email already exist
      const em = await User.findOne({ email });

      if (user || em) {
        // this UserInputError means like later apollo client will be able recognized the type of error and handle it
        throw new UserInputError("Username already exist", {
          // this is errors object for frontend
          errors: {
            username: "This username already exist",
          },
        });
      } else if (em) {
        throw new UserInputError("Email already exist", {
          errors: {
            email: "This email already exist",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);
      //  why we using asyc await because we use bcrypt , and the bcrypt function is asyncronus

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
