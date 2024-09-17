const core = {
  root: null,
  rootComponent: null,
  stateList: [],
  setterList: [],
  cursor: 0,
  vDOM: null,
};

const createVirtualDOM = (element) => {
  if (typeof element.type === "function") {
    return createVirtualDOM(element.type(element.props));
  }
  return {
    type: element.type,
    props: element.props,
    children: element.children.map(createVirtualDOM),
  };
};

export function createElement(type, props, ...children) {
  const parsedChilde = children.map((child) => {
    if (typeof child === "string" || typeof child === "number")
      return {
        type: "text",
        props: {
          value: child,
        },
        children: [],
      };
    return child;
  });
  return {
    type,
    props: { ...props },
    children: parsedChilde,
  };
}

export function rootRender(rootComponent, root) {
  core.root = root;
  core.rootComponent = rootComponent;
  core.vDOM = createVirtualDOM(rootComponent);
  console.log(core.vDOM);
  renderRealDOM(core.vDOM, core.root);
}

function renderRealDOM(element, container) {
  const { type, props, children } = element;
  let $el;
  if (type === "text") {
    $el = document.createTextNode(props.value);
  } else {
    $el = document.createElement(type);
    Object.entries(props).forEach(([key, value]) => {
      // jsx 규칙상 class가 className으로 들어온다
      if (key === "className") {
        $el.setAttribute("class", value);
        return;
      }
      if (key.startsWith("on") && typeof value === "function") {
        const eventType = key.toLowerCase().slice(2);
        $el.addEventListener(eventType, value);
        return;
      }
      $el.setAttribute(key, value);
    });
    children.forEach((child) => {
      renderRealDOM(child, $el);
    });
  }
  container.appendChild($el);
}

//리렌더시 초기화
const createSetter = (cursor) => {
  return (newState) => {
    core.stateList[cursor] = newState;
    core.root.innerHTML = "";
    render(core.rootComponent, core.root);
    core.cursor = 0;
  };
};

export function useState(initialState) {
  if (!core.setterList[core.cursor])
    core.setterList.push(createSetter(core.cursor));
  if (!core.stateList[core.cursor]) core.stateList.push(initialState);

  const state = core.stateList[core.cursor];
  const setState = core.setterList[core.cursor];
  core.cursor++;

  return [state, setState];
}

function render(element, container) {
  const { type, props, children } = element;

  let $el;
  // 함수형 컴포넌트 렌더링
  if (typeof type === "function") {
    const resultEl = type(props);
    render(resultEl, container);
    return;
  }
  if (type === "text") {
    $el = document.createTextNode(props.value);
  } else {
    $el = document.createElement(type);
    Object.entries(props).forEach(([key, value]) => {
      // jsx 규칙상 class가 className으로 들어온다
      if (key === "className") {
        $el.setAttribute("class", value);
        return;
      }
      if (key.startsWith("on") && typeof value === "function") {
        const eventType = key.toLowerCase().slice(2);
        $el.addEventListener(eventType, value);
        return;
      }
      $el.setAttribute(key, value);
    });
    children.forEach((child) => {
      render(child, $el);
    });
  }
  container.appendChild($el);
}
