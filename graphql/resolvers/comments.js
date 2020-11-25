const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      }

      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        return await post.save();
      } else throw new UserInputError("Post not found");
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentId
        );
        console.log("this is comment index", post.comments);

        // we need to chech because maybe other users try to delete some other user comments
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          return await post.save();
        } else throw new AuthenticationError("Action not allowed");
      } else throw new UserInputError("Post not found");
    },
  },
};
