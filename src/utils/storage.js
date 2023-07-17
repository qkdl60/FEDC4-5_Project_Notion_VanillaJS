const storage = window.localStorage;

export const setItem = (key, value) => {
  const stringifiedValue = JSON.stringify(value);
  storage.setItem(key, stringifiedValue);
};

export const getItem = (key, defualtValue) => {
  try {
    const storedValue = storage.getItem(key);
    if (storedValue) return JSON.parse(storedValue);
    return defualtValue;
  } catch (error) {
    console.log(error.message);
    return defualtValue;
  }
};

export const removeItem = (key) => {
  storage.removeItem(key);
};

export const getKey = (id) => {
  return `TEMP-${id}`;
};
