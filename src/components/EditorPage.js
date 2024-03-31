import { updateDocument } from "../utils/api.js";
import { debounce } from "../utils/debounce.js";
import { DELAY_TIME } from "../constant/constant.js";

// TODO 외부에서 title, content 주입 방식으로 변경하기
export default class EditorPage extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("input", (event) => {
      const $content = this.querySelector(".editor--content");
      const $title = this.querySelector(".editor--title");
      const contentValue = $content.innerText;
      const titleValue = $title.innerText;
      debounce(() => {
        updateDocument(`/${this.id}`, {
          title: titleValue,
          content: contentValue,
        });
      }, DELAY_TIME);
    });
  }

  get id() {
    return this.getAttribute("id") || "";
  }

  set id(value) {
    this.setAttribute("id", value);
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
    return ["id", "title", "content"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    console.log(attr, oldValue, newValue);
    this[attr] = newValue;
  }

  async connectedCallback() {
    this.render();
  }

  template() {
    return `
    <h1>EditorPage</h1>
    <div contentEditable=${this.id !== "undefined"} class="editor--title" >${this.title}</div>
    <div contentEditable=${this.id !== "undefined"} class="editor--content" > ${this.content}</div>
    `;
  }

  render() {
    this.innerHTML = this.template();
  }
}
