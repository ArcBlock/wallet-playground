"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStorage;

function createStorage() {
  let storageKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'did.auth.token';

  if (!storageKey) {
    throw new Error('storageKey must be specified to create a storage');
  }

  function setToken(token) {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return undefined;
    }

    return localStorage.setItem(storageKey, token);
  }

  function getToken() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return undefined;
    }

    return localStorage.getItem(storageKey);
  }

  function removeToken() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return undefined;
    }

    return localStorage.removeItem(storageKey);
  }

  return {
    getToken,
    setToken,
    removeToken
  };
}