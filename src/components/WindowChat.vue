<template>
  <v-card class="mb-2 px-5" density="compact" :title="userChat?.username" variant="text" border>
    <template v-slot:prepend>
        <v-avatar color="indigo-darken-3">
            <v-icon color="white">mdi-account-outline</v-icon>
        </v-avatar>
    </template>
    <template v-slot:subtitle>
        <v-badge v-if="userChat?.online" color="success" inline dot>
            <h6 class="text-body-2 text-green-lighten-1 mr-2">En línea</h6>
        </v-badge>
        <v-badge v-else color="grey" inline dot>
            <h6 class="text-body-2 text-grey mr-2">Desconectado</h6>
        </v-badge>
    </template>
    <template v-slot:append>
        <v-responsive
            class="mx-auto"
            min-width="250"
        >
            <v-text-field
                variant="underlined"
                v-model="searchQuery"
                label="Buscar mensaje"
                prepend-inner-icon="mdi-text-box-search-outline"
                @input="searchMessages"
            />
        </v-responsive>
    </template>
    <v-divider></v-divider>
    <v-virtual-scroll
      ref="virtualScroll"
      :items="messages"
      :height="scrollHeight"
      item-height="50"
    >
      <template v-slot:default="message">
        <ChatMessages 
            :key="message.item.id"
            :type="message.item.senderId !== user._id ? 'sender' : 'receiver'" 
            :message="getTypeMessage(message.item.content)"
            :time="message.item.timestamp" />
      </template>
    </v-virtual-scroll>
    <InputChat :disabled="!userChat?.online"/>
  </v-card>
</template>
<script>
import { ref, computed, onMounted, onBeforeUnmount, watch  } from 'vue';
import { useStore } from 'vuex';
import { socket } from "@/socket";
import InputChat from "@/components/InputChat.vue"
import ChatMessages from "@/components/ChatMessages.vue"
export default {
    name: 'WindowChat',
    components: {
        InputChat,
        ChatMessages
    },
    setup() {
        const store = useStore();
        const messages = computed(() => store.getters.getChatRoomMessages);    
        const user = computed(() => store.getters.getUser);
        const userChat = computed(() => store.getters.getUserChatActive);
        const scrollHeight = ref('500px');
        const searchQuery = ref('');
        const scrollToMessageIndex = ref(null);
        const virtualScroll = ref(null);

        const scrollToMessage = (index) => {
             if (virtualScroll.value && index !== null) {
                virtualScroll.value.scrollToIndex(index);
            }
        };

        const scrollToBottom = () => {
            if (virtualScroll.value) {
                const lastIndex = messages.value.length - 1;
                virtualScroll.value.scrollToIndex(lastIndex); 
            }
        };

        const searchMessages = () => {
            if (!searchQuery.value.trim()) {
                scrollToBottom()
                return;
            }

            const index = messages.value.findIndex((message) =>
            message.content.toLowerCase().includes(searchQuery.value.toLowerCase())
            );

            if (index !== -1) {
            scrollToMessageIndex.value = index;
            scrollToMessage(index);
            } else {
            console.log('No se encontraron coincidencias');
            }
        };

        watch(
            messages,
            () => {
                scrollToBottom();
            },
            { deep: true }
        );

        onMounted(() => {  
            calculateScrollHeight();
            window.addEventListener('resize', calculateScrollHeight);
            socket.on("newMessage", (newMessage) => {    
                store.dispatch('addMessageToRoom', { room: newMessage.room, newMessage });
                scrollToBottom();
            });
            scrollToBottom();
        });

        const calculateScrollHeight = () => {
            const headerHeight = 56; 
            const footerHeight = 64;
            scrollHeight.value = `calc(90vh - ${headerHeight + footerHeight}px)`;
        };

        const getTypeMessage = (content) => {
            const base64Pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*$/;

            if (base64Pattern.test(content)) {
                const matches = content.match(base64Pattern);
                const fileType = matches[1].includes("image") ? "image" : "file"; 
                const urlFile = content;

                return {
                    fileType,
                    urlFile
                };
            }
            return content;
        };

         onBeforeUnmount(() => {
            window.removeEventListener('resize', calculateScrollHeight);
        });

        return {
            messages,
            user,
            userChat,
            getTypeMessage,
            scrollHeight,
            scrollToMessageIndex,
            searchQuery,
            searchMessages,
            virtualScroll
        };
    },
};
</script>