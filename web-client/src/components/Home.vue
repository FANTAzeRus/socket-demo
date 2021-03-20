<template>
  <div>
    <template v-if="state.connected">
      <div class="home" v-if="state.joined">
        <div class="messages" id="messages">
          <chat-message
            v-for="(message, idx) in state.messages"
            :key="idx"
            :message="message"
          ></chat-message>
        </div>

        <div class="message">
          <input
            type="text"
            v-model="state.message"
            placeholder="Хочу сказать..."
            @keyup.enter="sendMessage"
          />
        </div>
      </div>

      <div class="join" v-else>
        <div class="join-form">
          <label>Имя <input type="text" v-model="state.name" /></label>
          <label>Комната <input type="text" v-model="state.room" /></label>
          <button :disabled="!canJoin" @click="joinToRoom">Войти в чат</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="connecting">Соединение с сервером...</div>
    </template>
  </div>
</template>
<script>
import { computed, nextTick, reactive } from "vue";
import { connectToSocketServer, sendData, subscribeOnAction } from "../socket";
import ChatMessage from "./chat-message";

export default {
  name: "Home",
  components: { ChatMessage },
  setup() {
    connectToSocketServer(
      () => {
        state.connected = true;

        subscribeOnAction("WELCOME", (payload) => {
          state.joined = true;
          console.log(payload);
          addMessage(payload);

          subscribeOnAction("MESSAGE", (payload) => {
            addMessage(payload);
            nextTick(() => {
              const messages = document.getElementById("messages");
              messages.scrollTop = messages.scrollHeight;
            });
          });
        });
      },
      () => {
        state.joined = false;
        state.connected = false;
      }
    );

    const addMessage = (payload) => {
      state.messages.push({
        name: payload.NAME,
        text: payload.TEXT,
        date: payload.DATE,
      });
    };

    const state = reactive({
      connected: false,
      name: "Fedor",
      room: "MAIN",
      joined: false,
      messages: [],
      message: null,
    });

    const canJoin = computed(
      () => state.name && state.name.length > 3 && state.room
    );

    const joinToRoom = () => {
      sendData({
        ACTION: "JOIN",
        PAYLOAD: {
          NAME: state.name,
          ROOM: state.room,
        },
      });
    };

    const sendMessage = () => {
      sendData({
        ACTION: "MESSAGE",
        PAYLOAD: {
          NAME: state.name,
          ROOM: state.room,
          TEXT: state.message,
        },
      });

      state.message = null;
    };

    return { state, canJoin, joinToRoom, sendMessage };
  },
};
</script>
