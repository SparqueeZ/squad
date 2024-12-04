const axios = require("axios");

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : "production";

const services = {
  authService: process.env.AUTH_SERVICE_URL,
  userService: process.env.USER_SERVICE_URL,
  chatService: process.env.CHAT_SERVICE_URL,
};

if (environment !== "development") {
  console.warn("Using production URLs");
  services.authService = "http://auth-service:3001";
  services.userService = "http://user-service:3002";
  services.chatService = "http://chat-service:3003";
}

const createAxiosInstance = (baseURL) => {
  if (!baseURL) {
    console.debug(
      `URL de l'API de Dev non renseignée : ${baseURL}, ce service ne pourra pas fonctionner.`
    );
  }

  return axios.create({
    baseURL: baseURL,
  });
};

const axiosInstances = {
  authService: createAxiosInstance(services.authService),
  userService: createAxiosInstance(services.userService),
  chatService: createAxiosInstance(services.chatService),
};

module.exports = axiosInstances;
