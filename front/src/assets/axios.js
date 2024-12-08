import axios from "axios";
const APIURL = import.meta.env.VITE_API_URL;

const csrfToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("csrf_token="))
  ?.split("=")[1];

const checkAPIURL = (APIURL) => {
  if (!APIURL) {
    window.alert(`URL de l'API non renseignée : ${APIURL}`);
  }

  return APIURL;
};

const instance = axios.create({
  baseURL: checkAPIURL(APIURL),
  withCredentials: true,
  headers: {
    "x-csrf-token": csrfToken || "",
  },
});

export default instance;
