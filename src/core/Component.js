export default class Component {
  $target;

  props;

  state;

  constructor($target, props) {
    this.$target = $target;
    this.props = props;
    this.setUp();
    this.render();
    this.setEvent();
  }

  setEvent() {}

  setUp() {}

  mounted() {}

  template() {
    return ``;
  }

  render() {
    this.$target.innerHTML = this.template();
    this.mounted();
  }

  setState(value) {
    // TODO 검증식 중복 여부 확인하기
    this.state = { ...this.state, ...value };
    this.render();
  }
}
