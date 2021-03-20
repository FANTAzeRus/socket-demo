const moment = require("moment");

const OPTIONS = {
  cors: {
    origin: "*",
    methods: ["*"],
  },
};
const PORT = 5000;

const USERS = [];
const EVENTS = new Map([
  [
    "JOIN",
    (socket, payload) => {
			let user = USERS.find(u=>u.name === payload.name);
			
			if(user) {
				user = USERS.get(socket.id);
				user.FIRSTTOME = false;
			} else {
				user = {
					NAME: payload.NAME,
					ROOM: payload.ROOM,
					ONLINE: true,
				}
			}

			USERS.set(socket.id, user);
		}
      
      socket.emit("SEND", {
        ACTION: "WELCOME",
        PAYLOAD: {
          NAME: "Chat bot",
          TEXT: `${payload.NAME}, приветствую Вас в чате!`,
          DATE: moment().format("DD.MM.YYYY HH:mm:ss"),
        },
      });

      socket.broadcast.emit("SEND", {
        ACTION: "MESSAGE",
        PAYLOAD: {
          NAME: "Chat bot",
          TEXT: `${payload.NAME} присоединился к нам!`,
          DATE: moment().format("DD.MM.YYYY HH:mm:ss"),
        },
      });
    },
  ],
  [
    "MESSAGE",
    (socket, payload) => {
      io.emit("SEND", {
        ACTION: "MESSAGE",
        PAYLOAD: {
          NAME: payload.NAME,
          TEXT: payload.TEXT,
          DATE: moment().format("DD.MM.YYYY HH:mm:ss"),
        },
      });
    },
  ],
]);

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, OPTIONS);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    if (USERS.has(socket.id)) {
      const user = USERS.get(socket.id);
      user.ONLINE = false;
      USERS.set(socket.id, user);
      io.emit("SEND", {
        ACTION: "MESSAGE",
        PAYLOAD: {
          NAME: "Chat bot",
          TEXT: `${user.NAME} покинул чат!`,
          DATE: moment().format("DD.MM.YYYY HH:mm:ss"),
        },
      });

      console.log(USERS);
    }
  });

  socket.on("SEND", ({ ACTION, PAYLOAD }) => {
    if (EVENTS.has(ACTION)) {
      const evt = EVENTS.get(ACTION);
      if (typeof evt === "function") {
        evt(socket, PAYLOAD);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started at port ${PORT}...`);
});
