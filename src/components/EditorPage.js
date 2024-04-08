import { getDocumentContent } from "../utils/api.js";

// TODO 이벤트 관리도 필요, 브래드크럼을 위한 헤더 필요
const updateDocumentEvent = (id, title, content) =>
  new CustomEvent("update_document", { detail: { id, title, content } });

export default class EditorPage extends HTMLElement {
  constructor() {
    super();
    this.content = "content 값";
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

  static get observedAttributes() {
    return ["document-id", "title"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[attr] = newValue;
    if (attr === "document-id" && this.documentId !== "null") {
      const { content } = await getDocumentContent(`/${this.documentId}`);
      this.content = content;
    }
    this.render();
  }

  async connectedCallback() {
    this.render();
  }

  // TODO 브레드크럼 적용
  template() {
    return `
  <div class='editor-page__header'>
    브래드크럼,전역 상태가 필요한 부분
  </div> 
  <div class="editor-page__body" >
    <div contentEditable=${this.documentId !== "null"} class="editor--title" >${this.title}</div>
    <div contentEditable=${this.documentId !== "null"} class="editor--content" > ${this.content}</div>
  </div>
  
    `;
  }

  render() {
    this.innerHTML = this.template();
  }
}
