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
import React, { useState, useEffect } from "react";
import { Field } from "../Field/Field";
import { FieldsPanel } from "../Field/FieldsPanel";
import { FieldsButtons } from "../Field/FieldsButtons";
import { ImagePreviews } from "../../containers/Image/ImagePreviews";
import "./Tabs.css";
import "./Overview.css";

const Tab = ({group, active, onClick}) => {

  const handleClick = () => onClick(group);

  const className = `kgs-tabs-button ${active?"is-active":""}`;
  return (
    <button type="button" className={className} onClick={handleClick}>{group.name?group.name:""}</button>
  );
};


export const TabsView = ({group}) => {
  if (!group || !Array.isArray(group.fields)) {
    return null;
  }

  if (group.name === "Overview") {

    const buttons = group.fields.filter(f => f.mapping.isButton);
    const previews = group.previews;
    const mainFields = group.fields.filter(f => !f.mapping.isButton);
    const summaryFields = group.fields.filter(f => !f.mapping.isButton && f.mapping.layout === "summary");

    return (
      <div className={`kgs-tabs-view kgs-overview kgs-overview__grid ${(buttons && buttons.length) ? "kgs-overview__with-buttons" : ""} ${(previews && previews.length) ? "kgs-overview__with-previews" : ""}`}>
        <FieldsButtons className="kgs-overview__buttons" fields={buttons} />
        <div className="kgs-overview__highlights">
          <ImagePreviews className={`kgs-overview__previews ${(previews && previews.length > 1) ? "has-many" : ""}`} width="300px" images={previews} />
          <FieldsPanel className="kgs-overview__summary" fields={summaryFields} fieldComponent={Field} />
        </div>
        <FieldsPanel className="kgs-overview__main" fields={mainFields} fieldComponent={Field} />
      </div>
    );
  }

  return (
    <FieldsPanel className="kgs-tabs-view" fields={group.fields} fieldComponent={Field} />
  );
};

export const Tabs = ({instanceId, groups }) => {
  const [group, setGroup] = useState();

  useEffect(() => {
    setGroup(Array.isArray(groups) && groups.length && groups[0]);
  }, [instanceId]);

  const handleClick = g => setGroup(g);

  if (!Array.isArray(groups) || !groups.length) {
    return null;
  }

  return (
    <div className="kgs-tabs">
      <div className="kgs-tabs-panel">
        <div className="kgs-tabs-buttons">
          {groups.map(g => (
            <Tab key={g.name} group={g} active={group && g.name === group.name} onClick={handleClick} />
          ))}
        </div>
        <div className="kgs-tabs-info">
          <strong className="kgs-tabs-disclaimer">Disclaimer:
          Please alert us at <a href="mailto:curation-support@ebrains.eu">curation-support@ebrains.eu</a> for errors or quality concerns regarding the dataset, so we can forward this information to the Data Custodian responsible.</strong>
        </div>
      </div>
      <div className="kgs-tabs-scroll">
        <div className="kgs-tabs-scoll-content">
          <TabsView group={group}/>
        </div>
      </div>
    </div>
  );
};

export default Tabs;