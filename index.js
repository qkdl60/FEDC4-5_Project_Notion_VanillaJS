import AppRoot from "./src/components/AppRoot.js";
import EditorPage from "./src/components/EditorPage.js";
import ListPage from "./src/components/ListPage.js";
import ListItem from "./src/components/ListItem.js";

(function defineElements() {
  window.customElements.define("app-root", AppRoot);
  window.customElements.define("list-page", ListPage);
  window.customElements.define("editor-page", EditorPage);
  window.customElements.define("list-item", ListItem);
})();
