export default class ListItem extends HTMLElement {
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

  get isLast() {
    return JSON.parse(this.getAttribute("isLast"));
  }

  set isLast(value) {
    this.setAttribute("isLast", value);
  }

  static get observedAttributes() {
    return ["title"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[attr] = newValue;
    this.render();
  }

  connectedCallback() {
    this.render();
    this.toggleListener = this.querySelector("details").addEventListener(
      "toggle",
      (event) => {
        window.dispatchEvent(new CustomEvent("item-toggle", { detail: event }));
      },
    );
  }

  // TODO 아이템 포인터, 배경 변경, 각 버튼 호버시 설명 넣기, 스타일 css로 변경
  template(state) {
    return `
    <div style="display:flex; flex-direction:row">
      <details id="details-${state.id}" style="padding:0 16px 0 24px; position:relative; width:10px; overflow: visible; white-space:nowrap;" >
        <summary></summary>
        <div id="item${state.id}" style="position:absolute left: 0" >
        ${state.isLast ? "<p style='margin: 0;' >더 이상 하위 문서가 없습니다.</p>" : ""}
        </div>
      </details>
      <div  class="list list-item">${state.title} <button class="list list-item__button--add">+</button> <button class="list list-item__button--delete">-</button></div>
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
