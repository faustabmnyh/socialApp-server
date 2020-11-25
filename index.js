const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
// this is for subscription
const pubsub = new PubSub();

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  //  to take the request body and forwarded into the context and that we can use the body in our context
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(
    "mongodb+srv://fausta:kIc92MSqEAK5NUnw@cluster0.jx3rb.mongodb.net/socialApp?retryWrites=true&w=majority",
    { useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected DB");
    return server.listen({ port: PORT });
  })
  .then(({ url }) => console.log(`Listening at ${url}`))
  .catch((err) => console.error(err));
