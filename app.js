const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");

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
        return Event.find()
          .then((events) => {
            return events.map((event) => {
              return { ...event._doc };
            });
          })
          .catch((error) => {
            console.log("failed to fetch events", events);
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });

        return event
          .save()
          .then((result) => {
            return { ...result._doc };
          })
          .catch((error) => {
            console.log("event save error", error);
            throw error;
          });
      },
    },
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
