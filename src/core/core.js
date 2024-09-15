export function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return {
          type: "text",
          props: {
            value: child,
          },
        };
      return child;
    }),
  };
}

export function render(element, container) {
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
      $el.setAttribute(key, value);
    });
    children.forEach((child) => {
      render(child, $el);
    });
  }
  container.appendChild($el);
}
