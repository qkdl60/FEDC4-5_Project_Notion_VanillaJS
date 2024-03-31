import { ROUTE_CHANGE_EVENT_NAME } from "../constant/constant.js";

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
// TODO 새로고침 에러 수정 필요
export const initRouter = (onRoute) => {
  window.addEventListener(ROUTE_CHANGE_EVENT_NAME, (e) => {
    const url = e.detail;
    window.history.pushState(null, null, `${url}`);
    const { pathname } = window.location;
    const [, , id] = pathname.split("/");
    onRoute(id); // editor 아이템 변경해줘야한다.
  });

  const { pathname } = window.location;
  const [, , id] = pathname.split("/");
  push(id);
};
