import { IS_OPEN_STATE_LIST_KEY } from "../constant/constant.js";
import { createDocument, deleteDocument } from "../utils/api.js";
import { push } from "../utils/router.js";
import { setItem, getItem } from "../utils/storage.js";

const eventCreateDocumentsTree = new CustomEvent("createDocumentsTree");

export default class ListPage extends HTMLElement {
  constructor() {
    super();
    this.isOpenList = new Set();
    window.addEventListener("item-toggle", (event) => {
      const [_, id] = event.detail.target.id.split("-");
      const isOpen = event.detail.newState;
      if (isOpen === "open") {
        this.isOpenList.add(id);
        setItem(IS_OPEN_STATE_LIST_KEY, [...this.isOpenList]);
      }
      if (isOpen === "closed" && this.isOpenList.has(id)) {
        this.isOpenList.delete(id);
        setItem(IS_OPEN_STATE_LIST_KEY, [...this.isOpenList]);
      }
    });

    this.addEventListener("click", async (event) => {
      const targetClassList = event.target.classList;
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
        const targetItem = event.target.closest("list-item");
        const targetItemId = targetItem.getAttribute("id");
        if (targetClassList.contains("list-item__button--add")) {
          const created = await createDocument("제목없음", targetItemId);
          if (window.dispatchEvent(eventCreateDocumentsTree)) {
            this.querySelector(`#details-${targetItemId}`).setAttribute(
              "open",
              true,
            );
            push(created.id);
          }
        } else if (targetClassList.contains("list-item__button--delete")) {
          await deleteDocument(`/${targetItemId}`);
          if (window.dispatchEvent(eventCreateDocumentsTree)) push();
        } else {
          push(targetItemId);
        }
      }
    });
    // TODO 편집 내용 반영을 위한 외부 list 외부 주입 방식으로 변경 필요, attribute 길이제한 문제
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
    <ul class="document-list">
    </ul>
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
  const copiedList = structuredClone(list);
  let queue = [];
  copiedList.forEach((item) => {
    const $item = document.createElement("list-item");
    $item.setAttribute("id", item.id);
    $item.setAttribute("title", item.title);
    $item.setAttribute("isLast", item.documents.length === 0);
    $list.appendChild($item);
    if (openList && openList.has(item.id.toString())) {
      $item.querySelector("details").setAttribute("open", true);
    }
    if (item.documents.length !== 0) {
      const childDocuments = item.documents.map((doc) => ({
        ...doc,
        parent: item.id,
      }));
      queue.push(...childDocuments);
    }

    while (queue.length !== 0) {
      const replaced = [];
      queue.forEach((child) => {
        const $childItem = document.createElement("list-item");
        $childItem.setAttribute("id", child.id);
        $childItem.setAttribute("title", child.title);
        $childItem.setAttribute("isLast", child.documents.length === 0);
        const parent = document.getElementById(`item${child.parent}`);
        parent.appendChild($childItem);
        if (openList && openList.has(child.id.toString())) {
          $childItem.querySelector("details").setAttribute("open", true);
        }
        if (child.documents.length !== 0) {
          const docs = child.documents.map((doc) => ({
            ...doc,
            parent: child.id,
          }));
          replaced.push(...docs);
        }
      });
      queue = replaced;
    }
  });
}
