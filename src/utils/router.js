import { ROUTE_CHANGE_EVENT_NAME } from "../constant/constant";

export const push = (id = null) => {
  if (id !== null) {
    window.dispatchEvent(
      new CustomEvent(ROUTE_CHANGE_EVENT_NAME, { detail: `/documents/${id}` }),
    );
  } else {
    window.dispatchEvent(
      new CustomEvent(ROUTE_CHANGE_EVENT_NAME, { detail: "/" }),
    );
  }
};

export const initRouter = (onRoute) => {
  window.addEventListener(ROUTE_CHANGE_EVENT_NAME, (e) => {
    const url = e.detail;
    Window.history.pushState(null, null, `${url}`);
    onRoute();
  });

  const { pathname } = Window.location;
  const [, , id] = pathname.split("/");
  push(id);
};
