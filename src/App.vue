<template>
  <div id="app">
    <ChatRoom v-if="user" />
    <InputUserName v-else />
  </div>
</template>

<script>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';
import InputUserName from '@/views/InputUserName.vue';
import ChatRoom from '@/views/ChatRoom.vue';
import {socket} from "@/socket";

export default {
  name: 'App',
  components: {
    InputUserName,
    ChatRoom,
  },
  setup() {
    const store = useStore();

    const user = computed(() => store.getters.getUser);

    const connect = () => {
      if (!socket.connected) {
        socket.connect();
      }
    };

    const disconnect = () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };

    watch(user, (newUser) => {
      if (newUser) {
        connect();
      } else {
        disconnect();
      }
    });

    return {
      user
    };
  },
};
</script>
