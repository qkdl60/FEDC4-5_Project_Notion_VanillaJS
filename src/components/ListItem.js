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
    <div style="display:flex; flex-direction:row">
      <details style="padding:0 16px 0 24px; position:relative; width:10px; overflow: visible; white-space:nowrap; " >
        <summary></summary>
        <div id="item${state.id}" style="position:absolute left: 0" >
        ${state.isLast ? "더 이상 문서가 없습니다." : ""}
        </div>
      </details>
      <div  class="list list-item">${state.title} <button class="list  list-item__button--add">+</button> <button class="list list-item__button--delete">-</button></div>
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
