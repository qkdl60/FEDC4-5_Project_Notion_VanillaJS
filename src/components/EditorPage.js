import { getDocumentContent, updateDocument } from "../utils/api.js";

// TODO 이벤트 관리도 필요, id, title만 속성으로 받고 id따라서 content 호출 하기
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
      // TODO id바뀐다면 새로 호출하고 컨텐츠 다시 넣기
    }
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
