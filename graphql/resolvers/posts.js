const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Query: {
    getPosts: async () => {
      // maybe my query wont never failed, and then if that failed thats will be stop the actual server and thats why we use this
      try {
        return await Post.find().sort({ createdAt: -1 });
      } catch (err) {
        throw new Error(err);
      }
    },
    getPost: async (_, { postId }) => {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createPost: async (_, { body }, context) => {
      // user will login and get an authentication token and they need to put it and then authorization header and send the header with the request and we need to get the token and then decode that, get information and make sure the user authenticated  because we dont want to need anyone creating the post
      const user = checkAuth(context);

      if (body.trim() === "") {
        throw new UserInputError("Error post not be empty", {
          errors: {
            body: "Post not be empty",
          },
        });
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      // (subscription)   we want as well publish , this is to hold the pubsub
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },
    deletePost: async (_, { postId }, context) => {
      const { username } = checkAuth(context);
      try {
        const post = await Post.findById(postId);

        if (username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    likePost: async (_, { postId }, context) => {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // post already like , unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // not liked , like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        return await post.save();
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
