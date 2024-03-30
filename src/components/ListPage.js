import {
  getDocumentsTree,
  createDocument,
  deleteDocument,
} from "../utils/api.js";
import { push } from "../utils/router.js";

export default class ListPage extends HTMLElement {
  constructor() {
    super();
    this.list = [];
    this.addEventListener("click", async (event) => {
      const targetClassList = event.target.classList;
      if (
        targetClassList !== undefined &&
        targetClassList.contains("button--root-add")
      ) {
        await createDocument("제목없음");
        this.list = await getDocumentsTree();
      } else if (
        targetClassList !== undefined &&
        targetClassList.contains("list")
      ) {
        const targetItem = event.target.closest("list-item");
        const targetItemId = targetItem.getAttribute("id");
        if (targetClassList.contains("list-item__button--add")) {
          console.log("칠드런 추가 ", targetItem.getAttribute("id"));
          // await createDocument("제목없음", targetItemId);

          // 해당 아이템으로 라우팅
          // 리스트 업데이트
        } else if (targetClassList.contains("list-item__button--delete")) {
          await deleteDocument(`/${targetItemId}`);
          this.list = await getDocumentsTree();
          push();
        } else {
          console.log("아이템 라우팅", targetItem.getAttribute("id"));
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
    this.setAttribute("list", JSON.stringify(nextList));
  }

  static get observedAttributes() {
    return ["list"];
  }

  async attributeChangedCallback(attr, oldValue, newValue) {
    this.render();
  }

  async connectedCallback() {
    this.list = await getDocumentsTree();
    this.render();
    // TODO 로딩 처리필요, 스켈레톤으로 구현
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
    renderDocumentsTree(this.list, this.querySelector(".document-list"));
  }
}

function renderDocumentsTree(list, $list) {
  const copiedList = structuredClone(list);
  // eslint-disable-next-line prefer-const
  let queue = [];
  copiedList.forEach((item) => {
    const $item = document.createElement("list-item");
    $item.setAttribute("id", item.id);
    $item.setAttribute("title", item.title);
    $item.setAttribute("isLast", item.documents.length === 0);
    $list.appendChild($item);
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
