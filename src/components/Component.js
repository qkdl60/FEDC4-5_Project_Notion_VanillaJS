export default class Component {
  $target;
  state;
  constructor($target, initialState) {
    this.$target = $target;
    this.state = initialState;
    this.render();
  }
  render() {}
  setState(nextState) {
    this.state = nextState;
    this.render;
  }
}
