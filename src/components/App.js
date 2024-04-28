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
    this.state = {
      documents: [],
      selected: initialSelected,
      isDarkMode: false,
      currentPath: null,
    };
    const openList = getItem(IS_OPEN_STATE_LIST_KEY) || [];
    const documents = await updateDocumentList(openList);
    this.setState({ ...this.state, documents });

    initRouter(async (id) => {
      const selected = await getDocumentContent(`/${id}`);
      const openedList = getItem(IS_OPEN_STATE_LIST_KEY) || [];
      const copiedList = structuredClone(this.state.documents);
      const updatedList = getDocumentList(copiedList, openedList, id);
      const currentPath = getPath(this.state.documents, id);
      this.setState({
        ...this.state,
        documents: updatedList,
        selected,
        currentPath,
      });
    });
  }

  template() {
    return `
    <div class="theme__provider ${this.state.isDarkMode ? "dark" : ""}">
    <div class="list-page">리스트 페이지</div>
    <div class="editor-page">
      <div class='editor-page__header'>
        <div class="editor-page__header--breadcrumb"> 
          ${this.state.currentPath ? this.state.currentPath.map((item) => `<span id="breadcrumb-${item.id}" class="breadcrumb__item">${item.title}</span>`).join("") : ""}
        </div>
        <label class="theme-toggle" >
          <span>☀️</span>
          <input class="theme-toggle__button" ${this.state.isDarkMode ? "checked" : ""}  type="checkbox">
          <span>🌙</span>
          </label>
      </div> 
      <div class="editor-page__body">에디터 페이지</div>
    </div>
    </div>
    
    `;
  }

  mounted() {
    const $listPage = this.$target.querySelector(".list-page");
    const $editorPage = this.$target.querySelector(".editor-page__body");
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
    this.$target.addEventListener("pointerup", (event) => {
      const $editorContent = document.querySelector(".editor--content");
      if (event.target !== $editorContent) {
        return;
      }
      // 마지막이 br이면 삭제 후 $newline
      if (!$editorContent.hasChildNodes()) {
        const $newLine = document.createElement("div");
        $editorContent.appendChild($newLine);
        window.getSelection().setPosition($newLine);
        return;
      }
      if ($editorContent.lastChild.nodeName === "BR") {
        const $newLine = document.createElement("div");
        $editorContent.replaceChild($newLine, $editorContent.lastChild);
        window.getSelection().setPosition($newLine);
        return;
      }
    });

    this.$target.addEventListener("click", async (event) => {
      const { target } = event;
      if (target.classList.contains("breadcrumb__item")) {
        const targetId = target.id;
        const [_, id] = targetId.split("-");
        push(id);
        return;
      }
      if (target.classList.contains("list-page__header--title")) {
        push();
        this.setState({
          ...this.state,
          selected: initialSelected,
          currentPath: null,
        });
        return;
      }
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
        if (Number(itemId) === this.state.selected.id) {
          this.setState({
            ...this.state,
            documents,
            selected: initialSelected,
            currentPath: null,
          });
          push();
          return;
        }
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
    // TODO 현재 커서우치가 editor라면 div를 씌워줘야하낟.
    this.$target.addEventListener("keydown", (event) => {
      const selection = window.getSelection();
      const { anchorNode, anchorOffset } = selection;
      const $editorContent = document.querySelector(".editor--content");
      if ($editorContent === anchorNode) return;
      // 취소선
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const nodes = [];
        const sTagNodes = [];
        const treeWalker = document.createTreeWalker(
          document.querySelector(".editor--content"),
          NodeFilter.SHOW_TEXT,
        );

        while (treeWalker.nextNode()) {
          const { currentNode } = treeWalker;
          if (range.intersectsNode(currentNode)) {
            if (currentNode.parentNode.nodeName === "S") {
              sTagNodes.push(currentNode);
            } else if (currentNode.nodeName === "#text") {
              nodes.push(currentNode);
            }
          }
        }
        if (nodes.length === 0) {
          sTagNodes.forEach((node) => {
            if (node === range.startContainer && node === range.endContainer) {
              const targetNode = node.splitText(range.startOffset);
              const postTextNode = targetNode.splitText(range.endOffset);
              node.parentNode.removeChild(targetNode);
              node.parentNode.removeChild(postTextNode);
              const newNode = document.createElement("s");
              newNode.textContent = postTextNode.textContent;
              node.parentNode.after(targetNode, postTextNode);
              return;
            }
            if (node === range.startContainer) {
              const targetNode = node.splitText(range.startOffset);
              targetNode.parentNode.removeChild(targetNode);
              node.parentNode.parentNode.appendChild(targetNode);
              return;
            }
            if (node === range.endContainer) {
              const restNode = node.splitText(range.endOffset);
              node.parentNode.parentNode.insertBefore(
                node,
                restNode.parentNode,
              );
              return;
            }
            const newTextNode = document.createTextNode(node.textContent);
            node.parentNode.parentNode.replaceChild(
              newTextNode,
              node.parentNode,
            );
          });
          const $currentLine = findClosestDiv(selection.anchorNode);
          if ($currentLine && $currentLine.hasChildNodes()) {
            const childList = $currentLine.childNodes;
            while (childList.length) {
              const child = childList.pop();
              if (child.textContent.length === 0) {
                $currentLine.removeChild(child);
              }
            }
          }
          return;
        }

        nodes.forEach((node) => {
          if (node === range.startContainer && node === range.endContainer) {
            const targetNode = node.splitText(range.startOffset);
            targetNode.splitText(range.endOffset);
            const newNode = document.createElement("s");
            newNode.textContent = range.toString();
            node.parentNode.replaceChild(newNode, targetNode);
            return;
          }
          if (node === range.startContainer) {
            const targetNode = node.splitText(range.startOffset);
            const newNode = document.createElement("s");
            newNode.textContent = targetNode.textContent;
            targetNode.parentNode.replaceChild(newNode, targetNode);
            return;
          }
          if (node === range.endContainer) {
            const restNode = node.splitText(range.endOffset);
            const newNode = document.createElement("s");
            newNode.textContent = node.textContent;
            node.parentNode.replaceChild(newNode, node);
            return;
          }
          const newNode = document.createElement("s");
          newNode.textContent = node.textContent;
          node.parentNode.replaceChild(newNode, node);
        });
        caret.markCurrentCaretPosition();

        debounce(() => {
          this.setState({
            ...this.state,
            selected: {
              ...this.state.selected,
              content: $editorContent.innerHTML,
            },
          });
          setCaretPosition();
          updateDocument(`/${this.state.selected.id}`, {
            title: this.state.selected.title,
            content: $editorContent.innerHTML,
          });
        }, 500);
      }

      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      if (event.key === "Enter") {
        if (event.target.classList.contains("editor--title")) {
          event.preventDefault();
          const $firstLine = $editorContent.firstChild;
          const $newLine = document.createElement("div");
          const nextRange = document.createRange();
          $editorContent.insertBefore($newLine, $firstLine);
          nextRange.selectNodeContents($newLine);
          selection.removeAllRanges();
          selection.addRange(nextRange);
          selection.collapseToEnd();
        }
        if (event.target.classList.contains("editor--content")) {
          event.preventDefault();
          const $currentLine = findClosestDiv(anchorNode);
          const $nextLine = $currentLine.nextSibling;
          const $mark = caret.markCurrentCaretPosition();
          const postRange = document.createRange();
          postRange.setEndAfter($currentLine);
          postRange.setStartBefore($mark);
          selection.removeAllRanges();
          selection.addRange(postRange);
          const extractedContents =
            postRange.extractContents().firstChild.childNodes;
          console.log(extractedContents);
          const $newLine = document.createElement("div");
          $newLine.append(...extractedContents);
          $editorContent.insertBefore($newLine, $nextLine);
          caret.setCaretPosition();
        }
      }
      if (event.key === "Backspace") {
        const $currentLine = findClosestDiv(selection.anchorNode);
        const range = selection.getRangeAt(0);
        if (!$currentLine) return;
        const $mark = caret.markCurrentCaretPosition();
        const preRange = document.createRange();
        preRange.setStart($currentLine, 0);
        preRange.setEnd(range.startContainer, range.startOffset);
        selection.removeAllRanges();
        selection.addRange(preRange);
        if (preRange.toString().length === 1) {
          event.preventDefault();
          const prevContent = $mark.previousSibling;
          const text = document.createTextNode("");
          $currentLine.replaceChild(text, prevContent);
        } else if (preRange.toString().length === 0) {
          event.preventDefault();
          const $prevLine = $currentLine.previousSibling;
          if ($prevLine && $prevLine.nodeName === "DIV") {
            $prevLine.append(...$currentLine.childNodes);
            $currentLine.remove();
          }
        }
        caret.setCaretPosition();
      }
    });

    this.$target.addEventListener("input", (event) => {
      const { target } = event;
      if (target.classList.contains("theme-toggle__button")) {
        this.setState({ ...this.state, isDarkMode: !this.state.isDarkMode });
        return;
      }
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
          const newPath = getPath(convertedList, id);
          this.setState({
            ...this.state,
            documents: convertedList,
            selected: { ...this.state.selected, title: nextTitle },
            currentPath: newPath,
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
        const $currentLine = findClosestDiv(selection.anchorNode);

        //   debounce(() => {
        //     // 앞뒤로 배치?보다는 setState를 콜백으로 받아서 처리하자
        //     caret.markCurrentCaretPosition();
        //     const markdownText = replaceMarkdown(target.innerHTML);
        //     this.setState({
        //       ...this.state,
        //       selected: { ...this.state.selected, content: markdownText },
        //     });
        //     caret.setCaretPosition();
        //     updateDocument(`/${this.state.selected.id}`, {
        //       title: this.state.selected.title,
        //       content: this.state.selected.content,
        //     });
        //   }, 500);
        //   return;
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

function findDocument(documentList, id) {
  return documentList
    .filter((doc) => {
      const stringified = JSON.stringify(doc);
      return stringified.includes(`:${id},`);
    })
    .pop();
}

function getPath(documentList, id) {
  const returnValue = [];
  let target = findDocument(documentList, id);
  while (target) {
    const currentValue = { id: target.id, title: target.title };
    returnValue.push(currentValue);
    if (currentValue.id === id) break;
    const child = findDocument(target.documents, id);
    target = child;
  }
  return returnValue;
}

function replaceMarkdown(text) {
  return text
    .replace(/>-&nbsp;<\//g, ' class="markdown--list-item" >&nbsp;</')
    .replace(/>\/#{1,4}&nbsp;<\//g, (match) => {
      const headerNumber = match.split("#").length - 1;
      return ` class="markdown--header${headerNumber}" >&nbsp;</`;
    });
}

function findClosestDiv(node) {
  let currentNode = node;
  while (currentNode) {
    if (currentNode.nodeName === "#text") {
      currentNode = currentNode.parentNode;
      continue;
    }
    if (currentNode.classList.contains("editor--content")) return null;
    if (currentNode.nodeName === "DIV") {
      return currentNode;
    }

    currentNode = currentNode.parentNode;
  }
  return null;
}

const initialSelected = {
  id: null,
  title: "📌마크다운 사용법",
  content: `<div>반갑습니다👋👋👋, 간단한 마크다운을 지원하는 메모장 서비스입니다.</div>
  <div class="markdown--header3">&nbsp;</div><div class="markdown--header3">&nbsp;지원되는 기능</div>
  <div class="markdown--list-item">&nbsp;간단한 마크 다운 기능을 사용할 수 있습니다.&nbsp;</div>
  <div class="markdown--list-item">&nbsp;텍스트를 입력하면 자동으로 저장되고 저장된 내용은 나중에 불러올 수 있습니다.&nbsp;</div>
  <div class="markdown--list-item">&nbsp;우측 상단 스위치를 통해서 테마(다크 모드, 라이트 모드)를 변경할 수 있습니다.</div>
  <div class="markdown--list-item">&nbsp;에디터 상단에는 브래드 크럼이 있어서 해당 문서의 위치를 알 수 있습니다.&nbsp;</div>
  <div><br></div>
  <div class="markdown--header3">&nbsp;지원되는 마크 다운</div><div class="markdown--list-item">&nbsp;헤더</div>
  <div>헤더는 h1, h2, h3가 있습니다. 사용시 해당 라인 가장 앞 부분에서 '/# ', '/## ', '/### '을 써주시면 됩니다.&nbsp;</div>
  <div class="markdown--header1">h1 /#</div><div class="markdown--header2">h2 /##&nbsp;</div><div class="markdown--header3">h3 /###</div>
  <div><br></div>
  <div class="markdown--list-item">&nbsp;리스트 아이템</div>
  <div>리스트 아이템은 사용시 해당 라인 가장 앞 부분에서 '- ' 를 넣어주시면 됩니다.&nbsp;</div>
  <div class="markdown--list-item">&nbsp;아이템</div><div class="markdown--list-item">&nbsp;아이템</div>
  <div class="markdown--list-item">&nbsp;아이템</div><div><br></div>
  <div class="markdown--list-item">&nbsp;취소선</div>
  <div>취소선은 텍스트를 누르고 ctrl+s를 눌러주시면 됩니다.</div><div><s>취소선</s></div>
  `,
};

const caret = { markCurrentCaretPosition, setCaretPosition };

function markCurrentCaretPosition() {
  const selection = window.getSelection();
  const { anchorNode, anchorOffset } = selection;
  const range = selection.getRangeAt(0);
  if (
    (anchorNode.nodeName !== "#text" &&
      anchorNode.classList.contains("editor--content")) ||
    (anchorNode.nodeName === "#text" &&
      anchorNode.parentNode.classList.contains("editor--content"))
  )
    return;
  const $mark = document.createElement("span");
  $mark.setAttribute("id", "current_cursor");
  range.insertNode($mark);
  return $mark;
}
function setCaretPosition() {
  const selection = window.getSelection();
  let $mark = document.querySelector("#current_cursor");
  if (!$mark) return;
  selection.setPosition($mark, 0);
  while ($mark) {
    $mark.remove();
    $mark = document.querySelector("#current_cursor");
  }
}
