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

  get isOpen() {
    return this.getAttribute("is-open") === "true";
  }

  set isOpen(value) {
    this.setAttribute("is-open", value);
  }

  get childDocuments() {
    const returnValue = this.getAttribute("child-documents");
    return returnValue ? JSON.parse(returnValue) : [];
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

  connectedCallback() {
    this.render();
  }

  // TODO 아이템 포인터, 배경 변경, 각 버튼 호버시 설명 넣기, 스타일 css로 변경, details 변경 필요(상태로 컨트롤이 안된다. )
  template() {
    return `
    <div class="list-item__container" >
      <details id="details-${this.id}"  ${this.isOpen ? "open" : ""}>
        <summary></summary>
        <div class="list-item__child" id="item${this.id}" >
        ${
          this.childDocuments.length
            ? this.childDocuments
                .map((doc) => {
                  return `<list-item id=${doc.id} title=${doc.title} is-open=${doc.isOpen}></list-item>`;
                })
                .join("")
            : "<p class='list-item__child--empty-text' >하위 문서 없음</p>"
        }
        </div>
      </details>
      <div  class="list list-item list-item__title">
        <div class="list list-item list-item__title--text">
        ${this.title}
        </div>
        <div class="list-item__title--buttons">
        <button class="list list-item__button--delete">-</button> <button class="list list-item__button--add">+</button> 
        </div>
      </div>
    </div>`;
  }

  render() {
    this.innerHTML = this.template();
    this.childDocuments.forEach((doc) => {
      const $listItem = document.getElementById(doc.id);
      if ($listItem) $listItem.childDocuments = JSON.stringify(doc.documents);
    });
  }
}
