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

import React, { useEffect, useRef, useState, useMemo } from "react";
import { connect } from "react-redux";
import * as actions from "../../../actions/actions";
import * as actionsSearch from "../../../actions/actions.search";
import { help } from "../../../data/help.js";
import { withFloatingScrollEventsSubscription } from "../../../helpers/withFloatingScrollEventsSubscription";
import "./SearchPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { searchToObj } from "../../../helpers/BrowserHelpers";

const SeachPanelBaseComponent = ({ onQueryStringChange, isFloating, onHelp }) => {
  const textInput = useRef();
  const [value, setValue] = useState("");

  useEffect(() => {

    const blur = () => textInput && textInput.current && textInput.current.blur();
    window.addEventListener("scroll", blur);

    const q = searchToObj()["q"];
    if (q && q.length) {
      const queryString = decodeURIComponent(q);
      setValue(queryString);
    }
    textInput && textInput.current.focus();
    return () => {
      window.removeEventListener("scroll", blur);
    };
  }, []);

  const handleChange = e => {
    textInput && textInput.current && textInput.current.focus();
    setValue(e.target.value);
  };

  const handleSearch = useMemo(() => () => onQueryStringChange(value), [value, onQueryStringChange]);

  const handleKeyDown = useMemo(() => e => {
    if (e.key === "Enter") {
      onQueryStringChange(value);
    }
  }, [value, onQueryStringChange]);

  return (
    <div className={`kgs-search-panel ${isFloating ? " is-fixed-position" : ""}`}>
      <div>
        <div>
          <FontAwesomeIcon icon={faSearch} size="2x" className="kg-search-bar__icon" />
          <input className="kg-search-bar"
            type="text"
            placeholder="Search (e.g. brain or neuroscience)"
            aria-label="Search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            ref={textInput} />
          <button type="button" className="kgs-search-panel-help__button" title="Help" onClick={onHelp}>
            <FontAwesomeIcon icon={faInfoCircle} size="2x" />
          </button>
        </div>
        <button className="kgs-search-panel-button" onClick={handleSearch}>Search</button>
      </div>
    </div>
  );

};

const SeachPanelComponent = ({ isFloating, relatedElements, onHelp, onQueryStringChange }) => (
  <SeachPanelBaseComponent isFloating={isFloating} relatedElements={relatedElements} onHelp={onHelp} onQueryStringChange={onQueryStringChange} />
);

const SearchPanelContainer = connect(
  (state, props) => {
    return {
      isFloating: props.isFloating,
      relatedElements: props.relatedElements,
      queryString: state.search.queryString
    };
  },
  dispatch => ({
    onHelp: () => {
      dispatch(actions.setInfo(help));
    },
    onQueryStringChange: value => {
      dispatch(actionsSearch.setQueryString(value));
    }
  })
)(SeachPanelComponent);

export const SearchPanel = withFloatingScrollEventsSubscription(
  "top",
  [
    { querySelector: "nav.kgs-navbar" },
    { querySelector: ".kgs-notification" }
  ]
)(SearchPanelContainer);
