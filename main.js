import EditorPage from "./src/pages/EditorPage";
import ListPage from "./src/pages/ListPage";
import { initRouter } from "./src/utils/router";

const $app = document.querySelector(".App");
const $listPage = $app.querySelector(".listPage");
const $editor = $app.querySelector(".editorPage");

const listPage = new ListPage({ $target: $listPage });
// TODO titl변경시만 onEdit이 호출되도록, 디바운스도 설정되어야한다.
const editorPage = new EditorPage({
  $target: $editor,
  onEdit: () => {
    listPage.render();
  },
});

initRouter(() => {
  editorPage.setState();
});
