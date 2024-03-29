export default class ListItem extends HTMLElement {
  // #dom;

  get id() {
    return this.getAttribute("id") || "";
  }

  get title() {
    return this.getAttribute("title") || "";
  }

  get isLast() {
    return JSON.parse(this.getAttribute("isLast"));
  }

  connectedCallback() {
    this.render();
  }

  // TODO 아이템 포인터, 배경 변경, 각 버튼 호버시 설명 넣기
  template(state) {
    return `
    <div style="display:flex; flex-direction:row-reverse">
      <div style="flex-grow:1"  class="list list-item">${state.title} <button class="list  list-item__button--add">+</button> <button class="list list-item__button--delete">-</button></div>
      <details style="padding: 0 24px;" id="item${state.id}">
        <summary></summary>
        ${state.isLast ? "더 이상 문서가 없습니다." : ""}
      </details>
    </div>`;
  }

  render() {
    this.innerHTML = this.template({
      id: this.id,
      title: this.title,
      isLast: this.isLast,
    });
  }
}
