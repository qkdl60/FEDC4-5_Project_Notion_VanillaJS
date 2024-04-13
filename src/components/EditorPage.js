import Component from "../core/Component.js";
// TODO 초기값은 플레이스 홀드 스타일, id undefined 처리
export default class EditorPage extends Component {
  template() {
    return `
    <div contentEditable=${!!this.props.id} class="editor--title" >
    ${this.props.title ? `<span id="title">${this.props.title}</span>` : "초기 페이지입니다. "}
    </div>
    <div contentEditable=${!!this.props.id} class="editor--content" placeholder="내용을 입력해주세요." >${this.props.content ? `<span id="content" >${this.props.content}</span>` : ""}</div>

    `;
  }
}
