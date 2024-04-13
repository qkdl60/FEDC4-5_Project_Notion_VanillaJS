import Component from "../core/Component.js";
// TODO 초기값은 플레이스 홀드 스타일, id undefined 처리
export default class EditorPage extends Component {
  template() {
    return `
  <div class='editor-page__header'>
    브래드크럼,전역 상태가 필요한 부분
  </div> 
  <div id="content-${this.props.id}" class="editor-page__body" >
    <div contentEditable=${!!this.props.id} class="editor--title" >
    ${this.props.title ? `<span id="title">${this.props.title}</span>` : "초기 페이지입니다. "}
    </div>
    <div contentEditable=${!!this.props.id} class="editor--content" placeholder="내용을 입력해주세요." >${this.props.content ? `<span id="content" >${this.props.content}</span>` : ""}</div>
  </div>
    `;
  }
}
