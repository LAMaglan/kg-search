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

import { connect } from "react-redux";
import { ShareButtons as Component } from "../components/ShareButtons";
import API from "../services/API";

const getShareEmailToLink = url => {
  const to= "";
  const subject= "Knowledge Graph Search Request";
  const body = "Please have a look to the following Knowledge Graph search request";
  return `mailto:${to}?subject=${subject}&body=${body} ${escape(url)}.`;
};

const getClipboardContent = (state, location, currentInstance, currentIndex) => {
  let href = "";
  if (currentInstance) {
    if (currentInstance.found && currentInstance._index && currentInstance._type && currentInstance._id) {
      const indexReg = /^kg_(.*)$/;
      const index = indexReg.test(currentInstance._index)?currentInstance._index.match(indexReg)[1]:(currentIndex?currentIndex:null);
      if (index && index !== API.defaultIndex) {
        href = `groups/${index}/${currentInstance._type}/${currentInstance._id}`;
      } else {
        href = `instances/${currentInstance._type}/${currentInstance._id}`;
      }
    } else {
      const instanceId = location.hash.substring(1);
      if (instanceId) {
        if (currentIndex && currentIndex !== API.defaultIndex) {
          href = `groups/${currentIndex}/${instanceId}`;
        } else {
          href = `instances/${instanceId}`;
        }
      } else {
        href = location.search;
      }
    }
  } else {
    href = location.search;
  }
  return `${state.definition.serviceUrl}/webapp/${href}`;
};

export const ShareButtons = connect(
  state => {
    const href = getClipboardContent(state, window.location, state.instances.currentInstance, state.search.index);
    return {
      clipboardContent: href,
      emailToLink: getShareEmailToLink(href)
    };
  }
)(Component);