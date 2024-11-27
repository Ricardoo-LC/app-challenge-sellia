<template>
    <div>
        <v-card v-if="type === 'sender'" class="my-4 rounded-e-lg" elevation="2" :max-width="message?.fileType && message?.fileType !== 'image' ? 100 : 600" color="blue-lighten-5">
            <v-card-item>
                <template v-if="message?.fileType">    
                    <v-img v-if="message?.fileType === 'image'"
                    :aspect-ratio="1"
                    class="bg-white"
                    :src="message?.urlFile"
                    width="300"
                    cover
                ></v-img>
                <a v-else href="javascript:void(0)" @click="openPdf(message?.urlFile)" style="text-decoration: none; color: inherit;">
                    <v-icon icon="mdi-file-document-outline" color="indigo-darken-3" :size="64"></v-icon>
                    <p class="text-body-2 text-center text-indigo-darken-3">Abrir</p>
                </a>
                </template>
                <template v-else>
                    <p class="text-body-1">{{ message }}</p>
                </template>            
                <p class="text-caption text-right text-grey-darken-1">{{ formatTime(time) }}</p>
            </v-card-item>
        </v-card>
        <v-card v-if="type === 'receiver'" class="ml-auto my-4 rounded-s-lg" elevation="2" :max-width="message?.fileType && message?.fileType !== 'image' ? 100 : 600"
            color="indigo-darken-3">
            <v-card-item>
                <template v-if="message?.fileType">    
                    <v-img v-if="message?.fileType === 'image'"
                    :aspect-ratio="1"
                    class="bg-white"
                    :src="message?.urlFile"
                    width="300"
                    cover
                    ></v-img>
                    <a v-else href="javascript:void(0)" @click="openPdf(message?.urlFile)" style="text-decoration: none; color: inherit;">
                        <v-icon icon="mdi-file-document-outline" color="blue-lighten-5" :size="64"></v-icon>
                        <p class="text-body-2 text-center text-blue-lighten-5">Abrir</p>
                    </a>
                </template>
                <template v-else>
                    <p class="text-body-1">{{ message }}</p>
                </template>       
                <p class="text-caption text-right text-blue-grey-lighten-4">{{ formatTime(time) }}</p>
            </v-card-item>
        </v-card>
        <v-card v-if="type === 'date'" class="mx-auto my-4" elevation="2" max-width="60" color="grey-lighten-3">
            <v-card-item>
                <p class="text-caption text-center">{{ message }}</p>
            </v-card-item>
        </v-card>
    </div>
</template>
<script>
import { format } from 'date-fns';
export default {
    name: 'ChatMessages',
    props: {
        type: {
            type: String,
            required: true,
            validator: value => ['sender', 'receiver', 'date'].includes(value),
        },
        message: {
            type: [String, Object], 
            required: true,
            default: () => "",
            validator(value) {
            
                if (typeof value === "object") {
                    return (
                        Object.prototype.hasOwnProperty.call(value, "fileType") &&
                        Object.prototype.hasOwnProperty.call(value, "urlFile")
                    );
                }
                return typeof value === "string";
            },
        },
        time: {
            type: String,
            default: '', 
        },
    },
    methods: {
        formatTime(time) {
            try{
                return format(time, 'h:mm b').replace('AM', 'a. m.').replace('PM', 'p. m.');
            }catch(e){
                return ""
            }
            
        },
        openPdf(urlFile) {
            const newTab = window.open();
            newTab.document.write(
                `<iframe src="${urlFile}" frameborder="0" style="width:100%;height:100%;"></iframe>`
            );
        }
    },
};
</script>
