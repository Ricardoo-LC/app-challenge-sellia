<template>
    <v-card class="mx-auto" elevation="1" max-width="500">
        <v-card-title class="py-5 font-weight-black">¡Bienvenido!</v-card-title>

        <v-card-text>
            Para empezar a chatear ingresa un nombre de usuario.
        </v-card-text>

        <v-card-text>
            <v-text-field v-model="username" label="Nombre de usuario" variant="outlined" single-line></v-text-field>

            <v-btn :disabled="isLoading || !username" :loading="isLoading" class="text-none mb-4" color="indigo-darken-3"
                size="x-large" variant="flat" block @click="submitUsername">
                Ingresar
            </v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
export default {
    name: 'InputUserName',
    setup() {
        const store = useStore();
        const isLoading = computed(() => store.getters.isLoading);
        const username = ref('');

        const submitUsername = () => {
            if (username.value.trim()) {
                store.dispatch('createUser', username.value);
            }
        };

        return {
            isLoading,
            username,
            submitUsername,
        };
    },
};
</script>
