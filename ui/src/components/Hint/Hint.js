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
import PropTypes from "prop-types";
import uniqueId from "lodash/uniqueId";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons/faInfoCircle";

import "./Hint.css";

export const Hint = ({className, value}) => {
  if (!value && value !== 0) {
    return null;
  }
  const classNames = ["kgs-hint", className].join(" ");
  const hint_id = encodeURI(uniqueId("kgs-hint_content-"));
  return (
    <span className={classNames}>
      <FontAwesomeIcon icon={faInfoCircle} data-tip data-for={hint_id} aria-hidden="true" />
      <ReactTooltip id={hint_id} place="right" type="dark" effect="solid">
        <span>{value}</span>
      </ReactTooltip>
    </span>
  );
};

Hint.propTypes = {
  className: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ])
};

export default Hint;