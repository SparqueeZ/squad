import axios from "axios";
import { useUserStore } from "../stores/userStore";

const APIURL = import.meta.env.VITE_API_URL;

const checkAPIURL = (APIURL) => {
  if (!APIURL) {
    window.alert(`URL de l'API non renseignée : ${APIURL}`);
  }
  return APIURL;
};

// Création d'une instance Axios
const instance = axios.create({
  baseURL: checkAPIURL(APIURL),
  withCredentials: true, // Inclut automatiquement les cookies dans les requêtes
});

// Interceptor pour ajouter dynamiquement le token CSRF
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();

    // Récupère le token CSRF depuis le store Pinia
    const csrfToken = userStore.getCsrfToken();

    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }

    return config;
  },
  (error) => {
    // Gère les erreurs avant que la requête ne soit envoyée
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les erreurs de réponse
instance.interceptors.response.use(
  (response) => response, // Retourne la réponse directement si aucune erreur
  (error) => {
    // Exemple : Redirige vers la page de login si l'utilisateur n'est pas authentifié
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore();
      userStore.logout(); // Déconnecte l'utilisateur
      window.location.href = "/login"; // Redirige vers la page de connexion
    }

    return Promise.reject(error); // Propagation de l'erreur
  }
);

export default instance;
