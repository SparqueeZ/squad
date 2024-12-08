import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import ChatRoom from "../views/ChatRoom.vue";
import RegisterView from "../views/RegisterView.vue";
import AppLayout from "../layouts/AppLayout.vue";
import DemoView from "@/views/DemoView.vue";
import ChatOverview from "@/views/ChatOverview.vue";
// import NotFound from "../views/NotFound.vue"; // Exemple pour la page 404

const routes = [
  { path: "/login", component: LoginView },
  { path: "/register", component: RegisterView },
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "", // Correspond à "/chat"
        name: "chat-overview",
        component: ChatOverview,
      },
      {
        path: ":id", // Correspond à "/chat/:id"
        name: "chat-room",
        component: ChatRoom,
      },
    ],
  },
  {
    path: "/demo",
    component: DemoView,
  },
  // { path: "/:pathMatch(.*)*", component: NotFound }, // Catch-all pour une page 404
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
