import Component from "../core/Component.js";

export default class ListPage extends Component {
  template() {
    return `
      <div class="list-page__header">
        <div class="list-page__header--title">개굴 맹꽁의 NOTION</div>
        <div class="list-page__header--list-title">
          <span class="list-page__header--text">페이지</span> 
          <button class="button--root-add">+</button>
        </div>
      </div>
      <div class="document-list">
      ${this.props.items.map((item) => itemTemplate(item)).join("")}
      </div>
    `;
  }

  mounted() {
    const $documentList = this.$target.querySelector(".document-list");
  }
}

function itemTemplate(item) {
  return ` <div id="item-${item.id}" class="list-item" >
  <details id="${item.id}"   ${item.isOpen ? "open" : ""}>
    <summary></summary>
    <div class="list-item__child" id="item-child-${item.id}" >
    ${item.documents.length ? item.documents.map((childItem) => itemTemplate(childItem)).join("") : "<p class='list-item__child--empty-text' >하위 문서 없음</p>"}
    </div>
  </details>
  <div selected=${item.isSelected} class="list-item__title">
    <div  class="list-item__title--text">
    ${item.title}
    </div>
    <div class="list-item__title--buttons">
    <button class="list-item__button--delete">-</button> 
    <button class="list-item__button--add">+</button> 
    </div>
  </div>
</div>
  `;
}
