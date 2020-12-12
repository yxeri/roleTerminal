const keys = new Map();

window.addEventListener('keydown', (event) => {
  const { key: pressedKey, altKey } = event;
  const key = keys.get(pressedKey);

  if (key && (key.triggerless || altKey)) {
    key.callback();
  }
});

export const addKey = ({ key, callback, triggerless }) => {
  console.log(key);

  keys.set(key, { callback, triggerless });
};

export const removeKey = (key) => {
  console.log(key);

  keys.delete(key);
};
