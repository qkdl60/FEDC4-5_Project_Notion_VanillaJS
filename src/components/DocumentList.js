import { validateListState } from "../utils/validation.js";

export default class DocumentList {
  constructor({ $target, initialState, onClickButton }) {
    this.state = initialState;
    this.$target = $target;
    this.$page = $target.querySelector(".list");
    this.$page.addEventListener("click", (e) => {
      const { target } = e;
      onClickButton(target);
    });
    this.render();
  }

  setState = (nextState) => {
    try {
      validateListState(nextState);
      this.state = nextState;
    } catch (error) {
      console.log(error);
      this.state = [];
    }
    this.render();
  };

  render = () => {
    const stateHTML = this._convertIntoHTML(this.state);
    this.$page.innerHTML = `<button class="list__add-button--root">add RootDocument</button>${stateHTML}`;
    this.$target.appendChild(this.$page);
  };

  _convertIntoHTML = (state) => {
    return `
    <ul>
    ${state
      .map(
        (doc) => `<li data-id=${doc.id}>
        <span class="list__title">${
          doc.title
        }</span> <button class="list__add-button--document">+</button><button class="list__add-button--delete">-</button>
      ${doc.documents.length > 0 ? this._convertIntoHTML(doc.documents) : ""}</li>`
      )
      .join(" ")}
    </ul>`;
  };
}
