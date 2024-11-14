import axios from "axios";
const APIURL = import.meta.env.VITE_API_URL;

const checkAPIURL = (APIURL) => {
  if (!APIURL) {
    window.alert(`URL de l'API non renseignée : ${APIURL}`);
  }

  return APIURL;
};

const instance = axios.create({
  baseURL: checkAPIURL(APIURL),
  withCredentials: true,
});

export default instance;
