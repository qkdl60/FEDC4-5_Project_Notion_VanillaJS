import { getDocumentsTree, updateDocument } from "../utils/api.js";
import { initRouter } from "../utils/router.js";
import { debounce } from "../utils/debounce.js";
import { DELAY_TIME } from "../constant/constant.js";
// TODO 이벤트 위임으로 모든 이벤트 app root에서 관리?
export default class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.documentId = null;
    this.documentTitle = "초기";
    this.$listPage = null;
    this.$editorPage = null;
    this.list = [];
  }

  async connectedCallback() {
    this.render();
    this.list = await getDocumentsTree();
    this.$editorPage = this.querySelector("editor-page");
    this.$listPage = this.querySelector("list-page");
    this.$listPage.list = JSON.stringify(this.list);
    initRouter(async (id) => {
      this.documentId = id;
      const $listItem = document.getElementById(this.documentId);
      this.$editorPage.documentId = this.documentId;
      this.$editorPage.title = $listItem.title;
    });

    window.addEventListener("createDocumentsTree", async () => {
      this.list = await getDocumentsTree();
      const stringified = JSON.stringify(this.list);
      this.$listPage.list = stringified;
    });
    window.addEventListener("update_document", (e) => {
      const { id, title, content } = e.detail;

      const $listItem = document.getElementById(`${id}`);
      if ($listItem) $listItem.title = title;
      debounce(() => {
        updateDocument(`/${id}`, { title, content });
      }, DELAY_TIME);
    });
  }

  // TODO editor의title은 list 와 연결 시킨다.
  template() {
    return `
    <h1>app-root</h1>
    <list-page list=${JSON.stringify(this.list)}></list-page>
    <editor-page document-id="${this.documentId}" title="${this.documentTitle}" ></editor-page>
    `;
  }

  render() {
    this.innerHTML = this.template();
  }
}
