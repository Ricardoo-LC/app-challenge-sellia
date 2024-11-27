<template>
    <v-empty-state icon="mdi-chat-plus-outline">
        <template v-slot:media>
            <v-icon color="indigo-darken-3"></v-icon>
        </template>
        <template v-slot:title>
            <div class="text-h6">
                Comienza a chatear
            </div>
        </template>
        <template v-slot:text>
            <div class="text-medium-emphasis text-caption">
                Elige a un usuario conectado, da click e inicia una nueva conversación.
            </div>
        </template>
    </v-empty-state>
</template>