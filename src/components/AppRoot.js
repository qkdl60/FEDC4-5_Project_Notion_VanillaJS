import {
  getDocumentContent,
  getDocumentsTree,
  updateDocument,
} from "../utils/api.js";
import { initRouter } from "../utils/router.js";
import { debounce } from "../utils/debounce.js";

export default class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.documentId = null;
    this.documentTitle = "초기";
    this.documentContent = "초기";
  }

  async connectedCallback() {
    this.list = await getDocumentsTree();
    this.render();
    initRouter(async (id) => {
      this.documentId = id;
      if (id) {
        const document = await getDocumentContent(`/${id}`);
        const $editorPage = this.querySelector("editor-page");
        this.documentTitle = document.title;
        this.documentContent = document.content;
        $editorPage.documentId = this.documentId;
        $editorPage.title = this.documentTitle;
        $editorPage.content = this.documentContent;
      }
    });
    window.addEventListener("createDocumentsTree", async () => {
      this.list = await getDocumentsTree();
      const $listPage = this.querySelector("list-page");
      const stringified = JSON.stringify(this.list);
      $listPage.list = stringified;
    });
    window.addEventListener("update_document", (e) => {
      const { id, title, content } = e.detail;
      // TODO 직접 변경은 좋은 방식이 아닌거 같다
      const $listItem = document.getElementById(`${id}`);
      if ($listItem) $listItem.title = title;
      debounce(() => {
        // TODO 리스트 호출을 다시 해야될까?
        updateDocument(`/${id}`, { title, content });
      }, 3000);
    });
  }

  // editor의title은 list 와 연결 시킨다.
  template() {
    return `
    <h1>app-root</h1>
    <list-page></list-page>
    <editor-page document-id="${this.documentId}" title="${this.documentTitle}" content="${this.documentContent}" ></editor-page>
    `;
  }

  render() {
    this.innerHTML = this.template();
    const $listPage = this.querySelector("list-page");
    const stringified = JSON.stringify(this.list);
    $listPage.list = stringified;
  }
}
