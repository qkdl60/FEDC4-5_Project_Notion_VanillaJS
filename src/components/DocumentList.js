import {validateListState} from "../utils/validation.js";
import Component from "./Component.js";
/*
리스트 컴포넌트이다. 
상태로 리스트의 아이템을 배열로 갔는다. 

_convertIntoHTML은 상태를 <li></li> 아이템으로 만든다.

setState로 상태 변경
input된 상태의 각 아이템이 title, content를 갖는지 확인 후 입력된 state을 nextState로 변경



*/
//TODO onClickButton 제거, addEvent를 외부에서 추가해주는게 좋지 않을까
export default class DocumentList extends Component {
  constructor(props) {
    super(props);
  }
  //TODO 에러 처리 방식 변경 필요
  setState(nextState) {
    try {
      validateListState(nextState);
      this.state = nextState;
    } catch (error) {
      console.log(error);
      this.state = [];
    }
    this.render();
  }

  //TODO 재귀 방식 변경 필요
  #convertIntoHTML(state) {
    return `
    <ul>
    ${state
      .map(
        (doc) => `<li data-id=${doc.id}>
        <span class="list__title">${
          doc.title
        }</span> <button class="list__add-button--document">+</button><button class="list__add-button--delete">-</button>
      ${doc.documents.length > 0 ? this.#convertIntoHTML(doc.documents) : ""}</li>`
      )
      .join(" ")}
    </ul>`;
  }
  render() {
    console.log(this);
    const stateHTML = this.#convertIntoHTML(this.state);
    this.$target.innerHTML = stateHTML;
  }
}
