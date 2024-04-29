export const caret = { markCurrentCaretPosition, setCaretPosition };

function markCurrentCaretPosition() {
  const selection = window.getSelection();
  const { anchorNode, anchorOffset } = selection;
  const range = selection.getRangeAt(0);
  if (
    (anchorNode.nodeName !== "#text" &&
      anchorNode.classList.contains("editor--content")) ||
    (anchorNode.nodeName === "#text" &&
      anchorNode.parentNode.classList.contains("editor--content"))
  )
    return;
  const $mark = document.createElement("span");
  $mark.setAttribute("id", "current_cursor");
  range.insertNode($mark);
  return $mark;
}
function setCaretPosition() {
  const selection = window.getSelection();
  let $mark = document.querySelector("#current_cursor");
  if (!$mark) return;
  selection.setPosition($mark, 0);
  while ($mark) {
    $mark.remove();
    $mark = document.querySelector("#current_cursor");
  }
}
