export function createElement(type, props, ...children) {
  const parsedChilde = children.map((child) => {
    if (typeof child === "string" || typeof child === "number")
      return {
        type: "text",
        props: {
          value: child,
        },
      };
    return child;
  });
  return {
    type,
    props: { ...props, children: parsedChilde },
  };
}

export function render(element, container) {
  const { type, props } = element;
  const { children, ...restProps } = props;
  let $el;
  // 함수형 컴포넌트 렌더링
  if (typeof type === "function") {
    const resultEl = type(props);
    render(resultEl, container);
    return;
  }
  if (type === "text") {
    $el = document.createTextNode(restProps.value);
  } else {
    $el = document.createElement(type);
    Object.entries(restProps).forEach(([key, value]) => {
      // jsx 규칙상 class가 className으로 들어온다
      if (key === "className") {
        $el.setAttribute("class", value);
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
