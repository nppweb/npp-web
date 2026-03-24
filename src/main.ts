import { createApp } from "vue";
import App from "./App.vue";
import { applyRandomPalette } from "./lib/theme";
import "./styles.css";

applyRandomPalette();

createApp(App).mount("#app");
