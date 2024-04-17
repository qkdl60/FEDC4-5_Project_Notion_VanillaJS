import Component from "../core/Component.js";

export default class EditorPage extends Component {
  template() {
    return `
    <div contentEditable=${!!this.props.id} class="editor--title" >
    ${this.props.title ? `<span id="title">${this.props.title}</span>` : "초기 페이지입니다. "}
    </div>
    <div contentEditable=${!!this.props.id} class="editor--content" placeholder="내용을 입력해주세요." >${this.props.content ? `${this.props.content}` : ""}</div>

    `;
  }
}
