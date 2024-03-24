import Editor from "../components/Editor";
import { getDocumentContent, updateDocument } from "../utils/api";
import { getItem, removeItem, setItem, getKey } from "../utils/storage";
import { debounce } from "../utils/debounce";
import { ACTIVE, DELAY_TIME } from "../constant/constant";
// TODO editorComponent에서 title 변경과 content 변경을 분리하자
export default class EditorPage {
  constructor({ $target, onEdit }) {
    this.$target = $target;
    this.$page = this.$target.querySelector(".editor");
    this.editorComponent = new Editor({
      $target: this.$page,
      initialState: { title: "", content: "" },
      onSetState: (editorState) => {
        if (window.location.pathname === "/") return;
        const [, , id] = window.location.pathname.split("/");
        const tempSaveKey = getKey(id);
        setItem(tempSaveKey, { ...editorState, tempSavedAt: new Date() });
        debounce(async () => {
          await updateDocument(`/${id}`, editorState);

          removeItem(tempSaveKey);
          onEdit();
        }, DELAY_TIME);
      },
    });
  }

  showPage = () => {
    const { classList } = this.$page;
    if (!classList.contains(ACTIVE)) classList.add(ACTIVE);
    this.$page.querySelector("#content").focus();
  };

  hidePage = () => {
    const { classList } = this.$page;
    if (classList.contains(ACTIVE)) classList.remove(ACTIVE);
  };

  setState = async () => {
    const { pathname } = window.location;
    if (pathname === "/") {
      this.hidePage();
      return;
    }
    const [, , id] = pathname.split("/");
    if (id === undefined) {
      this.editorComponent.setState({ title: "", content: "" });
      return;
    }
    const { title, content, updatedAt } = await getDocumentContent(`/${id}`);
    const tempSaveKey = getKey(id);
    const tempData = getItem(tempSaveKey, null);
    if (tempData && tempData.tempSavedAt > updatedAt) {
      if (Window.confirm("임시저장된 데이터가 있습니다. 사용하시겠습니까?")) {
        const { tempTitle, tempContent } = tempData;
        this.editorComponent.setState({ tempTitle, tempContent });
        this.showPage();
        return;
      }
    }
    this.editorComponent.setState({ title, content });
    this.showPage();
  };
}
