import DocumentList from "../components/DocumentList.js";
import {getDocumentsTree, createDocument, deleteDocument} from "../utils/api.js";
import {push} from "../utils/router.js";
import {ACTIVE} from "../constant/constant.js";
import {validateTitle} from "../utils/validation.js";
import Component from "../components/Component.js";
export default class ListPage extends Component {
  async render() {
    const $list = this.$target.querySelector(".list");
    const documentList = new DocumentList({$target: $list, initialState: []});
    const documents = await getDocumentsTree();
    documentList.setState(documents);
  }
}

const createDocumentByButton = (button, onSubmit) => {
  const {classList} = button;
  if ((classList.contains("list__add-button--root") || classList.contains("list__add-button--document")) && !classList.contains(ACTIVE)) {
    const $li = button.closest("li");
    const $form = document.createElement("form");
    const $input = document.createElement("input");
    $form.appendChild($input);
    button.before($form);
    classList.add(ACTIVE);
    $input.focus();
    $input.addEventListener("blur", () => {
      $form.remove();
      classList.remove(ACTIVE);
    });

    $form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = $input.value.trim();
      if (!validateTitle(title)) {
        alert("title을 입력해주요");
        return;
      }
      createAndPush(title, $li);
      onSubmit();
      $input.blur();
    });
  }
};

const createAndPush = async (title, parent) => {
  if (parent) {
    const {id} = parent.dataset;
    const {id: createdId} = await createDocument(title, id);
    push(createdId);
  } else {
    const {id: createdId} = await createDocument(title);
    push(createdId);
  }
};

const deleteDocumentByButton = async (button, onClick) => {
  if (button.classList.contains("list__add-button--delete")) {
    const $li = button.closest("li");
    const {id} = $li.dataset;
    if (id) {
      await deleteDocument(`/${id}`);
      push();
      onClick();
    }
  }
};
