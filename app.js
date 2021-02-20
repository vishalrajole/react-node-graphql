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
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
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
        const event = {
          _id: Math.random().toString(),
          title: args.title,
          description: args.description,
          price: +args.price,
          date: new Date().toISOString(),
        };

        return event;
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
