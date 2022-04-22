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

import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons/faSyncAlt";

import { Select } from "../../components/Select/Select";
import "./FileFilter.css";


const FileFilter = ({ title, fileFilters, isFilesInitialized, isFilesLoading, isFileFiltersInitialized, isFileFiltersLoading, filesError, fileFiltersError, fileFilter, fetch, onSelect }) => {

  useEffect(() => {
    if (!isFileFiltersInitialized) {
      fetch();
    }
  }, [isFileFiltersInitialized]);

  if (!isFilesInitialized || filesError) {
    return null;
  }

  if (fileFiltersError) {
    if (isFilesLoading) {
      return null;
    }
    return (
      <div>
        <span style={{color: "var(--code-color)"}}><FontAwesomeIcon icon={faExclamationTriangle} />{fileFiltersError} </span>
        <FontAwesomeIcon icon={faSyncAlt} onClick={fetch} style={{cursor: "pointer"}}/>
      </div>
    );
  }

  if (!isFileFiltersInitialized || isFileFiltersLoading) {
    if (isFilesLoading) {
      return null;
    }
    return (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="sr-only">Retrieving {title}...</span>
      </div>
    );
  }

  if (!fileFilters.length) {
    return null;
  }

  const list = fileFilters.reduce((acc, value) => {
    acc.push({label: value, value: value});
    return acc;
  }, [{label: "none", value: ""}]);

  const handleChange = value => onSelect(value?value:null);

  return (
    <div><Select className="kgs-fileFilter" label={title} value={fileFilter} list={list} onChange={handleChange} /></div>
  );

};


export default FileFilter;