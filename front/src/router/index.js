import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import ChatRoom from "../views/ChatRoom.vue";
import AppLayout from "../layouts/AppLayout.vue";
// import NotFound from "../views/NotFound.vue"; // Exemple pour la page 404

const routes = [
  { path: "/", component: LoginView },
  {
    path: "/chat",
    component: AppLayout,
    children: [
      {
        path: "", // Correspond à "/chat"
        name: "chat-overview",
        component: ChatRoom,
      },
      {
        path: ":id", // Correspond à "/chat/:id"
        name: "chat-room",
        component: ChatRoom,
      },
    ],
  },
  // { path: "/:pathMatch(.*)*", component: NotFound }, // Catch-all pour une page 404
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
