import { createApp } from "../../lib/cf-mini-vue.esm.js";

import { App } from "./App.js";

const app = document.querySelector("#app");
createApp(App).mount(app);
