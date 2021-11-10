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

import { getTags } from "../../../helpers/InstanceHelper";
import { Tags } from "../../Tags/Tags";
import { Field } from "../../Field/Field";
import { FieldsPanel } from "../../Field/FieldsPanel";
import { VersionSelector } from "../../VersionSelector/VersionSelector";
import { history } from "../../../store";

import "./Header.css";

export const Header = ({header, group, path, fetch, NavigationComponent, searchPage}) => {

  const onVersionChange = version => {
    if(searchPage) {
      fetch(group, version, true);
    } else {
      history.push(`${path}${version}${group && group !== "public"?("?group=" + group ):""}`);
    }
  };

  const tags = getTags(header);

  return (
    <div className="kgs-instance__header">
      <NavigationComponent />
      <div className="kgs-instance__header_fields">
        <Tags tags={tags} />
        <div className="kgs-instance__header_title">
          <Field {...header.title} />
          <VersionSelector version={header.version} versions={header.versions} onChange={onVersionChange} />
        </div>
        <FieldsPanel fields={header.fields} fieldComponent={Field} />
      </div>
    </div>
  );
};