const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/user");

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

    type User {
        _id: ID!,
        email: String!
        password: String
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input UserInput {
        email: String!
        password: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
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
      createEvent: async (args) => {
        const mockedUser = "60322358f800af693edd11de";
        const { title, description, price, date } = args.eventInput;
        try {
          const event = new Event({
            title,
            description,
            price: +price,
            date,
            creator: mockedUser,
          });
          const savedEvent = await event.save();
          const user = await User.findById(mockedUser);
          if (!user) {
            throw new Error("event creating user not found");
          }
          await user.createdEvents.push(savedEvent);
          await user.save();
          return savedEvent;
        } catch (error) {
          throw new Error("create event failed", error);
        }
        // const event = new Event({
        //   title: args.eventInput.title,
        //   description: args.eventInput.description,
        //   price: +args.eventInput.price,
        //   date: new Date(args.eventInput.date),
        //   creator: "60321a9112380a637229707e",
        // });
        // let createdEvent;
        // return event
        //   .save()
        //   .then((result) => {
        //     createdEvent = { ...result._doc };
        //     return User.findById("60321a9112380a637229707e")
        //       .then((user) => {
        //         if (!user) {
        //           throw new Error("Creating user not found");
        //         }
        //         user.createdEvents.push(event);
        //         return user.save();
        //       })
        //       .then((result) => {
        //         return createdEvent;
        //       });
        //   })
        //   .catch((error) => {
        //     console.log("event save error", error);
        //     throw error;
        //   });
      },
      createUser: async (args) => {
        const { email, password } = args.userInput;
        try {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            throw new Error("User already exists");
          }
          const hashedPassword = await bcrypt.hash(password, 12);
          const user = new User({
            email,
            password: hashedPassword,
          });
          const result = await user.save();
          return result;
        } catch (error) {
          throw new Error("create user failed", error);
        }
        // return User.findOne({ email: args.userInput.email })
        //   .then((user) => {
        //     if (user) {
        //       throw new Error("User exists already");
        //     }
        //     return bcrypt.hash(args.userInput.password, 12);
        //   })
        //   .then((hashedPassword) => {
        //     const user = new User({
        //       email: args.userInput.email,
        //       password: hashedPassword,
        //     });

        //     return user
        //       .save()
        //       .then((result) => {
        //         return { ...result._doc };
        //       })
        //       .catch((error) => {
        //         console.log("user save error", error);
        //         throw error;
        //       });
        //   });
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
