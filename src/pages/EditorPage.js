import Editor from "../components/Editor.js";
import {getDocumentContent, updateDocument} from "../utils/api.js";
import {getItem, removeItem, setItem, getKey} from "../utils/storage.js";
import {debounce} from "../utils/debounce.js";
import {ACTIVE, DELAY_TIME} from "../constant/constant.js";
//TODO editorComponent에서 title 변경과 content 변경을 분리하자
export default class EditorPage {
  constructor({$target, onEdit}) {
    this.$target = $target;
    this.$page = this.$target.querySelector(".editor");
    this.editorComponent = new Editor({
      $target: this.$page,
      initialState: {title: "", content: ""},
      onSetState: (editorState) => {
        if (location.pathname === "/") return;
        const [, , id] = location.pathname.split("/");
        const tempSaveKey = getKey(id);
        setItem(tempSaveKey, {...editorState, tempSavedAt: new Date()});
        debounce(async () => {
          await updateDocument(`/${id}`, editorState);
          removeItem(tempSaveKey);
          onEdit();
        }, DELAY_TIME);
      },
    });
  }

  showPage = () => {
    const classList = this.$page.classList;
    if (!classList.contains(ACTIVE)) classList.add(ACTIVE);
    this.$page.querySelector("#content").focus();
  };

  hidePage = () => {
    const classList = this.$page.classList;
    if (classList.contains(ACTIVE)) classList.remove(ACTIVE);
  };

  setState = async () => {
    const {pathname} = location;
    if (pathname === "/") {
      this.hidePage();
      return;
    }
    const [, , id] = pathname.split("/");
    if (id === undefined) {
      this.editorComponent.setState({title: "", content: ""});
      return;
    }
    const {title, content, updatedAt} = await getDocumentContent(`/${id}`);
    const tempSaveKey = getKey(id);
    const tempData = getItem(tempSaveKey, null);
    if (tempData && tempData.tempSavedAt > updatedAt) {
      if (confirm("임시저장된 데이터가 있습니다. 사용하시겠습니까?")) {
        const {title, content} = tempData;
        this.editorComponent.setState({title, content});
        this.showPage();
        return;
      }
    }
    this.editorComponent.setState({title, content});
    this.showPage();
  };
}
