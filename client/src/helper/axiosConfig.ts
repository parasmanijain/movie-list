// First we need to import axios.js
import axios from 'axios';
import { API_URL } from './config';
// Next we make an 'instance' of it
const instance = axios.create({
// .. where we make our configurations
  baseURL: `${API_URL}`
});

// Where you would set stuff like your 'Authorization' header, etc ...
instance.defaults.headers.post['Content-Type'] = 'application/json';

// Also add/ configure interceptors && all the other cool stuff

export default instance;
