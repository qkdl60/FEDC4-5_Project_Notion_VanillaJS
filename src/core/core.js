const core = {
  root: null, //렌더링이 될 위치
  rootComponent: null, //react의 App 컴포넌트와 같은 진입 컴포넌트
  stateList: [], //state 저장 리스트
  setterList: [], // setState 저장 리스트
  cursor: 0, // state 순서를 위한 cursor
  virtualDOMTree: null, //현재 반영된 VirtualDOMtree
  changes: [], // diff 알고리즘을 통한 변경이 필용한 내용들
};

function createVirtualDOM(element) {
  if (typeof element.type === "function") {
    return createVirtualDOM(element.type(element.props));
  }
  return {
    type: element.type,
    props: element.props,
    children: element.children.flat().map(createVirtualDOM),
    realElement: null,
  };
}

export function createElement(type, props, ...children) {
  const parsedChilde = children.flat().map((child) => {
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
  core.virtualDOMTree = createVirtualDOM(rootComponent);
  renderRealDOM(core.virtualDOMTree, core.root);
  core.cursor = 0;
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
  element.realElement = $el;
  container.appendChild($el);
}

function createSetter(cursor) {
  return (newState) => {
    core.stateList[cursor] = newState;
    const nextVirtualDOMTree = createVirtualDOM(core.rootComponent);
    diff(core.virtualDOMTree, nextVirtualDOMTree);
    updateDOMTree();
    core.changes = [];
    core.virtualDOMTree = nextVirtualDOMTree;
    core.cursor = 0;
  };
}

export function useState(initialState) {
  if (!core.setterList[core.cursor])
    core.setterList.push(createSetter(core.cursor));
  if (!core.stateList[core.cursor]) core.stateList.push(initialState);

  const state = core.stateList[core.cursor];
  const setState = core.setterList[core.cursor];
  core.cursor++;

  return [state, setState];
}

function diff(oldVDOMNode, newVDOMNode, parent, index = 0) {
  if (!oldVDOMNode && newVDOMNode) {
    core.changes.push({ type: "add", target: newVDOMNode, parent, index });
  } else if (oldVDOMNode && !newVDOMNode) {
    core.changes.push({ type: "remove", target: oldVDOMNode });
  } else if (
    oldVDOMNode.type !== newVDOMNode.type ||
    !isEqualProps(oldVDOMNode.props, newVDOMNode.props)
  ) {
    core.changes.push({
      type: "replace",
      target: oldVDOMNode,
      replace: newVDOMNode,
    });
  } else {
    const oldChildren = oldVDOMNode.children;
    const newChildren = newVDOMNode.children;
    newVDOMNode.realElement = oldVDOMNode.realElement;
    const max = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < max; i++) {
      diff(oldChildren[i], newChildren[i], newVDOMNode);
    }
  }
}

function isEqualProps(oldProps, newProps) {
  if (Object.keys(oldProps).length !== Object.keys(newProps).length)
    return false;
  for (const key in oldProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue !== newValue) return false;
  }
  return true;
}

const changeHandler = {
  add: (change) => {
    const { target, parent } = change;
    const $frag = document.createDocumentFragment();
    renderRealDOM(target, $frag);
    parent.realElement.appendChild($frag);
  },
  remove: (change) => {
    const { target } = change;
    const { realElement } = target;
    realElement.parentNode.removeChild(realElement);
  },
  replace: (change) => {
    const { target, replace } = change;
    const { realElement } = target;
    const $frag = document.createDocumentFragment();
    renderRealDOM(replace, $frag);
    realElement.parentNode.replaceChild($frag, realElement);
  },
};
function updateDOMTree() {
  core.changes.forEach((change) => {
    const { type } = change;
    changeHandler[type](change);
  });
}
