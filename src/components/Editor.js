import { validateEditorState } from "../utils/validation";

export default class Editor {
  constructor({ $target, initialState, onSetState }) {
    this.$target = $target;
    this.state = initialState;
    this.$title = this.$target.querySelector("#title");
    this.$content = this.$target.querySelector("#content");
    this.$target.append(this.$title, this.$content);

    this.$target.addEventListener("input", (e) => {
      const { target } = e;
      const { id } = target;
      this.setState({ ...this.state, [id]: target.value });
      onSetState(this.state);
    });

    this.render();
  }

  render = () => {
    this.$title.value = this.state.title;
    this.$content.value = this.state.content;
  };

  setState = (nextState) => {
    try {
      validateEditorState(nextState);
      this.state = nextState;
    } catch (error) {
      console.log(error);
      this.state = { title: "", content: "" };
    }
    this.render();
  };
}
