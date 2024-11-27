<template>
    <div class="text-center">
        <v-snackbar v-model="snackbar" vertical color="indigo-darken-3">
            <div class="text-subtitle-1 pb-2">{{ userData?.username }} te ha enviado un nuevo mensaje.</div>
            <template v-slot:actions>
                <v-btn prepend-icon="mdi-chat-processing-outline" @click="viewMessage">
                    <template v-slot:prepend>
                        <v-icon color="white"></v-icon>
                    </template>
                    Ver mensaje
                </v-btn>
                <v-btn color="white" variant="text" @click="hideMessage">
                    Cerrar
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { socket } from "@/socket";

export default {
    setup(props, { emit }) {
        const store = useStore();
        const snackbar = ref(false);
        const userData = ref(null);
        const user = computed(() => store.getters.getUser);
        const usersConnected = computed(() => store.getters.getUsersConnected);
        const userActiveChat = computed(() => store.getters.getUserChatActive);
        
        
        onMounted(() => {
            socket.on('messageReceived', (messageData) => {
                if (user.value && user.value._id === messageData.received) {
                    const usersArray = Array.isArray(usersConnected.value) ? usersConnected.value : [];
                    userData.value = usersArray.find((user) => user.userId === messageData.sender);
                    if (userData.value) {
                        snackbar.value = userActiveChat.value && userActiveChat.value.userId !== messageData.sender;
                    }
                }
            });
        });

        const viewMessage = () => {
            emit("openChat", userData.value);
            hideMessage();
        };

        const hideMessage = () => {
            snackbar.value = false;
        };

        return {
            snackbar,
            userData,
            viewMessage,
            hideMessage
        };
    },
};
</script>
