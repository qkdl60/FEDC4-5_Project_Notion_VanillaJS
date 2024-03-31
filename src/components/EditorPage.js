import { updateDocument } from "../utils/api.js";
import { debounce } from "../utils/debounce.js";
import { DELAY_TIME } from "../constant/constant.js";
// TODO 이벤트 관리도 필요
const updateDocumentEvent = (id, title, content) =>
  new CustomEvent("update_document", { detail: { id, title, content } });
export default class EditorPage extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("input", (event) => {
      const $content = this.querySelector(".editor--content");
      const $title = this.querySelector(".editor--title");
      const contentValue = $content.innerText;
      const titleValue = $title.innerText;
      window.dispatchEvent(
        updateDocumentEvent(this.documentId, titleValue, contentValue),
      );
    });
  }

  get documentId() {
    return this.getAttribute("document-id") || "";
  }

  set documentId(value) {
    this.setAttribute("document-id", value);
  }

  get title() {
    return this.getAttribute("title") || "";
  }

  set title(value) {
    this.setAttribute("title", value);
  }

  get content() {
    return this.getAttribute("content") || "";
  }

  set content(value) {
    this.setAttribute("content", value);
  }

  static get observedAttributes() {
    return ["document-id", "title", "content"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[attr] = newValue;
    this.render();
  }

  async connectedCallback() {
    this.render();
  }

  template() {
    return `
    <h1>EditorPage</h1>
    <div contentEditable=${this.documentId !== "null"} class="editor--title" >${this.title}</div>
    <div contentEditable=${this.documentId !== "null"} class="editor--content" > ${this.content}</div>
    `;
  }

  render() {
    this.innerHTML = this.template();
  }
}
