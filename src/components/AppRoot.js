import { getDocumentsTree, updateDocument } from "../utils/api.js";
import { initRouter } from "../utils/router.js";
import { debounce } from "../utils/debounce.js";
import { DELAY_TIME, IS_OPEN_STATE_LIST_KEY } from "../constant/constant.js";
import { getItem } from "../utils/storage.js";

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
    this.list = await updateDocumentList();
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
      this.list = await updateDocumentList();
      this.$listPage.list = JSON.stringify(this.list);
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

async function updateDocumentList() {
  const documentsTree = await getDocumentsTree();
  const openList = getItem(IS_OPEN_STATE_LIST_KEY);
  const copiedTree = structuredClone(documentsTree);

  return getDocumentList(copiedTree, openList);
}

function getDocumentList(copiedTree, openList = []) {
  return copiedTree.map((i) => {
    const isOpen = openList.includes(i.id.toString());
    const documents = getDocumentList(i.documents, openList);
    return { ...i, isOpen, documents };
  });
}
