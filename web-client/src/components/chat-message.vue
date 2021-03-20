<template>
  <div class="chat-message">
    <div class="avatar">{{ userAvatar }}</div>
    <div class="message">
      <div class="name">{{ message.name }}</div>
      <div class="date">{{ message.date }}</div>
      <div class="text">{{ message.text }}</div>
    </div>
  </div>
</template>

<script>
import { computed } from "@vue/runtime-core";
export default {
  name: "ChatMessage",
  props: ["message"],
  setup(message) {
    const userAvatar = computed(() => {
      if (message) {
        const parts = message.message.name.split(" ");

        return parts.map((p) => p.charAt(0).toUpperCase()).join("");
      }

      return "ND";
    });

    return { userAvatar };
  },
};
</script>
