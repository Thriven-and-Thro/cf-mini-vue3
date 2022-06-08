import { createApp } from "../../lib/cf-mini-vue.esm.js";

import { App } from "./App.js";

const container = document.querySelector("#app");

createApp(App).mount(container);
