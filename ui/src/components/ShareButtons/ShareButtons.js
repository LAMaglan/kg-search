/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React from "react";
import { CopyToClipboardButton } from "../CopyToClipboard/CopyToClipboardButton";
import EmailToLink from "../EmailToLink/EmailToLink";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons/faEnvelope";
import {faClipboard} from "@fortawesome/free-solid-svg-icons/faClipboard";

import "./ShareButtons.css";

const getClipboardContent = (currentInstance, group, defaultGroup) => {
  if (window.location.pathname === "/" && currentInstance) {
    const id = currentInstance._id;
    if (id) {
      return `${window.location.protocol}//${window.location.host}/instances/${id}${group !== defaultGroup ? ("?group=" + group) : ""}`;
    }
  }
  return window.location.href;
};

const getShareEmailToLink = url => {
  const to = "";
  const subject = "Knowledge Graph Search Request";
  const body = "Please have a look to the following Knowledge Graph search request";
  return `mailto:${to}?subject=${subject}&body=${body} ${escape(url)}.`;
};

export const ShareButtons = ({ className, currentInstance, group, defaultGroup}) => {

  const clipboardContent = getClipboardContent(currentInstance, group, defaultGroup);

  return (
    <span className={`kgs-share-links ${className ? className : ""}`}>
      <span className="kgs-share-links-panel">
        <CopyToClipboardButton icon={faClipboard}  title="Copy search link to clipboard" confirmationText="search link copied to clipoard" content={clipboardContent} />
        <EmailToLink icon={faEnvelope} title="Send search link by email" link={getShareEmailToLink(clipboardContent)} />
      </span>
    </span>
  );
};

export default ShareButtons;