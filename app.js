const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
    type RootQuery {
        events: [String!]!
    }

    type RootMutation {
        createEvent(name: String): String
    }

    schema {
        query: RootQuery , 
        mutation: RootMutation
    }
    `),
    graphiql: true,

    //resolvers
    rootValue: {
      events: () => {
        return ["dummy", "test"];
      },
      createEvent: (args) => {
        const name = args.name;
        return name;
      },
    },
  })
);

app.get("/", (req, res, next) => {
  res.send("hellp");
});
app.listen(3000, () => {
  console.log("app listening...");
});
