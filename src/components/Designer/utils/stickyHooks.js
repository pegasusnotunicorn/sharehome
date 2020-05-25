import { useState, useEffect, useReducer } from 'react';

//function to use window.localStorage for react states
export function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? JSON.parse(stickyValue)
      : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export function useStickyReducer(reducer, defaultState, storageKey, init = null) {
  const hookVars = useReducer(reducer, defaultState, (defaultState) => {
    const persisted = JSON.parse(localStorage.getItem(storageKey))
    return persisted !== null
      ? persisted
      : init !== null ? init(defaultState) : defaultState
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hookVars[0]))
  }, [storageKey, hookVars])

  return hookVars
}
