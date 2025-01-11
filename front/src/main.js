import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
// import { io } from "socket.io-client";
// const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
// const socket = io(APISOCKETURL);

const app = createApp(App);
// app.config.globalProperties.$socket = socket;
app.use(createPinia());
app.use(router).mount("#app");
