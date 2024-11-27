<template>
    <v-form @submit.prevent="sendMessage">
        <v-container>
            <v-row>
                <v-col cols="12">
                    <v-text-field 
                        v-model="message" 
                        placeholder="Escribe un mensaje" 
                        type="text" 
                        variant="outlined" 
                        :disabled="disabled"
                        clearable
                        :error="!!errorMessage"
                        :error-messages="errorMessage"
                    >
                        <template v-slot:prepend>
                            <v-avatar color="indigo-darken-3" id="menu-clip">
                                <v-icon icon="mdi-paperclip-plus"></v-icon>
                            </v-avatar>
                            <v-menu activator="#menu-clip" location="top">
                                <v-list>
                                    <v-list-item title="Imagen" link @click="selectFile('image/*')">
                                        <template v-slot:prepend>
                                            <v-icon icon="mdi-image-plus-outline"></v-icon>
                                        </template>
                                    </v-list-item>
                                    <v-list-item title="Archivo" link @click="selectFile('application/pdf')">
                                        <template v-slot:prepend>
                                            <v-icon icon="mdi-file-document-plus-outline"></v-icon>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </template>
                        <template v-if="selectedFile" v-slot:prepend-inner>
                            <v-chip color="indigo-darken-3" closable label @click:close="clearFile('')">
                                <v-icon v-if="selectedFile.type.includes('image')" icon="mdi-image-outline" start></v-icon>
                                <v-icon v-else icon="mdi-file-document-outline" start></v-icon>
                                {{ selectedFile.name }}
                            </v-chip>
                        </template>
                        <template v-slot:append-inner>
                            <v-fade-transition leave-absolute>
                                <v-progress-circular v-if="loading" color="info" size="24" indeterminate></v-progress-circular>
                            </v-fade-transition>
                        </template>
                    </v-text-field>
                    <input type="file" ref="fileInput" class="d-none" @change="handleFileChange" accept="*" />
                </v-col>
            </v-row>
        </v-container>
    </v-form>
</template>

<script>
import { ref } from 'vue';
import { socket } from "@/socket";
import { useStore } from "vuex";

export default {
    props: {
        disabled: {
            type: Boolean,
            required: true,
        },
    },
    setup() {
        const store = useStore();
        const user = store.getters.getUser;
        const message = ref('');
        const loading = ref(false);
        const selectedFile = ref(null); 
        const fileAcceptType = ref('');
        const errorMessage = ref('');
        const fileInput = ref(null);
        const MAX_FILE_SIZE = 500 * 1024; 

        const selectFile = (acceptType) => {
            fileAcceptType.value = acceptType;
            fileInput.value?.click();
        };


        const handleFileChange = (event) => {
            clearFile("")
            const file = event.target.files[0];
            if (file) {
                if (file.size > MAX_FILE_SIZE) {
                    clearFile('El archivo excede el tamaño máximo de 500 KB.')
                    return;
                }

                if (fileAcceptType.value === 'application/pdf' && file.type !== 'application/pdf') {
                    clearFile('Solo se aceptan archivos en formato PDF.')
                    return;
                }

                if (fileAcceptType.value === 'image/*' && !file.type.startsWith('image/')) {
                    clearFile('Solo se aceptan archivos de imagen (JPG, PNG, etc.).')
                    return;
                }

                selectedFile.value = file;
                errorMessage.value = ''; 
            }
        };

        const convertFileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        };

        const sendMessage = async () => {
            if (message.value || selectedFile.value) {
                loading.value = true;
                let base64File = null;

                if (selectedFile.value) {
                    try {
                        base64File = await convertFileToBase64(selectedFile.value);
                    } catch (error) {
                        console.error("Error al convertir el archivo a Base64:", error);
                        loading.value = false;
                        return;
                    }
                }
                
                const messageContent = {
                    content: base64File ?? message.value.trim(), 
                    senderId: user._id,
                };                

                store.dispatch('sendMessage', {
                    socket,
                    message: messageContent,
                });

                clearFile("")
                message.value = ""
                loading.value = false;
            }
        };

        const clearFile = (message) => {
            selectedFile.value = null;
            errorMessage.value = message;
        };

        return { 
            user, 
            message, 
            loading, 
            sendMessage, 
            selectedFile, 
            selectFile, 
            handleFileChange, 
            fileInput, 
            fileAcceptType, 
            clearFile, 
            errorMessage 
        };
    },
};
</script>
