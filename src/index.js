import { createElement, render } from "./core/core.js";

const TestC = (props) => {
  return <div className="text-testing">test</div>;
};
const TestB = (props) => {
  return (
    <div>
      <span>hihihi{props.name}</span>
      <TestC />
    </div>
  );
};

render(<TestB name={"checkechk"} />, document.body);
