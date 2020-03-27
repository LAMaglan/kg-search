/*
*   Copyright (c) 2018, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import * as types from "../actions/actions.types";
import {termsCurrentVersion} from "../data/termsShortNotice";

const TermsShortNoticeLocalStorageKey = "ebrains-search-terms-conditions-consent";

const initialState = {
  isReady: false,
  info: null,
  showTermsShortNotice: typeof Storage === "undefined" || !localStorage.getItem(TermsShortNoticeLocalStorageKey),
  showTermsShortUpdateNotice: typeof Storage !== "undefined" && localStorage.getItem(TermsShortNoticeLocalStorageKey) && localStorage.getItem(TermsShortNoticeLocalStorageKey) !== termsCurrentVersion
};

const setApplicationReady = state => ({
  ...state,
  isReady: true
});

const agreeTermsShortNotice = state => {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(TermsShortNoticeLocalStorageKey, termsCurrentVersion);
  }
  setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
  return {
    ...state,
    showTermsShortNotice: false,
    showTermsShortUpdateNotice: false
  };
};

const setInfo = (state, action) => {
  return {
    ...state,
    info: action.text
  };
};

export function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case types.SET_APPLICATION_READY:
    return setApplicationReady(state, action);
  case types.AGREE_TERMS_SHORT_NOTICE:
    return agreeTermsShortNotice(state, action);
  case types.SET_INFO:
    return setInfo(state, action);
  case types.LOAD_SEARCH_REQUEST:
  case types.LOAD_INSTANCE_REQUEST:
  case types.CANCEL_INSTANCE_LOADING:
  case types.SET_INSTANCE:
  case types.SET_PREVIOUS_INSTANCE:
  case types.CLEAR_ALL_INSTANCES:
  default:
    return state;
  }
}