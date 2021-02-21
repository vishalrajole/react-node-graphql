const Event = require("../../models/event");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (error) {
    throw new Error("User not found with specified ID");
  }
};

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        creator: user.bind(this, event.creator),
      };
    });
  } catch (error) {
    throw new Error("Events not found");
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return {
          ...event._doc,
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (error) {
      throw new Error("failed to fetch events", error);
    }

    // return Event.find()
    //   .then((events) => {
    //     return events.map((event) => {
    //       return { ...event._doc };
    //     });
    //   })
    //   .catch((error) => {
    //     console.log("failed to fetch events", events);
    //   });
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
};
