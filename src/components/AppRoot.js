import { getDocumentsTree } from "../utils/api.js";

export default class AppRoot extends HTMLElement {
  constructor() {
    super();
    window.addEventListener("createDocumentsTree", async () => {
      console.log("hi");
      this.list = await getDocumentsTree();
      this.render();
    });
  }

  async connectedCallback() {
    this.list = await getDocumentsTree();
    this.render();
  }

  template() {
    return `
    <h1>app-root</h1>
    <list-page></list-page>
    <editor-page ></editor-page>
    `;
  }

  render() {
    this.innerHTML = this.template();
    const $listPage = this.querySelector("list-page");
    const stringified = JSON.stringify(this.list);
    $listPage.list = stringified;
  }
}
