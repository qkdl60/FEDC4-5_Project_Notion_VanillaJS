const checkObject = (obj, checkKeys) => {
  checkKeys.forEach((key) => {
    if (!obj.hasOwnProperty(key)) throw new Error(`${key}가 없습니다.`);
  });
};

export const validateEditorState = (nextState) => {
  if (typeof nextState !== "object")
    throw new Error("editorState가 object가 아닙니다. ");
  checkObject(nextState, ["title", "content"]);
};

export const validateTitle = (titleValue) => {
  const title = titleValue.trim();
  if (title === "") {
    return false;
  }
  return true;
};

export const validateListState = (nextState) => {
  if (!Array.isArray(nextState))
    throw new Error("listState가 배열이 아닙니다.");
  if (nextState.length > 0) {
    nextState.forEach((doc) => {
      checkObject(doc, ["id", "title", "documents"]);
    });
  }
};
