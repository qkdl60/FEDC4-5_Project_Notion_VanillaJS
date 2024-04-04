import { IS_OPEN_STATE_LIST_KEY } from "../constant/constant.js";
import { createDocument, deleteDocument } from "../utils/api.js";
import { push } from "../utils/router.js";
import { setItem, getItem } from "../utils/storage.js";

const eventCreateDocumentsTree = new CustomEvent("createDocumentsTree");

export default class ListPage extends HTMLElement {
  constructor() {
    super();
    this.isOpenList = new Set();

    this.addEventListener("click", async (event) => {
      const { target } = event;
      if (target.tagName === "SUMMARY") {
        const $details = target.closest("details");
        const $listItem = target.closest("list-item");
        $listItem.isOpen = $details.getAttribute("open") === null;
        const { id } = $listItem;
        if ($listItem.isOpen) {
          this.isOpenList.add(id);
          setItem(IS_OPEN_STATE_LIST_KEY, [...this.isOpenList]);
        } else if ($listItem.isOpen === false && this.isOpenList.has(id)) {
          this.isOpenList.delete(id);
          setItem(IS_OPEN_STATE_LIST_KEY, [...this.isOpenList]);
        }

        // TODO detail의 open Attribute의 값이 null이 아니라면 리스트 올리고 null 이면 뺴준다.상태 변경도 children 추가,삭제시 유지를 위해서
        return;
      }
      const targetClassList = target.classList;
      if (
        targetClassList !== undefined &&
        targetClassList.contains("button--root-add")
      ) {
        await createDocument("제목없음");
        window.dispatchEvent(eventCreateDocumentsTree);
      } else if (
        targetClassList !== undefined &&
        targetClassList.contains("list")
      ) {
        const targetItem = target.closest("list-item");
        const targetItemId = targetItem.id;
        if (targetClassList.contains("list-item__button--add")) {
          const created = await createDocument("제목없음", targetItemId);

          targetItem.isOpen = true;
          this.isOpenList.add(targetItemId);
          setItem(IS_OPEN_STATE_LIST_KEY, [...this.isOpenList]);
          // TODO target도 열림상태로
          window.dispatchEvent(eventCreateDocumentsTree);

          push(created.id);
          // TODO 에러 처리,
        } else if (targetClassList.contains("list-item__button--delete")) {
          await deleteDocument(`/${targetItemId}`);
          if (window.dispatchEvent(eventCreateDocumentsTree)) push();
        } else {
          push(targetItemId);
        }
      }
    });
  }

  get list() {
    return JSON.parse(this.getAttribute("list")) || [];
  }

  set list(nextList) {
    this.setAttribute("list", nextList);
  }

  static get observedAttributes() {
    return ["list"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.list = newValue;
    this.render();
  }

  async disconnectedCallback() {
    setItem(IS_OPEN_STATE_LIST_KEY, [...this.isOpenList]);
  }

  async connectedCallback() {
    const savedIsOpenList = getItem(IS_OPEN_STATE_LIST_KEY);
    if (savedIsOpenList) this.isOpenList = new Set(savedIsOpenList);
    this.render();
    // TODO 로딩 처리필요, 스켈레톤으로 구현,
  }

  template() {
    return `
    <h1>ListPage <button class="button--root-add">+</button></h1>
    <div class="document-list">
    </div>
`;
  }

  render() {
    this.innerHTML = this.template();
    renderDocumentsTree(
      this.list,
      this.querySelector(".document-list"),
      this.isOpenList,
    );
  }
}

function renderDocumentsTree(list, $list, openList = null) {
  list.forEach((item) => {
    const $item = document.createElement("list-item");
    $item.setAttribute("id", item.id);
    $item.setAttribute("title", item.title);
    $item.setAttribute("child-documents", JSON.stringify(item.documents));
    $list.appendChild($item);
    if (openList && openList.has(item.id.toString())) {
      $item.setAttribute("is-open", true);
    } else {
      $item.setAttribute("is-open", false);
    }
  });
}
