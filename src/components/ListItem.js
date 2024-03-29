export default class ListItem extends HTMLElement {
  // #dom;

  get id() {
    return this.getAttribute("id") || "";
  }

  get title() {
    return this.getAttribute("title") || "";
  }

  connectedCallback() {
    this.render();
  }

  // TODO 각 버튼 호버시 설명 넣기
  template(state) {
    return `<li class="list list-item" id=${state.id}>${state.title} <button class="list  list-item__button--add">+</button> <button class="list list-item__button--delete">-</button></li>`;
  }

  render() {
    this.innerHTML = this.template({ id: this.id, title: this.title });
  }
}
