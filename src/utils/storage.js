const storage = window.localStorage;

export const setItem = (key, value) => {
  const stringifiedValue = JSON.stringify(value);
  storage.setItem(key, stringifiedValue);
};

export const getItem = (key, defaultValue) => {
  try {
    const storedValue = storage.getItem(key);
    if (storedValue) return JSON.parse(storedValue);
    return defaultValue;
  } catch (error) {
    console.log(error.message);
    return defaultValue;
  }
};

export const removeItem = (key) => {
  storage.removeItem(key);
};

export const getKey = (id) => {
  return `TEMP-${id}`;
};
