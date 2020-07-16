import axios from 'axios';

import localhostConfig from '../_config/host';

const { WEBHOST, PORT, LOCALHOST } = localhostConfig;

let baseURL = `https://${WEBHOST}`;

if (__DEV__) {
  baseURL = `http://${LOCALHOST}:${PORT}`;
}

// depois só remover essa linha
// baseURL = `https://www.ofertadodia.palmas.br/gostack`;
// const baseURL = `http://${LOCALHOST}:${PORT}`;

const api = axios.create({
  baseURL,
});

export default api;
