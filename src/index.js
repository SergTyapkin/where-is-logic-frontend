import { createApp } from 'vue'

import App from './App.vue'
import createVueRouter from './Router.js'

import './styles/fonts.styl';
import './styles/global.styl';
import './styles/scrollbars.styl';
import WS from "./utils/ws";

const Router = createVueRouter();
const app = createApp(App)
  .use(WS, `ws://${location.host}/websocket`)
  .use(Router)
  .mount('#app');
