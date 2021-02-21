const express = require("express");
const bodyParser = require("body-parser");

const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const graphiqlSchema = require("./graphql/schema/index");
const graphqlResolver = require("./graphql/resolvers/index");
const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphiqlSchema,
    graphiql: true,
    rootValue: graphqlResolver,
  })
);

app.get("/", (req, res, next) => {
  res.send("hellp");
});
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@sandbox.c0umk.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("app listening...");
    });
  })
  .catch((error) => {
    console.log("inside mongoose error", error);
  });
