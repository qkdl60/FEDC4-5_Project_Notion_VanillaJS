import Component from "../core/Component.js";
import {
  createDocument,
  deleteDocument,
  getDocumentContent,
  getDocumentsTree,
  updateDocument,
} from "../utils/api.js";
import EditorPage from "./EditorPage.js";
import ListPage from "./ListPage.js";
import { getItem, setItem } from "../utils/storage.js";
import { IS_OPEN_STATE_LIST_KEY } from "../constant/constant.js";
import { initRouter, push } from "../utils/router.js";
import { debounce } from "../utils/debounce.js";

export default class App extends Component {
  async setUp() {
    this.state = { documents: [], selected: null };
    const openList = getItem(IS_OPEN_STATE_LIST_KEY) || [];
    const documents = await updateDocumentList(openList);
    this.setState({ ...this.state, documents });
    initRouter(async (id) => {
      const selected = await getDocumentContent(`/${id}`);
      const openedList = getItem(IS_OPEN_STATE_LIST_KEY) || [];
      const copiedList = structuredClone(this.state.documents);
      const updatedList = getDocumentList(copiedList, openedList, id);
      this.setState({ ...this.state, documents: updatedList, selected });
    });
  }

  template() {
    return `
    <div class="list-page">리스트 페이지</div>
    <div class="editor-page">에디터 페이지</div>
    `;
  }

  mounted() {
    const $listPage = this.$target.querySelector(".list-page");
    const $editorPage = this.$target.querySelector(".editor-page");
    new ListPage($listPage, {
      items: this.state.documents,
    });
    new EditorPage($editorPage, {
      id: this.state.selected?.id,
      title: this.state.selected?.title,
      content: this.state.selected?.content,
    });
  }

  setEvent() {
    this.$target.addEventListener("click", async (event) => {
      const { target } = event;
      // TODO 중복 로직 처리하기,
      if (
        target.classList.contains("button--root-add") ||
        target.classList.contains("list-item__button--add")
      ) {
        const item = target.closest(".list-item");
        if (item) {
          const [_, itemId] = item.id.split("-");
          await createDocument("제목 없음", itemId);
        } else {
          await createDocument("제목 없음");
        }
        const openList = getItem(IS_OPEN_STATE_LIST_KEY);
        const documents = await updateDocumentList(openList);
        this.setState({ ...this.state, documents });
        return;
      }

      if (target.classList.contains("list-item__button--delete")) {
        const item = target.closest(".list-item");
        const [_, itemId] = item.id.split("-");
        await deleteDocument(`/${itemId}`);
        const openList = getItem(IS_OPEN_STATE_LIST_KEY) || [];
        const documents = await updateDocumentList(openList);
        this.setState({ ...this.state, documents });
        return;
      }

      if (target.classList.contains("list-item__title--text")) {
        const item = target.closest(".list-item");
        if (item) {
          const [_, itemId] = item.id.split("-");
          push(itemId);
        }
        return;
      }
      //
      if (target.tagName === "SUMMARY") {
        const $details = target.closest("details");
        const isOpen = !$details.open;
        const targetId = $details.id;
        if (isOpen) {
          const openList = getItem(IS_OPEN_STATE_LIST_KEY) || [];
          const nextOpenList = [...openList, targetId];
          setItem(IS_OPEN_STATE_LIST_KEY, nextOpenList);
          return;
        }
        const openList = getItem(IS_OPEN_STATE_LIST_KEY);
        const nextOpenList = openList.filter((id) => id !== targetId);
        setItem(IS_OPEN_STATE_LIST_KEY, nextOpenList);
        return;
      }
    });
    //

    this.$target.addEventListener("input", (event) => {
      const { target } = event;
      const selection = window.getSelection();
      const { anchorOffset } = selection;
      if (target.classList.contains("editor--title")) {
        const { id } = this.state.selected;
        debounce(() => {
          const nextTitle = target.innerText;
          const convertedList = convertTitleById(
            id,
            nextTitle,
            this.state.documents,
          );
          this.setState({
            ...this.state,
            documents: convertedList,
            selected: { ...this.state.selected, title: nextTitle },
          });
          const $titleInput = document.querySelector("#title");
          selection.collapse($titleInput.firstChild, anchorOffset);
          updateDocument(`/${this.state.selected.id}`, {
            title: this.state.selected.title,
            content: this.state.selected.content,
          });
        }, 500);
        return;
      }
      if (target.classList.contains("editor--content")) {
        debounce(() => {
          console.log("set");
          this.setState({
            ...this.state,
            selected: { ...this.state.selected, content: target.innerText },
          });
          const $contentInput = document.querySelector("#content");
          selection.setPosition($contentInput.firstChild, anchorOffset);
          updateDocument(`/${this.state.selected.id}`, {
            title: this.state.selected.title,
            content: this.state.selected.content,
          });
        }, 500);
        return;
      }
    });
  }
}
async function updateDocumentList(openList) {
  const documentsTree = await getDocumentsTree();
  const copiedTree = structuredClone(documentsTree);
  return getDocumentList(copiedTree, openList);
}

function getDocumentList(copiedTree, openList = [], selectedId = null) {
  return copiedTree.map((doc) => {
    const isOpen = openList.includes(doc.id.toString());
    const isSelected = selectedId ? doc.id === Number(selectedId) : false;
    const documents = getDocumentList(doc.documents, openList, selectedId);
    return { ...doc, isOpen, documents, isSelected };
  });
}

function convertTitleById(id, title, list) {
  const copiedList = structuredClone(list);
  const target = searchDocumentById(id, copiedList);
  if (target) target.title = title;
  return copiedList;
}

function searchDocumentById(id, list) {
  let que = list;
  const returnValue = [];
  while (que.length) {
    const replace = [];
    que.forEach((doc) => {
      if (doc.id === id) {
        returnValue.push(doc);
        return;
      }
      if (doc.documents.length !== 0) replace.push(...doc.documents);
    });
    if (returnValue.length !== 0) break;
    que = replace;
  }
  return returnValue.pop();
}
