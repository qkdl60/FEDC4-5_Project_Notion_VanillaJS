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

  // TODO 아이템 포인터, 배경 변경, 각 버튼 호버시 설명 넣기
  template(state) {
    return `<div style="padding:0 16px" class="list list-item" id="item${state.id}">${state.title} <button class="list  list-item__button--add">+</button> <button class="list list-item__button--delete">-</button></div>`;
  }

  render() {
    this.innerHTML = this.template({ id: this.id, title: this.title });
  }
}
