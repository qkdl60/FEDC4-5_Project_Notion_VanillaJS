import { getDocumentContent, updateDocument } from "../utils/api.js";
import { debounce } from "../utils/debounce.js";
import { DELAY_TIME } from "../constant/constant.js";
import { initRouter } from "../utils/router.js";
// TODO 외부에서 title, content 주입 방식으로 변경하기
export default class EditorPage extends HTMLElement {
  constructor() {
    super();
    this.id = "";
    this.state = { title: "초기", content: "초기" };

    initRouter(() => {
      const { pathname } = window.location;
      const [, , id] = pathname.split("/");
      if (id !== undefined) this.id = id;
    });

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

  static get observedAttributes() {
    return ["id"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (this.id && this.id !== "") {
      const { title, content } = await getDocumentContent(`/${this.id}`);
      this.state = { title, content };
    }
    this.render();
  }

  async connectedCallback() {
    const { pathname } = window.location;
    const [, , id] = pathname.split("/");
    if (id !== undefined) {
      this.id = id;
      const { title, content } = await getDocumentContent(`/${this.id}`);
      this.state = { title, content };
    }
    this.render();
  }

  template(state) {
    return `
    <h1>EditorPage</h1>
    <div contentEditable=${this.id !== ""} class="editor--title" >${state.title}</div>
    <div contentEditable=${this.id !== ""} class="editor--content" > ${state.content}</div>
    `;
  }

  render() {
    this.innerHTML = this.template(this.state);
  }
}
