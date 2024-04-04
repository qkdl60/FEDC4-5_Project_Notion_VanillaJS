import { IS_OPEN_STATE_LIST_KEY } from "../constant/constant.js";
import { getItem, setItem } from "../utils/storage.js";

// TODO tittle변경시 하위 요소들이 삭제된다.상태로 가지고있는 것이아니라 처음 렌더링시 넣어주는 형식이라서 다시 리렌더링되면 없는상태로 렌더링된다 .
// TODO isLast가 필요하나 children으로 판단하는게,  속성 관리 필요,
// TODO openList는 전역 관리가 필용할거 같다.
export default class ListItem extends HTMLElement {
  constructor() {
    super();
    this.openList = new Set();
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

  get isOpen() {
    return JSON.parse(this.getAttribute("is-open")) || false;
  }

  set isOpen(value) {
    this.setAttribute("is-open", value);
  }

  get childDocuments() {
    return JSON.parse(this.getAttribute("child-documents")) || [];
  }

  set childDocuments(value) {
    this.setAttribute("child-documents", value);
  }

  static get observedAttributes() {
    return ["title", "is-open", "child-documents"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[attr] = newValue;
    this.render();
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
  }

  // TODO 아이템 포인터, 배경 변경, 각 버튼 호버시 설명 넣기, 스타일 css로 변경
  template(state) {
    return `
    <div style="display:flex; flex-direction:row">
      <details id="details-${state.id}" style="padding:0 16px 0 24px; position:relative; width:10px; overflow: visible; white-space:nowrap;" ${state.isOpen ? "open" : ""}>
        <summary></summary>
        <div id="item${state.id}" style="position:absolute left: 0" >
        ${
          state.documents.length === 0
            ? "<p style='margin: 0;' >더 이상 하위 문서가 없습니다.</p>"
            : state.documents
                .map((doc) => {
                  return `<list-item id=${doc.id} title=${doc.title} is-open=${this.openList.has(doc.id.toString())}></list-item>`;
                })
                .join("")
        }
        </div>
      </details>
      <div  class="list list-item">${state.title} <button class="list list-item__button--add">+</button> <button class="list list-item__button--delete">-</button></div>
    </div>`;
  }

  // TODO document를 안 넣어주고있다 .
  render() {
    const openList = getItem(IS_OPEN_STATE_LIST_KEY);
    if (openList) {
      this.openList = new Set(openList);
    }
    this.innerHTML = this.template({
      id: this.id,
      title: this.title,
      documents: this.childDocuments,
      isOpen: this.isOpen,
    });
    this.childDocuments.forEach((doc) => {
      const $listItem = document.getElementById(doc.id);

      if ($listItem) $listItem.childDocuments = JSON.stringify(doc.documents);
    });
  }
}

// TODO 열림 상태 유지 하기
