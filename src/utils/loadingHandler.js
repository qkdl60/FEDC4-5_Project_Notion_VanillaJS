import { ACTIVE } from "../constant/constant";

const $loadingBox = document.querySelector(".header--loading");
const { classList } = $loadingBox;

export const showLoading = () => {
  if (!classList.contains(ACTIVE)) classList.add(ACTIVE);
};

export const hideLoading = () => {
  if (classList.contains(ACTIVE)) classList.remove(ACTIVE);
};
