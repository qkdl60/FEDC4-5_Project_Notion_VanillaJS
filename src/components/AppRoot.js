export default class AppRoot extends HTMLElement {
  async connectedCallback() {
    this.render();
  }

  template(state) {
    return `
    <h1>app-root</h1>
    <list-page ></list-page>
    <editor-page ></editor-page>
    `;
  }

  render() {
    this.innerHTML = this.template();
  }
}
