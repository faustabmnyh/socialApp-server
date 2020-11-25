const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  user: {
    // this measns To specify a type of ObjectId or Mongoose assigns each of your schemas an _id field by default if one is not passed into the Schema constructor. The type assigned is an ObjectId to coincide with MongoDB's default behavior.
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Posts", postSchema);
