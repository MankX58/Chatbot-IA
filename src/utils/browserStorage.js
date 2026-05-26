export const STORAGE_KEYS = {
  chatTickets: 'chat_tickets',
  learnedKnowledge: 'learned_kb',
};

function getStorage(type) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window[type];
  } catch {
    return null;
  }
}

export function readSessionItem(key, fallbackValue = '') {
  const storage = getStorage('sessionStorage');

  if (!storage) {
    return fallbackValue;
  }

  try {
    return storage.getItem(key) ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeSessionItem(key, value) {
  const storage = getStorage('sessionStorage');

  if (!storage) {
    return;
  }

  try {
    if (!value) {
      storage.removeItem(key);
      return;
    }

    storage.setItem(key, value);
  } catch {
    // Ignore storage quota and privacy mode errors.
  }
}

export function readLocalJson(key, fallbackValue) {
  const storage = getStorage('localStorage');

  if (!storage) {
    return fallbackValue;
  }

  try {
    return JSON.parse(storage.getItem(key)) || fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeLocalJson(key, value) {
  const storage = getStorage('localStorage');

  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota and privacy mode errors.
  }
}

export function removeLocalItem(key) {
  const storage = getStorage('localStorage');

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage quota and privacy mode errors.
  }
}

export function listLocalKeys() {
  const storage = getStorage('localStorage');

  if (!storage) {
    return [];
  }

  try {
    const keys = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);

      if (key) {
        keys.push(key);
      }
    }

    return keys;
  } catch {
    return [];
  }
}
