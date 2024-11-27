<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer permanent>
        <v-list>
          <v-list-item prepend-icon="mdi-folder" :title="user.username">
            <template v-slot:prepend>
              <v-avatar color="indigo-darken-3">
                <v-icon color="white">mdi-account-outline</v-icon>
              </v-avatar>
            </template>
            <template v-slot:subtitle>
              <h6 class="text-body-2 text-green-lighten-1">En línea</h6>
            </template>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <h6 class="text-body-2 text-blue ml-5 my-5">Usuarios conectados</h6>
        <v-list-item v-for="user in usersConnected" :key="user._id" @click="openChat(user)" link>
          <template v-slot:prepend>
            <v-avatar color="indigo-darken-3">
              <v-icon color="white">mdi-account-outline</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.username }}</v-list-item-title>
        </v-list-item>
        <template v-slot:append>
          <div class="pa-2">
            <v-btn block color="indigo-darken-3" @click="logout">
              Cerrar sesión
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
      <v-main height="100vh" class="d-flex flex-column justify-center mx-5">
          <NotifySnack @openChat="openChat"/>
          <WindowChat v-if="activeRoom" />
          <EmptyChat v-else />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { socket } from "@/socket";
import WindowChat from '@/components/WindowChat.vue'
import EmptyChat from '@/components/EmptyChat.vue'
import NotifySnack from '@/components/NotifySnack.vue'
export default {
  name: 'ChatRoom',
  components: {
    WindowChat,
    EmptyChat,
    NotifySnack
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.getters.getUser);
    const usersConnected = computed(() => store.getters.getUsersConnected);
    const activeRoom = computed(() => store.getters.getActiveRoom);
    const userChatActive = computed(() => store.getters.getUserChatActive);
    

    onMounted(() => {
      socket.on('connectedUsers', (users) => {
        store.dispatch('usersConnected', users);
      });

      if(userChatActive.value) {
        openChat(userChatActive.value);
      }
    });

    const openChat = (userSelected) => {
      store.dispatch('joinRoom', {
        socket,
        userId: user.value._id,
        otherUserId: userSelected.userId,
      });
      store.dispatch('userChat', userSelected)
    };

    const logout = () => {
      store.dispatch('logoutUser');
    };

    return {
      user,
      usersConnected,
      logout,
      openChat,
      activeRoom
    };
  },
};
</script>