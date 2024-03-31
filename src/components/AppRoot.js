import { getDocumentsTree } from "../utils/api.js";
import { initRouter } from "../utils/router.js";

export default class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.documentId = "";
    this.documentTitle = "초기";
    this.documentContent = "초기";
  }

  async connectedCallback() {
    this.list = await getDocumentsTree();
    this.render();
    initRouter((id) => {
      console.log(id);
      this.documentId = id;
      const $editorPage = this.querySelector("editor-page");
      $editorPage.id = this.documentId;
      $editorPage.title = this.documentTitle;
      $editorPage.content = this.documentContent;
    });
    window.addEventListener("createDocumentsTree", async () => {
      this.list = await getDocumentsTree();
      const $listPage = this.querySelector("list-page");
      const stringified = JSON.stringify(this.list);
      $listPage.list = stringified;
    });
  }

  template() {
    return `
    <h1>app-root</h1>
    <list-page></list-page>
    <editor-page id="${this.documentId}" title="${this.documentTitle}" content="${this.documentContent}" ></editor-page>
    `;
  }

  render() {
    this.innerHTML = this.template();
    const $listPage = this.querySelector("list-page");
    const stringified = JSON.stringify(this.list);
    $listPage.list = stringified;
  }
}
