import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import { io } from "socket.io-client";
const APIURL = import.meta.env.VITE_API_URL;

// Remplacez '192.168.1.100' par l'adresse IP locale de votre machine
const socket = io(APIURL);

const app = createApp(App);
app.config.globalProperties.$socket = socket;
app.use(createPinia());
app.use(router).mount("#app");
