import { io } from "socket.io-client";

const PORT = 5000;
var socket = null;
const subscribtions = new Map();

export const connectToSocketServer = (
  connect_callback,
  disconnect_callback
) => {
  socket = io(`http://localhost:${PORT}`);
  socket.on("connect", () => {
    if (typeof connect_callback === "function") {
      connect_callback();
    }

    socket.on("disconnect", () => {
      if (typeof disconnect_callback === "function") {
        disconnect_callback();
      }
    });
  });

  socket.on("SEND", (payload) => {
    if (subscribtions.has(payload.ACTION)) {
      const callback = subscribtions.get(payload.ACTION);
      if (typeof callback === "function") {
        callback(payload.PAYLOAD);
      }
    }
  });
};

export const sendData = (payload) => socket.emit("SEND", payload);

export const subscribeOnAction = (action, callback) => {
  if (!subscribtions.has(action)) {
    subscribtions.set(action, callback);
  }
};

export const unsubscribeOnAction = (action) => {
  if (subscribtions.has(action)) {
    subscribtions.delete(action);
  }
};
