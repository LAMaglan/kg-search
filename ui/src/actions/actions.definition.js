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

import * as types from "./actions.types";
import API from "../services/API";
import { sessionFailure } from "./actions";
import * as Sentry from "@sentry/browser";


export const setAuthEndpoint = authEndpoint => {
  return {
    type: types.SET_AUTH_ENDPOINT,
    authEndpoint: authEndpoint
  };
};

export const setCommit = commit => {
  return {
    type: types.SET_COMMIT,
    commit: commit
  };
};

export const loadDefinitionRequest = () => {
  return {
    type: types.LOAD_DEFINITION_REQUEST
  };
};

export const loadDefinitionSuccess = definition => {
  return {
    type: types.LOAD_DEFINITION_SUCCESS,
    definition: definition
  };
};

export const loadDefinitionFailure = error => {
  return {
    type: types.LOAD_DEFINITION_FAILURE,
    error: error
  };
};

export const clearDefinitionError = () => {
  return {
    type: types.CLEAR_DEFINITION_ERROR
  };
};

export const loadDefinition = () => {

  const GRAPHQUERY_NAMESPACE = "https://schema.hbp.eu/graphQuery/";
  const SEARCHUI_NAMESPACE = "https://schema.hbp.eu/searchUi/";
  const SCHEMA_ORG = "http://schema.org/";

  const getFieldAndRemove = (field, key, defaultValue) => {
    let valueFromField = field[key];
    if (valueFromField !== undefined && valueFromField !== null) {
      delete field[key];
      return valueFromField;
    }
    return defaultValue;
  };

  const simplifySemanticKeysForField = field => {
    field.value = getFieldAndRemove(field, GRAPHQUERY_NAMESPACE + "label", null);
    field.sort = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "sort", false);
    field.markdown = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "markdown", false);
    field.labelHidden = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "label_hidden", false);
    field.tagIcon = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "tag_icon", null);
    field.icon = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "icon", null);
    field.linkIcon = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "link_icon", null);
    field.visible = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "visible", true);
    field.isTable = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isTable", false);
    field.isHierarchicalFiles = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isHierarchicalFiles", false);
    field.isAsync = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isAsync", false);
    field.isButton = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isButton", false);
    field.isFilePreview = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isFilePreview", false);
    field.showIfEmpty = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "showIfEmpty", false);
    field.layout = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "layout", null);
    field.hint = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "hint", null);
    field.overviewMaxDisplay = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "overviewMaxDisplay", null);
    field.termsOfUse = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "termsOfUse", false);
    field.separator = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "separator", null);
    field.overview = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "overview", false);
    field.boost = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "boost", 1);
    field.order = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "order", null);
    field.facet = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "facet", null);
    field.isHierarchicalFacet = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isHierarchicalFacet", false);
    field.isFilterableFacet = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "isFilterableFacet", false);
    field.facetMissingTerm = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "facetMissingTerm", false);
    field.facetOrder = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "facet_order", "bycount");
    field.aggregate = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "aggregate", null);
    field.type = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "type", null);
    field.detail_label = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "detail_label", null);
    field.facetExclusiveSelection = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "facetExclusiveSelection", false);
    field.count = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "count", false);
    field.collapsible = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "collapsible", false);
    field.ignoreForSearch = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "ignoreForSearch", false);
    field.highlight = getFieldAndRemove(field, SEARCHUI_NAMESPACE + "highlight", false);
    if (field.children) {
      Object.values(field.children).forEach(childField => {
        simplifySemanticKeysForField(childField);
      });
    }
  };

  const simplifySemanticKeyForType = mapping => {
    if (mapping[SCHEMA_ORG + "name"]) {
      mapping.name = mapping[SCHEMA_ORG + "name"];
      delete mapping[SCHEMA_ORG + "name"];
    }
    if (mapping[SEARCHUI_NAMESPACE + "order"]) {
      mapping.order = mapping[SEARCHUI_NAMESPACE + "order"];
      delete mapping[SEARCHUI_NAMESPACE + "order"];
    }
    if (mapping[SEARCHUI_NAMESPACE + "ribbon"]) {
      const ribbon = mapping[SEARCHUI_NAMESPACE + "ribbon"];
      const framed = ribbon[SEARCHUI_NAMESPACE + "framed"];
      const suffix = framed[SEARCHUI_NAMESPACE + "suffix"];
      delete mapping[SEARCHUI_NAMESPACE + "ribbon"];
      const datafield = framed[SEARCHUI_NAMESPACE + "dataField"].split(":");
      mapping.ribbon = {
        framed: {
          dataField: datafield.length ? datafield[1]: null,
          aggregation: framed[SEARCHUI_NAMESPACE + "aggregation"],
          suffix: {
            singular: suffix[SEARCHUI_NAMESPACE + "singular"],
            plural: suffix[SEARCHUI_NAMESPACE + "plural"]
          }
        }
      };
    }
    if (mapping[SEARCHUI_NAMESPACE + "searchable"]) {
      mapping.searchable = mapping[SEARCHUI_NAMESPACE + "searchable"];
      delete mapping[SEARCHUI_NAMESPACE + "searchable"];
    }
    if (mapping[SEARCHUI_NAMESPACE + "defaultSelection"]) {
      mapping.defaultSelection = mapping[SEARCHUI_NAMESPACE + "defaultSelection"];
      delete mapping[SEARCHUI_NAMESPACE + "defaultSelection"];
    }
    if (mapping.fields) {
      Object.values(mapping.fields).forEach(field => {
        simplifySemanticKeysForField(field);
      });
    }
    if (mapping.children) {
      Object.values(mapping.children).forEach(field => {
        simplifySemanticKeysForField(field);
      });
    }
  };

  const simplifySemantics = types => {
    types instanceof Object && Object.values(types).forEach(mapping => simplifySemanticKeyForType(mapping));
  };

  const labels = {
    "authEndpoint": "https://iam.ebrains.eu/auth",
    "commit": "0bbc4d4e7c40dd887b091a0872129aa91255c1f1",
    "_source": {
      "SoftwareVersions": {
        "https://schema.hbp.eu/searchUi/order": 10,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "custodians": {
            "https://schema.hbp.eu/graphQuery/label": "Custodians",
            "https://schema.hbp.eu/searchUi/hint": "A custodian is the person responsible for the data bundle.",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "developers": {
            "https://schema.hbp.eu/graphQuery/label": "Developers",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "citation": {
            "https://schema.hbp.eu/graphQuery/label": "Cite software",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "quote-left",
            "https://schema.hbp.eu/searchUi/isButton": true
          },
          "doi": {
            "https://schema.hbp.eu/graphQuery/label": "DOI",
            "https://schema.hbp.eu/searchUi/hint": "This is the software DOI representing all the underlying software's versions you must cite if you reuse this data in a way that leads to a publication"
          },
          "softwareVersions": {
            "https://schema.hbp.eu/graphQuery/label": "Software versions",
            "https://schema.hbp.eu/searchUi/hint": "List of existing versions of this dataset.",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "children": {
              "version": {
                "https://schema.hbp.eu/graphQuery/label": "Version",
                "https://schema.hbp.eu/searchUi/groupby": true
              },
              "innovation": {
                "https://schema.hbp.eu/graphQuery/label": "Innovation",
                "https://schema.hbp.eu/searchUi/markdown": true
              }
            }
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "SoftwareVersions"
      },
      "FileRepository": {
        "https://schema.hbp.eu/searchUi/order": 11,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "IRI": {
            "https://schema.hbp.eu/graphQuery/label": "File repository",
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "datasetVersion": {
            "https://schema.hbp.eu/graphQuery/label": "Dataset"
          },
          "metaDataModelVersion": {
            "https://schema.hbp.eu/graphQuery/label": "(Meta) Data Model Version"
          },
          "modelVersion": {
            "https://schema.hbp.eu/graphQuery/label": "Model Version"
          },
          "softwareVersion": {
            "https://schema.hbp.eu/graphQuery/label": "Software Version"
          },
          "embargo": {
            "https://schema.hbp.eu/graphQuery/label": "Files"
          },
          "filesAsyncUrl": {
            "https://schema.hbp.eu/graphQuery/label": "Files",
            "https://schema.hbp.eu/searchUi/isHierarchicalFiles": true,
            "https://schema.hbp.eu/searchUi/isAsync": true
          },
          "useHDG": {
            "https://schema.hbp.eu/graphQuery/label": "Access Files",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "unlock",
            "https://schema.hbp.eu/searchUi/isButton": true,
            "https://schema.hbp.eu/searchUi/termsOfUse": true
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "FileRepository"
      },
      "ModelVersions": {
        "https://schema.hbp.eu/searchUi/order": 9,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "citation": {
            "https://schema.hbp.eu/graphQuery/label": "Cite model",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "quote-left",
            "https://schema.hbp.eu/searchUi/isButton": true
          },
          "doi": {
            "https://schema.hbp.eu/graphQuery/label": "DOI",
            "https://schema.hbp.eu/searchUi/hint": "This is the model DOI representing all the underlying model's versions you must cite if you reuse this data in a way that leads to a publication"
          },
          "homepage": {
            "https://schema.hbp.eu/graphQuery/label": "Homepage"
          },
          "studyTarget": {
            "https://schema.hbp.eu/graphQuery/label": "Study target",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "scope": {
            "https://schema.hbp.eu/graphQuery/label": "Scope",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "abstractionLevel": {
            "https://schema.hbp.eu/graphQuery/label": "Abstraction level",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "contributors": {
            "https://schema.hbp.eu/graphQuery/label": "Contributors",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "header",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "owners": {
            "https://schema.hbp.eu/graphQuery/label": "Custodian",
            "https://schema.hbp.eu/searchUi/hint": "A custodian is the person responsible for the data bundle.",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "versions": {
            "https://schema.hbp.eu/graphQuery/label": "Versions"
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "ModelVersions"
      },
      "Dataset": {
        "https://schema.hbp.eu/searchUi/order": 3,
        "https://schema.hbp.eu/searchUi/defaultSelection": true,
        "https://schema.hbp.eu/searchUi/searchable": true,
        "https://schema.hbp.eu/searchUi/ribbon": {
          "https://schema.hbp.eu/searchUi/icon": "download",
          "https://schema.hbp.eu/searchUi/framed": {
            "https://schema.hbp.eu/searchUi/aggregation": "count",
            "https://schema.hbp.eu/searchUi/dataField": "search:files",
            "https://schema.hbp.eu/searchUi/suffix": {
              "https://schema.hbp.eu/searchUi/singular": "file",
              "https://schema.hbp.eu/searchUi/plural": "files"
            }
          },
          "https://schema.hbp.eu/searchUi/content": "Downloadable Data"
        },
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/layout": "header",
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "contributors": {
            "https://schema.hbp.eu/graphQuery/label": "Contributors",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "header",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "zip": {
            "https://schema.hbp.eu/graphQuery/label": "Download Dataset",
            "https://schema.hbp.eu/searchUi/layout": "Get data",
            "https://schema.hbp.eu/searchUi/icon": "download",
            "https://schema.hbp.eu/searchUi/isButton": true,
            "https://schema.hbp.eu/searchUi/termsOfUse": true
          },
          "fileRepository": {
            "https://schema.hbp.eu/graphQuery/label": "Get data",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "download",
            "https://schema.hbp.eu/searchUi/isButton": true
          },
          "citation": {
            "https://schema.hbp.eu/graphQuery/label": "Cite dataset",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "quote-left",
            "https://schema.hbp.eu/searchUi/isButton": true
          },
          "dataDescriptor": {
            "https://schema.hbp.eu/graphQuery/label": "Data-descriptor",
            "https://schema.hbp.eu/searchUi/layout": "Data descriptor",
            "https://schema.hbp.eu/searchUi/icon": "sticky-note",
            // "https://schema.hbp.eu/searchUi/isButton": true,
            "https://schema.hbp.eu/searchUi/isDirectDownload": true,
            "https://schema.hbp.eu/searchUi/isFilePreview": true,
            "https://schema.hbp.eu/searchUi/label_hidden": true
          },
          "doi": {
            "https://schema.hbp.eu/graphQuery/label": "DOI",
            "https://schema.hbp.eu/searchUi/hint": "This is the dataset DOI you must cite if you reuse this data in a way that leads to a publication"
          },
          "useHDG": {
            "https://schema.hbp.eu/graphQuery/label": "Access Dataset",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "unlock",
            "https://schema.hbp.eu/searchUi/isButton": true,
            "https://schema.hbp.eu/searchUi/termsOfUse": true
          },
          "license_info": {
            "https://schema.hbp.eu/graphQuery/label": "License",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet_order": "byvalue"
          },
          "projects": {
            "https://schema.hbp.eu/graphQuery/label": "Project",
            "https://schema.hbp.eu/searchUi/boost": 10,
            "https://schema.hbp.eu/searchUi/order": 3
          },
          "custodians": {
            "https://schema.hbp.eu/graphQuery/label": "Custodians",
            "https://schema.hbp.eu/searchUi/hint": "A custodian is the person responsible for the data bundle.",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "newInThisVersion": {
            "https://schema.hbp.eu/graphQuery/label": "New in this version",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "speciesFilter": {
            "https://schema.hbp.eu/graphQuery/label": "Species",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "embargoRestrictedAccess": {
            "https://schema.hbp.eu/graphQuery/label": "Restricted access",
            "https://schema.hbp.eu/searchUi/layout": "Get date"
          },
          "dataAccessibility": {
            "https://schema.hbp.eu/graphQuery/label": "Data accessibility",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "embargo": {
            "https://schema.hbp.eu/graphQuery/label": "Files",
            "https://schema.hbp.eu/searchUi/layout": "Get data",
            "https://schema.hbp.eu/searchUi/label_hidden": true
          },
          "filesOld": {
            "https://schema.hbp.eu/graphQuery/label": "Files",
            "https://schema.hbp.eu/searchUi/layout": "Get data",
            "https://schema.hbp.eu/searchUi/isHierarchicalFiles": true,
            "https://schema.hbp.eu/searchUi/termsOfUse": true,
            "https://schema.hbp.eu/searchUi/label_hidden": true
          },
          "filesAsyncUrl": {
            "https://schema.hbp.eu/graphQuery/label": "Files",
            "https://schema.hbp.eu/searchUi/layout": "Get data",
            "https://schema.hbp.eu/searchUi/isHierarchicalFiles": true,
            "https://schema.hbp.eu/searchUi/isAsync": true,
            "https://schema.hbp.eu/searchUi/label_hidden": true
          },
          "external_datalink": {
            "https://schema.hbp.eu/graphQuery/label": "Data download",
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "publications": {
            "https://schema.hbp.eu/graphQuery/label": "Related publications",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/layout": "Publications",
            "https://schema.hbp.eu/searchUi/label_hidden": true
          },
          "atlas": {
            "https://schema.hbp.eu/graphQuery/label": "Brain atlas",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "region": {
            "https://schema.hbp.eu/graphQuery/label": "Brain region",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/link_icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\">\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M13.37 33.67a5 5 0 0 1-1.69-.29 4.68 4.68 0 0 1-1.41-.9 4.86 4.86 0 0 0-.94-.66 10.15 10.15 0 0 0-1.07-.42 6.25 6.25 0 0 1-2.05-1 2.33 2.33 0 0 1-.73-2.54 3 3 0 0 0 0-1.29 2.68 2.68 0 0 0-.86-1.13 4.26 4.26 0 0 1-1-1.19 3.88 3.88 0 0 1-.25-2 6.81 6.81 0 0 0 0-.86A4.44 4.44 0 0 0 3 19.91c-.1-.24-.21-.49-.3-.75-.58-1.69-.05-3.45.59-5.26.56-1.58 1.17-3.05 2.54-3.84l.26-.14a1.79 1.79 0 0 0 .53-.36 1.71 1.71 0 0 0 .27-.64C7.32 7.4 8.11 5.35 10 5.27a4.13 4.13 0 0 1 .46 0 1.69 1.69 0 0 0 .55 0 1.71 1.71 0 0 0 .59-.41l.23-.21c.37-.31 2.27-1.81 3.83-1.62a1.81 1.81 0 0 1 1.28.75 2.46 2.46 0 0 1 .29.52 7.37 7.37 0 0 1 .22 3.54c0 .4-.08.79-.09 1.17L17.23 11c0 1.12-.09 2.23-.12 3.35A102.75 102.75 0 0 0 17.22 25c0 .39.08.83.14 1.28.3 2.45.7 5.81-2.17 7a4.79 4.79 0 0 1-1.82.39zm-3.3-27.52H10c-1 0-1.69 1-2.26 3a2.49 2.49 0 0 1-.45 1 2.49 2.49 0 0 1-.8.57l-.23.12c-1.1.63-1.64 2-2.14 3.37-.59 1.65-1.07 3.26-.59 4.67.08.24.18.46.27.69a5.18 5.18 0 0 1 .5 1.71 7.58 7.58 0 0 1 0 1 3.18 3.18 0 0 0 .16 1.59 3.56 3.56 0 0 0 .8.94 3.36 3.36 0 0 1 1.11 1.55 3.76 3.76 0 0 1 0 1.66c-.12.72-.2 1.19.43 1.72a5.51 5.51 0 0 0 1.77.86 10.82 10.82 0 0 1 1.14.4 5.59 5.59 0 0 1 1.11.77 4 4 0 0 0 1.15.75 4.11 4.11 0 0 0 2.88 0c2.25-.93 1.92-3.67 1.63-6.08-.06-.47-.11-.92-.14-1.32a103.52 103.52 0 0 1-.11-10.83c0-1.12.08-2.23.12-3.35L16.42 9c0-.4.06-.82.1-1.22a6.73 6.73 0 0 0-.16-3.12 1.6 1.6 0 0 0-.18-.34.93.93 0 0 0-.68-.4 5.19 5.19 0 0 0-3.15 1.43l-.21.18a2.41 2.41 0 0 1-.93.6 2.39 2.39 0 0 1-.86 0z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M12.85 11.92a.44.44 0 0 1-.2 0 3.59 3.59 0 0 1-2.13-2.81 6 6 0 0 1 0-.83v-.61a3.36 3.36 0 0 0-1-1.34.44.44 0 0 1 .48-.77 3.84 3.84 0 0 1 1.38 2v.7a5.25 5.25 0 0 0 0 .71A2.73 2.73 0 0 0 13 11.08a.44.44 0 0 1-.2.84zm-3.33 6.17a4.38 4.38 0 0 1-3.77-2.47c-.11-.21-.21-.43-.31-.65a6.21 6.21 0 0 0-.46-.9c-.21-.32-.55-.61-.82-.54a.44.44 0 1 1-.23-.85 1.69 1.69 0 0 1 1.79.9 7 7 0 0 1 .53 1c.09.2.18.41.28.6a3.28 3.28 0 0 0 3.82 1.86.44.44 0 1 1 .28.84 3.49 3.49 0 0 1-1.11.21zm-5.61 4.28a.44.44 0 0 1-.09-.87 3.47 3.47 0 0 0 .63-.89c.49-.84 1.1-1.88 2.12-2a2.5 2.5 0 0 1 2 .95.44.44 0 0 1-.62.62c-.51-.51-.94-.74-1.3-.69-.58.07-1.07.91-1.47 1.58S4.49 22.26 4 22.36zm-.1-.87zm12.43 10.7a.43.43 0 0 1-.37-.21 4 4 0 0 1-.33-1.48c-.1-1-.22-2.08-1-2.51a9.43 9.43 0 0 0-1-.43 6.51 6.51 0 0 1-1.54-.81 3 3 0 0 1-1.05-2 5.53 5.53 0 0 0-.22-.81.43.43 0 0 1 .8-.3 6.28 6.28 0 0 1 .25.93 2.2 2.2 0 0 0 .74 1.49 5.77 5.77 0 0 0 1.36.69 10.33 10.33 0 0 1 1 .47c1.18.64 1.34 2.1 1.45 3.17a3.83 3.83 0 0 0 .22 1.14.43.43 0 0 1-.37.64zm-8.66-3.79c-.33 0-.66 0-1-.06s-.48 0-.68 0a.44.44 0 0 1 0-.88c.23 0 .49 0 .76.05.76.07 1.62.16 2-.32a.44.44 0 0 1 .68.56 2.19 2.19 0 0 1-1.76.65zm3.54-12.48a1.86 1.86 0 0 1-.66-.12.44.44 0 0 1 .31-.83c.65.25 1.41-.32 1.63-.5s.37-.33.55-.5a5.85 5.85 0 0 1 1.25-1 3.22 3.22 0 0 1 2.36-.26.44.44 0 1 1-.24.85 2.33 2.33 0 0 0-1.71.19 5.11 5.11 0 0 0-1.05.85c-.19.19-.39.37-.6.54a3 3 0 0 1-1.84.78zm2.09-6.8a.47.47 0 0 1-.21-.87 12.15 12.15 0 0 0 2.31-1.71 2.89 2.89 0 0 0 .93-2.1.47.47 0 0 1 .94-.09A3.7 3.7 0 0 1 16 7.2a12.85 12.85 0 0 1-2.49 1.86.47.47 0 0 1-.3.07zm-1.79 12.49h-.26a.44.44 0 1 1 0-.88 3.24 3.24 0 0 0 2.5-.65 3.72 3.72 0 0 0 .51-1c.35-.87.84-2.05 2.28-1.81a.44.44 0 0 1-.15.87c-.67-.11-.91.28-1.31 1.27a4.35 4.35 0 0 1-.67 1.24 3.68 3.68 0 0 1-2.9.96zM8 14.23a.44.44 0 0 1-.34-.23 1.05 1.05 0 0 1-.11-.91 1.29 1.29 0 0 1 .84-.72l.3-.1a1.74 1.74 0 0 0 .5-.2.26.26 0 0 0 .12-.19.41.41 0 0 0-.11-.31.44.44 0 1 1 .66-.57 1.29 1.29 0 0 1 .33 1 1.15 1.15 0 0 1-.48.81 2.46 2.46 0 0 1-.76.33l-.25.08c-.22.08-.31.16-.32.2a.28.28 0 0 0 .05.17.44.44 0 0 1-.38.66zm0 11.72h-.15a.44.44 0 0 1-.26-.57 4.2 4.2 0 0 0 .16-1.28A3.85 3.85 0 0 1 8 22.28a.44.44 0 1 1 .77.43 3.2 3.2 0 0 0-.22 1.39 4.89 4.89 0 0 1-.21 1.56.44.44 0 0 1-.34.29z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M20.51 33.67a4.79 4.79 0 0 1-1.82-.35c-2.87-1.19-2.46-4.55-2.17-7 .06-.46.11-.89.14-1.28a102.83 102.83 0 0 0 .11-10.73c0-1.12-.08-2.23-.12-3.35L16.57 9c0-.38-.05-.77-.09-1.17a7.37 7.37 0 0 1 .22-3.54 2.47 2.47 0 0 1 .3-.51A1.81 1.81 0 0 1 18.26 3c1.55-.2 3.46 1.32 3.83 1.62l.23.21a1.7 1.7 0 0 0 .58.41 1.69 1.69 0 0 0 .55 0 3.93 3.93 0 0 1 .46 0c1.85.08 2.64 2.13 3.07 3.66a1.71 1.71 0 0 0 .27.64 1.79 1.79 0 0 0 .53.36l.26.14c1.36.78 2 2.26 2.54 3.84.64 1.81 1.17 3.57.59 5.26-.09.26-.19.5-.3.75a4.43 4.43 0 0 0-.43 1.42 6.75 6.75 0 0 0 0 .86 3.89 3.89 0 0 1-.25 2 4.26 4.26 0 0 1-1 1.19 2.67 2.67 0 0 0-.86 1.13 3 3 0 0 0 0 1.29 2.33 2.33 0 0 1-.73 2.54 6.24 6.24 0 0 1-2.05 1 10.12 10.12 0 0 0-1.07.42 4.86 4.86 0 0 0-.94.66 4.68 4.68 0 0 1-1.41.9 5 5 0 0 1-1.62.37zM17.69 4.3a1.6 1.6 0 0 0-.18.34 6.74 6.74 0 0 0-.16 3.12c0 .4.08.82.1 1.22l.07 1.95c0 1.12.09 2.23.12 3.35a103.53 103.53 0 0 1-.11 10.83c0 .41-.08.85-.14 1.32-.29 2.41-.62 5.14 1.63 6.08a4.11 4.11 0 0 0 2.88 0 4 4 0 0 0 1.1-.71 5.59 5.59 0 0 1 1.16-.8 10.91 10.91 0 0 1 1.17-.46 5.51 5.51 0 0 0 1.77-.86c.63-.53.55-1 .43-1.72a3.77 3.77 0 0 1 0-1.66 3.36 3.36 0 0 1 1.11-1.55 3.56 3.56 0 0 0 .8-.94 3.18 3.18 0 0 0 .16-1.59 7.63 7.63 0 0 1 0-1 5.18 5.18 0 0 1 .5-1.71c.1-.22.19-.45.27-.69.49-1.42 0-3-.59-4.67-.5-1.41-1-2.73-2.14-3.37l-.23-.12a2.49 2.49 0 0 1-.8-.57 2.49 2.49 0 0 1-.45-1c-.57-2-1.29-3-2.26-3h-.36a2.39 2.39 0 0 1-.86 0 2.4 2.4 0 0 1-.93-.6l-.21-.18a5.19 5.19 0 0 0-3.17-1.41.93.93 0 0 0-.68.4z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M21 11.92a.44.44 0 0 1-.2-.84A2.73 2.73 0 0 0 22.46 9a5.24 5.24 0 0 0 0-.71v-.7a3.84 3.84 0 0 1 1.38-2 .44.44 0 0 1 .52.72 3.36 3.36 0 0 0-1 1.34v.61a6 6 0 0 1 0 .83 3.59 3.59 0 0 1-2.13 2.81.44.44 0 0 1-.23.02zm3.35 6.17a3.49 3.49 0 0 1-1.12-.18.44.44 0 0 1 .28-.84 3.28 3.28 0 0 0 3.82-1.86c.1-.19.19-.4.28-.6a7 7 0 0 1 .53-1 1.69 1.69 0 0 1 1.79-.9.44.44 0 1 1-.23.85c-.27-.07-.61.21-.82.54a6.25 6.25 0 0 0-.46.91c-.1.22-.2.44-.31.65a4.38 4.38 0 0 1-3.76 2.43zM30 22.37h-.09c-.5-.1-.82-.63-1.21-1.31s-.88-1.5-1.47-1.58c-.36 0-.8.19-1.3.69a.44.44 0 0 1-.62-.62 2.5 2.5 0 0 1 2-.95c1 .13 1.62 1.17 2.12 2a3.39 3.39 0 0 0 .63.89.44.44 0 0 1 .34.52.44.44 0 0 1-.4.36zM17.64 32.2a.43.43 0 0 1-.37-.64 3.83 3.83 0 0 0 .22-1.14c.11-1.07.27-2.54 1.45-3.17a10.29 10.29 0 0 1 1-.47 5.78 5.78 0 0 0 1.36-.69 2.2 2.2 0 0 0 .74-1.49 6.27 6.27 0 0 1 .25-.93.43.43 0 0 1 .8.3 5.56 5.56 0 0 0-.22.81 3 3 0 0 1-1.06 2 6.51 6.51 0 0 1-1.56.81 9.45 9.45 0 0 0-1 .43c-.79.42-.9 1.53-1 2.51A4 4 0 0 1 18 32a.43.43 0 0 1-.36.2zm8.65-3.79a2.19 2.19 0 0 1-1.81-.7.44.44 0 0 1 .68-.56c.39.48 1.25.39 2 .32.27 0 .53-.05.76-.05a.44.44 0 0 1 0 .88h-.68c-.24 0-.62.11-.95.11zm-3.54-12.48a3 3 0 0 1-1.85-.76c-.21-.17-.4-.36-.6-.54a5.11 5.11 0 0 0-1.05-.84 2.32 2.32 0 0 0-1.71-.19.44.44 0 1 1-.24-.85 3.21 3.21 0 0 1 2.36.26 5.85 5.85 0 0 1 1.24 1c.18.17.36.34.55.5s1 .74 1.63.5a.44.44 0 1 1 .31.83 1.85 1.85 0 0 1-.64.09zm-2.09-6.8a.47.47 0 0 1-.25-.07 12.85 12.85 0 0 1-2.49-1.86 3.7 3.7 0 0 1-1.19-2.84.47.47 0 0 1 .51-.43.47.47 0 0 1 .43.51 2.89 2.89 0 0 0 .93 2.1 12.15 12.15 0 0 0 2.31 1.71.47.47 0 0 1-.25.87zm1.8 12.49a3.68 3.68 0 0 1-2.91-.95 4.34 4.34 0 0 1-.67-1.24c-.41-1-.64-1.39-1.31-1.27a.44.44 0 1 1-.15-.87c1.44-.24 1.92.94 2.28 1.81a3.7 3.7 0 0 0 .51 1 3.24 3.24 0 0 0 2.5.65.44.44 0 0 1 0 .88zm3.36-7.39a.44.44 0 0 1-.38-.66.28.28 0 0 0 .05-.17s-.09-.12-.32-.2l-.25-.08a2.46 2.46 0 0 1-.76-.33 1.15 1.15 0 0 1-.48-.81A1.29 1.29 0 0 1 24 11a.44.44 0 1 1 .66.59.41.41 0 0 0-.11.31.26.26 0 0 0 .12.19 1.75 1.75 0 0 0 .5.2l.3.1a1.3 1.3 0 0 1 .84.72 1.05 1.05 0 0 1-.11.91.44.44 0 0 1-.38.21zm.09 11.72a.44.44 0 0 1-.41-.29 4.89 4.89 0 0 1-.21-1.56 3.19 3.19 0 0 0-.22-1.39.44.44 0 1 1 .77-.43 3.84 3.84 0 0 1 .33 1.79 4.2 4.2 0 0 0 .16 1.28.44.44 0 0 1-.26.57z\"/>\n    <path d=\"M13.37 33.67a5 5 0 0 1-1.69-.29 4.68 4.68 0 0 1-1.41-.9 4.86 4.86 0 0 0-.94-.66 10.15 10.15 0 0 0-1.07-.42 6.25 6.25 0 0 1-2.05-1 2.33 2.33 0 0 1-.73-2.54 3 3 0 0 0 0-1.29 2.68 2.68 0 0 0-.86-1.13 4.26 4.26 0 0 1-1-1.19 3.88 3.88 0 0 1-.25-2 6.81 6.81 0 0 0 0-.86A4.44 4.44 0 0 0 3 19.91c-.1-.24-.21-.49-.3-.75-.58-1.69-.05-3.45.59-5.26.56-1.58 1.17-3.05 2.54-3.84l.26-.14a1.79 1.79 0 0 0 .53-.36 1.71 1.71 0 0 0 .27-.64C7.32 7.4 8.11 5.35 10 5.27a4.13 4.13 0 0 1 .46 0 1.69 1.69 0 0 0 .55 0 1.71 1.71 0 0 0 .59-.41l.23-.21c.37-.31 2.27-1.81 3.83-1.62a1.81 1.81 0 0 1 1.28.75 2.46 2.46 0 0 1 .29.52 7.37 7.37 0 0 1 .22 3.54c0 .4-.08.79-.09 1.17L17.23 11c0 1.12-.09 2.23-.12 3.35A102.75 102.75 0 0 0 17.22 25c0 .39.08.83.14 1.28.3 2.45.7 5.81-2.17 7a4.79 4.79 0 0 1-1.82.39zm-3.3-27.52H10c-1 0-1.69 1-2.26 3a2.49 2.49 0 0 1-.45 1 2.49 2.49 0 0 1-.8.57l-.23.12c-1.1.63-1.64 2-2.14 3.37-.59 1.65-1.07 3.26-.59 4.67.08.24.18.46.27.69a5.18 5.18 0 0 1 .5 1.71 7.58 7.58 0 0 1 0 1 3.18 3.18 0 0 0 .16 1.59 3.56 3.56 0 0 0 .8.94 3.36 3.36 0 0 1 1.11 1.55 3.76 3.76 0 0 1 0 1.66c-.12.72-.2 1.19.43 1.72a5.51 5.51 0 0 0 1.77.86 10.82 10.82 0 0 1 1.14.4 5.59 5.59 0 0 1 1.11.77 4 4 0 0 0 1.15.75 4.11 4.11 0 0 0 2.88 0c2.25-.93 1.92-3.67 1.63-6.08-.06-.47-.11-.92-.14-1.32a103.52 103.52 0 0 1-.11-10.83c0-1.12.08-2.23.12-3.35L16.42 9c0-.4.06-.82.1-1.22a6.73 6.73 0 0 0-.16-3.12 1.6 1.6 0 0 0-.18-.34.93.93 0 0 0-.68-.4 5.19 5.19 0 0 0-3.15 1.43l-.21.18a2.41 2.41 0 0 1-.93.6 2.39 2.39 0 0 1-.86 0z\"/>\n    <path d=\"M12.85 11.92a.44.44 0 0 1-.2 0 3.59 3.59 0 0 1-2.13-2.81 6 6 0 0 1 0-.83v-.61a3.36 3.36 0 0 0-1-1.34.44.44 0 0 1 .48-.77 3.84 3.84 0 0 1 1.38 2v.7a5.25 5.25 0 0 0 0 .71A2.73 2.73 0 0 0 13 11.08a.44.44 0 0 1-.2.84zm-3.33 6.17a4.38 4.38 0 0 1-3.77-2.47c-.11-.21-.21-.43-.31-.65a6.21 6.21 0 0 0-.46-.9c-.21-.32-.55-.61-.82-.54a.44.44 0 1 1-.23-.85 1.69 1.69 0 0 1 1.79.9 7 7 0 0 1 .53 1c.09.2.18.41.28.6a3.28 3.28 0 0 0 3.82 1.86.44.44 0 1 1 .28.84 3.49 3.49 0 0 1-1.11.21zm-5.61 4.28a.44.44 0 0 1-.09-.87 3.47 3.47 0 0 0 .63-.89c.49-.84 1.1-1.88 2.12-2a2.5 2.5 0 0 1 2 .95.44.44 0 0 1-.62.62c-.51-.51-.94-.74-1.3-.69-.58.07-1.07.91-1.47 1.58S4.49 22.26 4 22.36zm-.1-.87zm12.43 10.7a.43.43 0 0 1-.37-.21 4 4 0 0 1-.33-1.48c-.1-1-.22-2.08-1-2.51a9.43 9.43 0 0 0-1-.43 6.51 6.51 0 0 1-1.54-.81 3 3 0 0 1-1.05-2 5.53 5.53 0 0 0-.22-.81.43.43 0 0 1 .8-.3 6.28 6.28 0 0 1 .25.93 2.2 2.2 0 0 0 .74 1.49 5.77 5.77 0 0 0 1.36.69 10.33 10.33 0 0 1 1 .47c1.18.64 1.34 2.1 1.45 3.17a3.83 3.83 0 0 0 .22 1.14.43.43 0 0 1-.37.64zm-8.66-3.79c-.33 0-.66 0-1-.06s-.48 0-.68 0a.44.44 0 0 1 0-.88c.23 0 .49 0 .76.05.76.07 1.62.16 2-.32a.44.44 0 0 1 .68.56 2.19 2.19 0 0 1-1.76.65zm3.54-12.48a1.86 1.86 0 0 1-.66-.12.44.44 0 0 1 .31-.83c.65.25 1.41-.32 1.63-.5s.37-.33.55-.5a5.85 5.85 0 0 1 1.25-1 3.22 3.22 0 0 1 2.36-.26.44.44 0 1 1-.24.85 2.33 2.33 0 0 0-1.71.19 5.11 5.11 0 0 0-1.05.85c-.19.19-.39.37-.6.54a3 3 0 0 1-1.84.78zm2.09-6.8a.47.47 0 0 1-.21-.87 12.15 12.15 0 0 0 2.31-1.71 2.89 2.89 0 0 0 .93-2.1.47.47 0 0 1 .94-.09A3.7 3.7 0 0 1 16 7.2a12.85 12.85 0 0 1-2.49 1.86.47.47 0 0 1-.3.07zm-1.79 12.49h-.26a.44.44 0 1 1 0-.88 3.24 3.24 0 0 0 2.5-.65 3.72 3.72 0 0 0 .51-1c.35-.87.84-2.05 2.28-1.81a.44.44 0 0 1-.15.87c-.67-.11-.91.28-1.31 1.27a4.35 4.35 0 0 1-.67 1.24 3.68 3.68 0 0 1-2.9.96zM8 14.23a.44.44 0 0 1-.34-.23 1.05 1.05 0 0 1-.11-.91 1.29 1.29 0 0 1 .84-.72l.3-.1a1.74 1.74 0 0 0 .5-.2.26.26 0 0 0 .12-.19.41.41 0 0 0-.11-.31.44.44 0 1 1 .66-.57 1.29 1.29 0 0 1 .33 1 1.15 1.15 0 0 1-.48.81 2.46 2.46 0 0 1-.76.33l-.25.08c-.22.08-.31.16-.32.2a.28.28 0 0 0 .05.17.44.44 0 0 1-.38.66zm0 11.72h-.15a.44.44 0 0 1-.26-.57 4.2 4.2 0 0 0 .16-1.28A3.85 3.85 0 0 1 8 22.28a.44.44 0 1 1 .77.43 3.2 3.2 0 0 0-.22 1.39 4.89 4.89 0 0 1-.21 1.56.44.44 0 0 1-.34.29z\"/>\n    <path d=\"M20.51 33.67a4.79 4.79 0 0 1-1.82-.35c-2.87-1.19-2.46-4.55-2.17-7 .06-.46.11-.89.14-1.28a102.83 102.83 0 0 0 .11-10.73c0-1.12-.08-2.23-.12-3.35L16.57 9c0-.38-.05-.77-.09-1.17a7.37 7.37 0 0 1 .22-3.54 2.47 2.47 0 0 1 .3-.51A1.81 1.81 0 0 1 18.26 3c1.55-.2 3.46 1.32 3.83 1.62l.23.21a1.7 1.7 0 0 0 .58.41 1.69 1.69 0 0 0 .55 0 3.93 3.93 0 0 1 .46 0c1.85.08 2.64 2.13 3.07 3.66a1.71 1.71 0 0 0 .27.64 1.79 1.79 0 0 0 .53.36l.26.14c1.36.78 2 2.26 2.54 3.84.64 1.81 1.17 3.57.59 5.26-.09.26-.19.5-.3.75a4.43 4.43 0 0 0-.43 1.42 6.75 6.75 0 0 0 0 .86 3.89 3.89 0 0 1-.25 2 4.26 4.26 0 0 1-1 1.19 2.67 2.67 0 0 0-.86 1.13 3 3 0 0 0 0 1.29 2.33 2.33 0 0 1-.73 2.54 6.24 6.24 0 0 1-2.05 1 10.12 10.12 0 0 0-1.07.42 4.86 4.86 0 0 0-.94.66 4.68 4.68 0 0 1-1.41.9 5 5 0 0 1-1.62.37zM17.69 4.3a1.6 1.6 0 0 0-.18.34 6.74 6.74 0 0 0-.16 3.12c0 .4.08.82.1 1.22l.07 1.95c0 1.12.09 2.23.12 3.35a103.53 103.53 0 0 1-.11 10.83c0 .41-.08.85-.14 1.32-.29 2.41-.62 5.14 1.63 6.08a4.11 4.11 0 0 0 2.88 0 4 4 0 0 0 1.1-.71 5.59 5.59 0 0 1 1.16-.8 10.91 10.91 0 0 1 1.17-.46 5.51 5.51 0 0 0 1.77-.86c.63-.53.55-1 .43-1.72a3.77 3.77 0 0 1 0-1.66 3.36 3.36 0 0 1 1.11-1.55 3.56 3.56 0 0 0 .8-.94 3.18 3.18 0 0 0 .16-1.59 7.63 7.63 0 0 1 0-1 5.18 5.18 0 0 1 .5-1.71c.1-.22.19-.45.27-.69.49-1.42 0-3-.59-4.67-.5-1.41-1-2.73-2.14-3.37l-.23-.12a2.49 2.49 0 0 1-.8-.57 2.49 2.49 0 0 1-.45-1c-.57-2-1.29-3-2.26-3h-.36a2.39 2.39 0 0 1-.86 0 2.4 2.4 0 0 1-.93-.6l-.21-.18a5.19 5.19 0 0 0-3.17-1.41.93.93 0 0 0-.68.4z\"/>\n    <path d=\"M21 11.92a.44.44 0 0 1-.2-.84A2.73 2.73 0 0 0 22.46 9a5.24 5.24 0 0 0 0-.71v-.7a3.84 3.84 0 0 1 1.38-2 .44.44 0 0 1 .52.72 3.36 3.36 0 0 0-1 1.34v.61a6 6 0 0 1 0 .83 3.59 3.59 0 0 1-2.13 2.81.44.44 0 0 1-.23.02zm3.35 6.17a3.49 3.49 0 0 1-1.12-.18.44.44 0 0 1 .28-.84 3.28 3.28 0 0 0 3.82-1.86c.1-.19.19-.4.28-.6a7 7 0 0 1 .53-1 1.69 1.69 0 0 1 1.79-.9.44.44 0 1 1-.23.85c-.27-.07-.61.21-.82.54a6.25 6.25 0 0 0-.46.91c-.1.22-.2.44-.31.65a4.38 4.38 0 0 1-3.76 2.43zM30 22.37h-.09c-.5-.1-.82-.63-1.21-1.31s-.88-1.5-1.47-1.58c-.36 0-.8.19-1.3.69a.44.44 0 0 1-.62-.62 2.5 2.5 0 0 1 2-.95c1 .13 1.62 1.17 2.12 2a3.39 3.39 0 0 0 .63.89.44.44 0 0 1 .34.52.44.44 0 0 1-.4.36zM17.64 32.2a.43.43 0 0 1-.37-.64 3.83 3.83 0 0 0 .22-1.14c.11-1.07.27-2.54 1.45-3.17a10.29 10.29 0 0 1 1-.47 5.78 5.78 0 0 0 1.36-.69 2.2 2.2 0 0 0 .74-1.49 6.27 6.27 0 0 1 .25-.93.43.43 0 0 1 .8.3 5.56 5.56 0 0 0-.22.81 3 3 0 0 1-1.06 2 6.51 6.51 0 0 1-1.56.81 9.45 9.45 0 0 0-1 .43c-.79.42-.9 1.53-1 2.51A4 4 0 0 1 18 32a.43.43 0 0 1-.36.2zm8.65-3.79a2.19 2.19 0 0 1-1.81-.7.44.44 0 0 1 .68-.56c.39.48 1.25.39 2 .32.27 0 .53-.05.76-.05a.44.44 0 0 1 0 .88h-.68c-.24 0-.62.11-.95.11zm-3.54-12.48a3 3 0 0 1-1.85-.76c-.21-.17-.4-.36-.6-.54a5.11 5.11 0 0 0-1.05-.84 2.32 2.32 0 0 0-1.71-.19.44.44 0 1 1-.24-.85 3.21 3.21 0 0 1 2.36.26 5.85 5.85 0 0 1 1.24 1c.18.17.36.34.55.5s1 .74 1.63.5a.44.44 0 1 1 .31.83 1.85 1.85 0 0 1-.64.09zm-2.09-6.8a.47.47 0 0 1-.25-.07 12.85 12.85 0 0 1-2.49-1.86 3.7 3.7 0 0 1-1.19-2.84.47.47 0 0 1 .51-.43.47.47 0 0 1 .43.51 2.89 2.89 0 0 0 .93 2.1 12.15 12.15 0 0 0 2.31 1.71.47.47 0 0 1-.25.87zm1.8 12.49a3.68 3.68 0 0 1-2.91-.95 4.34 4.34 0 0 1-.67-1.24c-.41-1-.64-1.39-1.31-1.27a.44.44 0 1 1-.15-.87c1.44-.24 1.92.94 2.28 1.81a3.7 3.7 0 0 0 .51 1 3.24 3.24 0 0 0 2.5.65.44.44 0 0 1 0 .88zm3.36-7.39a.44.44 0 0 1-.38-.66.28.28 0 0 0 .05-.17s-.09-.12-.32-.2l-.25-.08a2.46 2.46 0 0 1-.76-.33 1.15 1.15 0 0 1-.48-.81A1.29 1.29 0 0 1 24 11a.44.44 0 1 1 .66.59.41.41 0 0 0-.11.31.26.26 0 0 0 .12.19 1.75 1.75 0 0 0 .5.2l.3.1a1.3 1.3 0 0 1 .84.72 1.05 1.05 0 0 1-.11.91.44.44 0 0 1-.38.21zm.09 11.72a.44.44 0 0 1-.41-.29 4.89 4.89 0 0 1-.21-1.56 3.19 3.19 0 0 0-.22-1.39.44.44 0 1 1 .77-.43 3.84 3.84 0 0 1 .33 1.79 4.2 4.2 0 0 0 .16 1.28.44.44 0 0 1-.26.57z\"/>\n    <path  d=\"M36.68 34.83l-5.63-5.19a7.19 7.19 0 1 0-1.17 1.59l5.47 5a1 1 0 0 0 1.33-1.44zm-11.92-3a5.56 5.56 0 1 1 5.56-5.56 5.56 5.56 0 0 1-5.56 5.55z\"/>\n</svg>"
          },
          "preparation": {
            "https://schema.hbp.eu/graphQuery/label": "Preparation",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "modalityForFilter": {
            "https://schema.hbp.eu/graphQuery/label": "Modality",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "experimentalApproach": {
            "https://schema.hbp.eu/graphQuery/label": "Experimental approach"
          },
          "technique": {
            "https://schema.hbp.eu/graphQuery/label": "Technique"
          },
          "methods": {
            "https://schema.hbp.eu/graphQuery/label": "Methods",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/tag_icon": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 11.377083 13.05244\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 5.6585847,-3.1036376e-7 2.8334327,1.5730297 0.0088,3.1455497 0.0047,6.4719597 0,9.7983697 2.8323857,11.42515 l 2.831867,1.62729 1.070218,-0.60358 c 0.588756,-0.33201 1.874409,-1.06813 2.856675,-1.63608 L 11.377083,9.7797697 v -3.24735 -3.24786 l -0.992187,-0.62477 C 9.8391917,2.3160397 8.5525477,1.5769697 7.5256387,1.0175097 Z M 5.6580697,3.7398297 a 2.7061041,2.7144562 0 0 1 2.706293,2.71456 2.7061041,2.7144562 0 0 1 -2.706293,2.71456 2.7061041,2.7144562 0 0 1 -2.70578,-2.71456 2.7061041,2.7144562 0 0 1 2.70578,-2.71456 z\"/></svg>",
            "https://schema.hbp.eu/searchUi/order": 2,
            "https://schema.hbp.eu/searchUi/facet": "list",
            "https://schema.hbp.eu/searchUi/isFilterableFacet": true
          },
          "keywords": {
            "https://schema.hbp.eu/graphQuery/label": "Keywords",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/overviewMaxDisplay": 3,
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/tag_icon": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M576 448q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm1067 576q0 53-37 90l-491 492q-39 37-91 37-53 0-90-37l-715-716q-38-37-64.5-101t-26.5-117v-416q0-52 38-90t90-38h416q53 0 117 26.5t102 64.5l715 714q37 39 37 91z\"/></svg>",
            "https://schema.hbp.eu/searchUi/order": 1,
            "https://schema.hbp.eu/searchUi/facet": "list",
            "https://schema.hbp.eu/searchUi/isFilterableFacet": true
          },
          "viewer": {
            "https://schema.hbp.eu/graphQuery/label": "Viewer",
            "https://schema.hbp.eu/searchUi/link_icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\">\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M13.37 33.67a5 5 0 0 1-1.69-.29 4.68 4.68 0 0 1-1.41-.9 4.86 4.86 0 0 0-.94-.66 10.15 10.15 0 0 0-1.07-.42 6.25 6.25 0 0 1-2.05-1 2.33 2.33 0 0 1-.73-2.54 3 3 0 0 0 0-1.29 2.68 2.68 0 0 0-.86-1.13 4.26 4.26 0 0 1-1-1.19 3.88 3.88 0 0 1-.25-2 6.81 6.81 0 0 0 0-.86A4.44 4.44 0 0 0 3 19.91c-.1-.24-.21-.49-.3-.75-.58-1.69-.05-3.45.59-5.26.56-1.58 1.17-3.05 2.54-3.84l.26-.14a1.79 1.79 0 0 0 .53-.36 1.71 1.71 0 0 0 .27-.64C7.32 7.4 8.11 5.35 10 5.27a4.13 4.13 0 0 1 .46 0 1.69 1.69 0 0 0 .55 0 1.71 1.71 0 0 0 .59-.41l.23-.21c.37-.31 2.27-1.81 3.83-1.62a1.81 1.81 0 0 1 1.28.75 2.46 2.46 0 0 1 .29.52 7.37 7.37 0 0 1 .22 3.54c0 .4-.08.79-.09 1.17L17.23 11c0 1.12-.09 2.23-.12 3.35A102.75 102.75 0 0 0 17.22 25c0 .39.08.83.14 1.28.3 2.45.7 5.81-2.17 7a4.79 4.79 0 0 1-1.82.39zm-3.3-27.52H10c-1 0-1.69 1-2.26 3a2.49 2.49 0 0 1-.45 1 2.49 2.49 0 0 1-.8.57l-.23.12c-1.1.63-1.64 2-2.14 3.37-.59 1.65-1.07 3.26-.59 4.67.08.24.18.46.27.69a5.18 5.18 0 0 1 .5 1.71 7.58 7.58 0 0 1 0 1 3.18 3.18 0 0 0 .16 1.59 3.56 3.56 0 0 0 .8.94 3.36 3.36 0 0 1 1.11 1.55 3.76 3.76 0 0 1 0 1.66c-.12.72-.2 1.19.43 1.72a5.51 5.51 0 0 0 1.77.86 10.82 10.82 0 0 1 1.14.4 5.59 5.59 0 0 1 1.11.77 4 4 0 0 0 1.15.75 4.11 4.11 0 0 0 2.88 0c2.25-.93 1.92-3.67 1.63-6.08-.06-.47-.11-.92-.14-1.32a103.52 103.52 0 0 1-.11-10.83c0-1.12.08-2.23.12-3.35L16.42 9c0-.4.06-.82.1-1.22a6.73 6.73 0 0 0-.16-3.12 1.6 1.6 0 0 0-.18-.34.93.93 0 0 0-.68-.4 5.19 5.19 0 0 0-3.15 1.43l-.21.18a2.41 2.41 0 0 1-.93.6 2.39 2.39 0 0 1-.86 0z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M12.85 11.92a.44.44 0 0 1-.2 0 3.59 3.59 0 0 1-2.13-2.81 6 6 0 0 1 0-.83v-.61a3.36 3.36 0 0 0-1-1.34.44.44 0 0 1 .48-.77 3.84 3.84 0 0 1 1.38 2v.7a5.25 5.25 0 0 0 0 .71A2.73 2.73 0 0 0 13 11.08a.44.44 0 0 1-.2.84zm-3.33 6.17a4.38 4.38 0 0 1-3.77-2.47c-.11-.21-.21-.43-.31-.65a6.21 6.21 0 0 0-.46-.9c-.21-.32-.55-.61-.82-.54a.44.44 0 1 1-.23-.85 1.69 1.69 0 0 1 1.79.9 7 7 0 0 1 .53 1c.09.2.18.41.28.6a3.28 3.28 0 0 0 3.82 1.86.44.44 0 1 1 .28.84 3.49 3.49 0 0 1-1.11.21zm-5.61 4.28a.44.44 0 0 1-.09-.87 3.47 3.47 0 0 0 .63-.89c.49-.84 1.1-1.88 2.12-2a2.5 2.5 0 0 1 2 .95.44.44 0 0 1-.62.62c-.51-.51-.94-.74-1.3-.69-.58.07-1.07.91-1.47 1.58S4.49 22.26 4 22.36zm-.1-.87zm12.43 10.7a.43.43 0 0 1-.37-.21 4 4 0 0 1-.33-1.48c-.1-1-.22-2.08-1-2.51a9.43 9.43 0 0 0-1-.43 6.51 6.51 0 0 1-1.54-.81 3 3 0 0 1-1.05-2 5.53 5.53 0 0 0-.22-.81.43.43 0 0 1 .8-.3 6.28 6.28 0 0 1 .25.93 2.2 2.2 0 0 0 .74 1.49 5.77 5.77 0 0 0 1.36.69 10.33 10.33 0 0 1 1 .47c1.18.64 1.34 2.1 1.45 3.17a3.83 3.83 0 0 0 .22 1.14.43.43 0 0 1-.37.64zm-8.66-3.79c-.33 0-.66 0-1-.06s-.48 0-.68 0a.44.44 0 0 1 0-.88c.23 0 .49 0 .76.05.76.07 1.62.16 2-.32a.44.44 0 0 1 .68.56 2.19 2.19 0 0 1-1.76.65zm3.54-12.48a1.86 1.86 0 0 1-.66-.12.44.44 0 0 1 .31-.83c.65.25 1.41-.32 1.63-.5s.37-.33.55-.5a5.85 5.85 0 0 1 1.25-1 3.22 3.22 0 0 1 2.36-.26.44.44 0 1 1-.24.85 2.33 2.33 0 0 0-1.71.19 5.11 5.11 0 0 0-1.05.85c-.19.19-.39.37-.6.54a3 3 0 0 1-1.84.78zm2.09-6.8a.47.47 0 0 1-.21-.87 12.15 12.15 0 0 0 2.31-1.71 2.89 2.89 0 0 0 .93-2.1.47.47 0 0 1 .94-.09A3.7 3.7 0 0 1 16 7.2a12.85 12.85 0 0 1-2.49 1.86.47.47 0 0 1-.3.07zm-1.79 12.49h-.26a.44.44 0 1 1 0-.88 3.24 3.24 0 0 0 2.5-.65 3.72 3.72 0 0 0 .51-1c.35-.87.84-2.05 2.28-1.81a.44.44 0 0 1-.15.87c-.67-.11-.91.28-1.31 1.27a4.35 4.35 0 0 1-.67 1.24 3.68 3.68 0 0 1-2.9.96zM8 14.23a.44.44 0 0 1-.34-.23 1.05 1.05 0 0 1-.11-.91 1.29 1.29 0 0 1 .84-.72l.3-.1a1.74 1.74 0 0 0 .5-.2.26.26 0 0 0 .12-.19.41.41 0 0 0-.11-.31.44.44 0 1 1 .66-.57 1.29 1.29 0 0 1 .33 1 1.15 1.15 0 0 1-.48.81 2.46 2.46 0 0 1-.76.33l-.25.08c-.22.08-.31.16-.32.2a.28.28 0 0 0 .05.17.44.44 0 0 1-.38.66zm0 11.72h-.15a.44.44 0 0 1-.26-.57 4.2 4.2 0 0 0 .16-1.28A3.85 3.85 0 0 1 8 22.28a.44.44 0 1 1 .77.43 3.2 3.2 0 0 0-.22 1.39 4.89 4.89 0 0 1-.21 1.56.44.44 0 0 1-.34.29z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M20.51 33.67a4.79 4.79 0 0 1-1.82-.35c-2.87-1.19-2.46-4.55-2.17-7 .06-.46.11-.89.14-1.28a102.83 102.83 0 0 0 .11-10.73c0-1.12-.08-2.23-.12-3.35L16.57 9c0-.38-.05-.77-.09-1.17a7.37 7.37 0 0 1 .22-3.54 2.47 2.47 0 0 1 .3-.51A1.81 1.81 0 0 1 18.26 3c1.55-.2 3.46 1.32 3.83 1.62l.23.21a1.7 1.7 0 0 0 .58.41 1.69 1.69 0 0 0 .55 0 3.93 3.93 0 0 1 .46 0c1.85.08 2.64 2.13 3.07 3.66a1.71 1.71 0 0 0 .27.64 1.79 1.79 0 0 0 .53.36l.26.14c1.36.78 2 2.26 2.54 3.84.64 1.81 1.17 3.57.59 5.26-.09.26-.19.5-.3.75a4.43 4.43 0 0 0-.43 1.42 6.75 6.75 0 0 0 0 .86 3.89 3.89 0 0 1-.25 2 4.26 4.26 0 0 1-1 1.19 2.67 2.67 0 0 0-.86 1.13 3 3 0 0 0 0 1.29 2.33 2.33 0 0 1-.73 2.54 6.24 6.24 0 0 1-2.05 1 10.12 10.12 0 0 0-1.07.42 4.86 4.86 0 0 0-.94.66 4.68 4.68 0 0 1-1.41.9 5 5 0 0 1-1.62.37zM17.69 4.3a1.6 1.6 0 0 0-.18.34 6.74 6.74 0 0 0-.16 3.12c0 .4.08.82.1 1.22l.07 1.95c0 1.12.09 2.23.12 3.35a103.53 103.53 0 0 1-.11 10.83c0 .41-.08.85-.14 1.32-.29 2.41-.62 5.14 1.63 6.08a4.11 4.11 0 0 0 2.88 0 4 4 0 0 0 1.1-.71 5.59 5.59 0 0 1 1.16-.8 10.91 10.91 0 0 1 1.17-.46 5.51 5.51 0 0 0 1.77-.86c.63-.53.55-1 .43-1.72a3.77 3.77 0 0 1 0-1.66 3.36 3.36 0 0 1 1.11-1.55 3.56 3.56 0 0 0 .8-.94 3.18 3.18 0 0 0 .16-1.59 7.63 7.63 0 0 1 0-1 5.18 5.18 0 0 1 .5-1.71c.1-.22.19-.45.27-.69.49-1.42 0-3-.59-4.67-.5-1.41-1-2.73-2.14-3.37l-.23-.12a2.49 2.49 0 0 1-.8-.57 2.49 2.49 0 0 1-.45-1c-.57-2-1.29-3-2.26-3h-.36a2.39 2.39 0 0 1-.86 0 2.4 2.4 0 0 1-.93-.6l-.21-.18a5.19 5.19 0 0 0-3.17-1.41.93.93 0 0 0-.68.4z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M21 11.92a.44.44 0 0 1-.2-.84A2.73 2.73 0 0 0 22.46 9a5.24 5.24 0 0 0 0-.71v-.7a3.84 3.84 0 0 1 1.38-2 .44.44 0 0 1 .52.72 3.36 3.36 0 0 0-1 1.34v.61a6 6 0 0 1 0 .83 3.59 3.59 0 0 1-2.13 2.81.44.44 0 0 1-.23.02zm3.35 6.17a3.49 3.49 0 0 1-1.12-.18.44.44 0 0 1 .28-.84 3.28 3.28 0 0 0 3.82-1.86c.1-.19.19-.4.28-.6a7 7 0 0 1 .53-1 1.69 1.69 0 0 1 1.79-.9.44.44 0 1 1-.23.85c-.27-.07-.61.21-.82.54a6.25 6.25 0 0 0-.46.91c-.1.22-.2.44-.31.65a4.38 4.38 0 0 1-3.76 2.43zM30 22.37h-.09c-.5-.1-.82-.63-1.21-1.31s-.88-1.5-1.47-1.58c-.36 0-.8.19-1.3.69a.44.44 0 0 1-.62-.62 2.5 2.5 0 0 1 2-.95c1 .13 1.62 1.17 2.12 2a3.39 3.39 0 0 0 .63.89.44.44 0 0 1 .34.52.44.44 0 0 1-.4.36zM17.64 32.2a.43.43 0 0 1-.37-.64 3.83 3.83 0 0 0 .22-1.14c.11-1.07.27-2.54 1.45-3.17a10.29 10.29 0 0 1 1-.47 5.78 5.78 0 0 0 1.36-.69 2.2 2.2 0 0 0 .74-1.49 6.27 6.27 0 0 1 .25-.93.43.43 0 0 1 .8.3 5.56 5.56 0 0 0-.22.81 3 3 0 0 1-1.06 2 6.51 6.51 0 0 1-1.56.81 9.45 9.45 0 0 0-1 .43c-.79.42-.9 1.53-1 2.51A4 4 0 0 1 18 32a.43.43 0 0 1-.36.2zm8.65-3.79a2.19 2.19 0 0 1-1.81-.7.44.44 0 0 1 .68-.56c.39.48 1.25.39 2 .32.27 0 .53-.05.76-.05a.44.44 0 0 1 0 .88h-.68c-.24 0-.62.11-.95.11zm-3.54-12.48a3 3 0 0 1-1.85-.76c-.21-.17-.4-.36-.6-.54a5.11 5.11 0 0 0-1.05-.84 2.32 2.32 0 0 0-1.71-.19.44.44 0 1 1-.24-.85 3.21 3.21 0 0 1 2.36.26 5.85 5.85 0 0 1 1.24 1c.18.17.36.34.55.5s1 .74 1.63.5a.44.44 0 1 1 .31.83 1.85 1.85 0 0 1-.64.09zm-2.09-6.8a.47.47 0 0 1-.25-.07 12.85 12.85 0 0 1-2.49-1.86 3.7 3.7 0 0 1-1.19-2.84.47.47 0 0 1 .51-.43.47.47 0 0 1 .43.51 2.89 2.89 0 0 0 .93 2.1 12.15 12.15 0 0 0 2.31 1.71.47.47 0 0 1-.25.87zm1.8 12.49a3.68 3.68 0 0 1-2.91-.95 4.34 4.34 0 0 1-.67-1.24c-.41-1-.64-1.39-1.31-1.27a.44.44 0 1 1-.15-.87c1.44-.24 1.92.94 2.28 1.81a3.7 3.7 0 0 0 .51 1 3.24 3.24 0 0 0 2.5.65.44.44 0 0 1 0 .88zm3.36-7.39a.44.44 0 0 1-.38-.66.28.28 0 0 0 .05-.17s-.09-.12-.32-.2l-.25-.08a2.46 2.46 0 0 1-.76-.33 1.15 1.15 0 0 1-.48-.81A1.29 1.29 0 0 1 24 11a.44.44 0 1 1 .66.59.41.41 0 0 0-.11.31.26.26 0 0 0 .12.19 1.75 1.75 0 0 0 .5.2l.3.1a1.3 1.3 0 0 1 .84.72 1.05 1.05 0 0 1-.11.91.44.44 0 0 1-.38.21zm.09 11.72a.44.44 0 0 1-.41-.29 4.89 4.89 0 0 1-.21-1.56 3.19 3.19 0 0 0-.22-1.39.44.44 0 1 1 .77-.43 3.84 3.84 0 0 1 .33 1.79 4.2 4.2 0 0 0 .16 1.28.44.44 0 0 1-.26.57z\"/>\n    <path d=\"M13.37 33.67a5 5 0 0 1-1.69-.29 4.68 4.68 0 0 1-1.41-.9 4.86 4.86 0 0 0-.94-.66 10.15 10.15 0 0 0-1.07-.42 6.25 6.25 0 0 1-2.05-1 2.33 2.33 0 0 1-.73-2.54 3 3 0 0 0 0-1.29 2.68 2.68 0 0 0-.86-1.13 4.26 4.26 0 0 1-1-1.19 3.88 3.88 0 0 1-.25-2 6.81 6.81 0 0 0 0-.86A4.44 4.44 0 0 0 3 19.91c-.1-.24-.21-.49-.3-.75-.58-1.69-.05-3.45.59-5.26.56-1.58 1.17-3.05 2.54-3.84l.26-.14a1.79 1.79 0 0 0 .53-.36 1.71 1.71 0 0 0 .27-.64C7.32 7.4 8.11 5.35 10 5.27a4.13 4.13 0 0 1 .46 0 1.69 1.69 0 0 0 .55 0 1.71 1.71 0 0 0 .59-.41l.23-.21c.37-.31 2.27-1.81 3.83-1.62a1.81 1.81 0 0 1 1.28.75 2.46 2.46 0 0 1 .29.52 7.37 7.37 0 0 1 .22 3.54c0 .4-.08.79-.09 1.17L17.23 11c0 1.12-.09 2.23-.12 3.35A102.75 102.75 0 0 0 17.22 25c0 .39.08.83.14 1.28.3 2.45.7 5.81-2.17 7a4.79 4.79 0 0 1-1.82.39zm-3.3-27.52H10c-1 0-1.69 1-2.26 3a2.49 2.49 0 0 1-.45 1 2.49 2.49 0 0 1-.8.57l-.23.12c-1.1.63-1.64 2-2.14 3.37-.59 1.65-1.07 3.26-.59 4.67.08.24.18.46.27.69a5.18 5.18 0 0 1 .5 1.71 7.58 7.58 0 0 1 0 1 3.18 3.18 0 0 0 .16 1.59 3.56 3.56 0 0 0 .8.94 3.36 3.36 0 0 1 1.11 1.55 3.76 3.76 0 0 1 0 1.66c-.12.72-.2 1.19.43 1.72a5.51 5.51 0 0 0 1.77.86 10.82 10.82 0 0 1 1.14.4 5.59 5.59 0 0 1 1.11.77 4 4 0 0 0 1.15.75 4.11 4.11 0 0 0 2.88 0c2.25-.93 1.92-3.67 1.63-6.08-.06-.47-.11-.92-.14-1.32a103.52 103.52 0 0 1-.11-10.83c0-1.12.08-2.23.12-3.35L16.42 9c0-.4.06-.82.1-1.22a6.73 6.73 0 0 0-.16-3.12 1.6 1.6 0 0 0-.18-.34.93.93 0 0 0-.68-.4 5.19 5.19 0 0 0-3.15 1.43l-.21.18a2.41 2.41 0 0 1-.93.6 2.39 2.39 0 0 1-.86 0z\"/>\n    <path d=\"M12.85 11.92a.44.44 0 0 1-.2 0 3.59 3.59 0 0 1-2.13-2.81 6 6 0 0 1 0-.83v-.61a3.36 3.36 0 0 0-1-1.34.44.44 0 0 1 .48-.77 3.84 3.84 0 0 1 1.38 2v.7a5.25 5.25 0 0 0 0 .71A2.73 2.73 0 0 0 13 11.08a.44.44 0 0 1-.2.84zm-3.33 6.17a4.38 4.38 0 0 1-3.77-2.47c-.11-.21-.21-.43-.31-.65a6.21 6.21 0 0 0-.46-.9c-.21-.32-.55-.61-.82-.54a.44.44 0 1 1-.23-.85 1.69 1.69 0 0 1 1.79.9 7 7 0 0 1 .53 1c.09.2.18.41.28.6a3.28 3.28 0 0 0 3.82 1.86.44.44 0 1 1 .28.84 3.49 3.49 0 0 1-1.11.21zm-5.61 4.28a.44.44 0 0 1-.09-.87 3.47 3.47 0 0 0 .63-.89c.49-.84 1.1-1.88 2.12-2a2.5 2.5 0 0 1 2 .95.44.44 0 0 1-.62.62c-.51-.51-.94-.74-1.3-.69-.58.07-1.07.91-1.47 1.58S4.49 22.26 4 22.36zm-.1-.87zm12.43 10.7a.43.43 0 0 1-.37-.21 4 4 0 0 1-.33-1.48c-.1-1-.22-2.08-1-2.51a9.43 9.43 0 0 0-1-.43 6.51 6.51 0 0 1-1.54-.81 3 3 0 0 1-1.05-2 5.53 5.53 0 0 0-.22-.81.43.43 0 0 1 .8-.3 6.28 6.28 0 0 1 .25.93 2.2 2.2 0 0 0 .74 1.49 5.77 5.77 0 0 0 1.36.69 10.33 10.33 0 0 1 1 .47c1.18.64 1.34 2.1 1.45 3.17a3.83 3.83 0 0 0 .22 1.14.43.43 0 0 1-.37.64zm-8.66-3.79c-.33 0-.66 0-1-.06s-.48 0-.68 0a.44.44 0 0 1 0-.88c.23 0 .49 0 .76.05.76.07 1.62.16 2-.32a.44.44 0 0 1 .68.56 2.19 2.19 0 0 1-1.76.65zm3.54-12.48a1.86 1.86 0 0 1-.66-.12.44.44 0 0 1 .31-.83c.65.25 1.41-.32 1.63-.5s.37-.33.55-.5a5.85 5.85 0 0 1 1.25-1 3.22 3.22 0 0 1 2.36-.26.44.44 0 1 1-.24.85 2.33 2.33 0 0 0-1.71.19 5.11 5.11 0 0 0-1.05.85c-.19.19-.39.37-.6.54a3 3 0 0 1-1.84.78zm2.09-6.8a.47.47 0 0 1-.21-.87 12.15 12.15 0 0 0 2.31-1.71 2.89 2.89 0 0 0 .93-2.1.47.47 0 0 1 .94-.09A3.7 3.7 0 0 1 16 7.2a12.85 12.85 0 0 1-2.49 1.86.47.47 0 0 1-.3.07zm-1.79 12.49h-.26a.44.44 0 1 1 0-.88 3.24 3.24 0 0 0 2.5-.65 3.72 3.72 0 0 0 .51-1c.35-.87.84-2.05 2.28-1.81a.44.44 0 0 1-.15.87c-.67-.11-.91.28-1.31 1.27a4.35 4.35 0 0 1-.67 1.24 3.68 3.68 0 0 1-2.9.96zM8 14.23a.44.44 0 0 1-.34-.23 1.05 1.05 0 0 1-.11-.91 1.29 1.29 0 0 1 .84-.72l.3-.1a1.74 1.74 0 0 0 .5-.2.26.26 0 0 0 .12-.19.41.41 0 0 0-.11-.31.44.44 0 1 1 .66-.57 1.29 1.29 0 0 1 .33 1 1.15 1.15 0 0 1-.48.81 2.46 2.46 0 0 1-.76.33l-.25.08c-.22.08-.31.16-.32.2a.28.28 0 0 0 .05.17.44.44 0 0 1-.38.66zm0 11.72h-.15a.44.44 0 0 1-.26-.57 4.2 4.2 0 0 0 .16-1.28A3.85 3.85 0 0 1 8 22.28a.44.44 0 1 1 .77.43 3.2 3.2 0 0 0-.22 1.39 4.89 4.89 0 0 1-.21 1.56.44.44 0 0 1-.34.29z\"/>\n    <path d=\"M20.51 33.67a4.79 4.79 0 0 1-1.82-.35c-2.87-1.19-2.46-4.55-2.17-7 .06-.46.11-.89.14-1.28a102.83 102.83 0 0 0 .11-10.73c0-1.12-.08-2.23-.12-3.35L16.57 9c0-.38-.05-.77-.09-1.17a7.37 7.37 0 0 1 .22-3.54 2.47 2.47 0 0 1 .3-.51A1.81 1.81 0 0 1 18.26 3c1.55-.2 3.46 1.32 3.83 1.62l.23.21a1.7 1.7 0 0 0 .58.41 1.69 1.69 0 0 0 .55 0 3.93 3.93 0 0 1 .46 0c1.85.08 2.64 2.13 3.07 3.66a1.71 1.71 0 0 0 .27.64 1.79 1.79 0 0 0 .53.36l.26.14c1.36.78 2 2.26 2.54 3.84.64 1.81 1.17 3.57.59 5.26-.09.26-.19.5-.3.75a4.43 4.43 0 0 0-.43 1.42 6.75 6.75 0 0 0 0 .86 3.89 3.89 0 0 1-.25 2 4.26 4.26 0 0 1-1 1.19 2.67 2.67 0 0 0-.86 1.13 3 3 0 0 0 0 1.29 2.33 2.33 0 0 1-.73 2.54 6.24 6.24 0 0 1-2.05 1 10.12 10.12 0 0 0-1.07.42 4.86 4.86 0 0 0-.94.66 4.68 4.68 0 0 1-1.41.9 5 5 0 0 1-1.62.37zM17.69 4.3a1.6 1.6 0 0 0-.18.34 6.74 6.74 0 0 0-.16 3.12c0 .4.08.82.1 1.22l.07 1.95c0 1.12.09 2.23.12 3.35a103.53 103.53 0 0 1-.11 10.83c0 .41-.08.85-.14 1.32-.29 2.41-.62 5.14 1.63 6.08a4.11 4.11 0 0 0 2.88 0 4 4 0 0 0 1.1-.71 5.59 5.59 0 0 1 1.16-.8 10.91 10.91 0 0 1 1.17-.46 5.51 5.51 0 0 0 1.77-.86c.63-.53.55-1 .43-1.72a3.77 3.77 0 0 1 0-1.66 3.36 3.36 0 0 1 1.11-1.55 3.56 3.56 0 0 0 .8-.94 3.18 3.18 0 0 0 .16-1.59 7.63 7.63 0 0 1 0-1 5.18 5.18 0 0 1 .5-1.71c.1-.22.19-.45.27-.69.49-1.42 0-3-.59-4.67-.5-1.41-1-2.73-2.14-3.37l-.23-.12a2.49 2.49 0 0 1-.8-.57 2.49 2.49 0 0 1-.45-1c-.57-2-1.29-3-2.26-3h-.36a2.39 2.39 0 0 1-.86 0 2.4 2.4 0 0 1-.93-.6l-.21-.18a5.19 5.19 0 0 0-3.17-1.41.93.93 0 0 0-.68.4z\"/>\n    <path d=\"M21 11.92a.44.44 0 0 1-.2-.84A2.73 2.73 0 0 0 22.46 9a5.24 5.24 0 0 0 0-.71v-.7a3.84 3.84 0 0 1 1.38-2 .44.44 0 0 1 .52.72 3.36 3.36 0 0 0-1 1.34v.61a6 6 0 0 1 0 .83 3.59 3.59 0 0 1-2.13 2.81.44.44 0 0 1-.23.02zm3.35 6.17a3.49 3.49 0 0 1-1.12-.18.44.44 0 0 1 .28-.84 3.28 3.28 0 0 0 3.82-1.86c.1-.19.19-.4.28-.6a7 7 0 0 1 .53-1 1.69 1.69 0 0 1 1.79-.9.44.44 0 1 1-.23.85c-.27-.07-.61.21-.82.54a6.25 6.25 0 0 0-.46.91c-.1.22-.2.44-.31.65a4.38 4.38 0 0 1-3.76 2.43zM30 22.37h-.09c-.5-.1-.82-.63-1.21-1.31s-.88-1.5-1.47-1.58c-.36 0-.8.19-1.3.69a.44.44 0 0 1-.62-.62 2.5 2.5 0 0 1 2-.95c1 .13 1.62 1.17 2.12 2a3.39 3.39 0 0 0 .63.89.44.44 0 0 1 .34.52.44.44 0 0 1-.4.36zM17.64 32.2a.43.43 0 0 1-.37-.64 3.83 3.83 0 0 0 .22-1.14c.11-1.07.27-2.54 1.45-3.17a10.29 10.29 0 0 1 1-.47 5.78 5.78 0 0 0 1.36-.69 2.2 2.2 0 0 0 .74-1.49 6.27 6.27 0 0 1 .25-.93.43.43 0 0 1 .8.3 5.56 5.56 0 0 0-.22.81 3 3 0 0 1-1.06 2 6.51 6.51 0 0 1-1.56.81 9.45 9.45 0 0 0-1 .43c-.79.42-.9 1.53-1 2.51A4 4 0 0 1 18 32a.43.43 0 0 1-.36.2zm8.65-3.79a2.19 2.19 0 0 1-1.81-.7.44.44 0 0 1 .68-.56c.39.48 1.25.39 2 .32.27 0 .53-.05.76-.05a.44.44 0 0 1 0 .88h-.68c-.24 0-.62.11-.95.11zm-3.54-12.48a3 3 0 0 1-1.85-.76c-.21-.17-.4-.36-.6-.54a5.11 5.11 0 0 0-1.05-.84 2.32 2.32 0 0 0-1.71-.19.44.44 0 1 1-.24-.85 3.21 3.21 0 0 1 2.36.26 5.85 5.85 0 0 1 1.24 1c.18.17.36.34.55.5s1 .74 1.63.5a.44.44 0 1 1 .31.83 1.85 1.85 0 0 1-.64.09zm-2.09-6.8a.47.47 0 0 1-.25-.07 12.85 12.85 0 0 1-2.49-1.86 3.7 3.7 0 0 1-1.19-2.84.47.47 0 0 1 .51-.43.47.47 0 0 1 .43.51 2.89 2.89 0 0 0 .93 2.1 12.15 12.15 0 0 0 2.31 1.71.47.47 0 0 1-.25.87zm1.8 12.49a3.68 3.68 0 0 1-2.91-.95 4.34 4.34 0 0 1-.67-1.24c-.41-1-.64-1.39-1.31-1.27a.44.44 0 1 1-.15-.87c1.44-.24 1.92.94 2.28 1.81a3.7 3.7 0 0 0 .51 1 3.24 3.24 0 0 0 2.5.65.44.44 0 0 1 0 .88zm3.36-7.39a.44.44 0 0 1-.38-.66.28.28 0 0 0 .05-.17s-.09-.12-.32-.2l-.25-.08a2.46 2.46 0 0 1-.76-.33 1.15 1.15 0 0 1-.48-.81A1.29 1.29 0 0 1 24 11a.44.44 0 1 1 .66.59.41.41 0 0 0-.11.31.26.26 0 0 0 .12.19 1.75 1.75 0 0 0 .5.2l.3.1a1.3 1.3 0 0 1 .84.72 1.05 1.05 0 0 1-.11.91.44.44 0 0 1-.38.21zm.09 11.72a.44.44 0 0 1-.41-.29 4.89 4.89 0 0 1-.21-1.56 3.19 3.19 0 0 0-.22-1.39.44.44 0 1 1 .77-.43 3.84 3.84 0 0 1 .33 1.79 4.2 4.2 0 0 0 .16 1.28.44.44 0 0 1-.26.57z\"/>\n    <path  d=\"M36.68 34.83l-5.63-5.19a7.19 7.19 0 1 0-1.17 1.59l5.47 5a1 1 0 0 0 1.33-1.44zm-11.92-3a5.56 5.56 0 1 1 5.56-5.56 5.56 5.56 0 0 1-5.56 5.55z\"/>\n</svg>"
          },
          "subjectGroupOrSingleSubjectOld": {
            "https://schema.hbp.eu/graphQuery/label": "Subjects",
            "https://schema.hbp.eu/searchUi/layout": "Subjects",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "children": {
              "subject_name": {
                "https://schema.hbp.eu/graphQuery/label": "Name",
                "https://schema.hbp.eu/searchUi/groupby": true
              },
              "species": {
                "https://schema.hbp.eu/graphQuery/label": "Species"
              },
              "sex": {
                "https://schema.hbp.eu/graphQuery/label": "Sex"
              },
              "age": {
                "https://schema.hbp.eu/graphQuery/label": "Age"
              },
              "agecategory": {
                "https://schema.hbp.eu/graphQuery/label": "Age category"
              },
              "weight": {
                "https://schema.hbp.eu/graphQuery/label": "Weight"
              },
              "strain": {
                "https://schema.hbp.eu/graphQuery/label": "Strain"
              },
              "genotype": {
                "https://schema.hbp.eu/graphQuery/label": "Genotype"
              },
              "samples": {
                "https://schema.hbp.eu/graphQuery/label": "Samples",
                "https://schema.hbp.eu/searchUi/sort": true
              }
            }
          },
          "subjectGroupOrSingleSubject": {
            "https://schema.hbp.eu/graphQuery/label": "Subjects",
            "https://schema.hbp.eu/searchUi/layout": "Subjects",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "children": {
              "subject_name": {
                "https://schema.hbp.eu/graphQuery/label": "Name",
                "https://schema.hbp.eu/searchUi/groupby": true
              },
              "species": {
                "https://schema.hbp.eu/graphQuery/label": "Species"
              },
              "sex": {
                "https://schema.hbp.eu/graphQuery/label": "Sex"
              },
              "age": {
                "https://schema.hbp.eu/graphQuery/label": "Age"
              },
              "ageCategory": {
                "https://schema.hbp.eu/graphQuery/label": "Age category"
              },
              "weight": {
                "https://schema.hbp.eu/graphQuery/label": "Weight"
              },
              "strain": {
                "https://schema.hbp.eu/graphQuery/label": "Strain"
              }
            }
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "Dataset"
      },
      "Sample": {
        "https://schema.hbp.eu/searchUi/order": 5,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "weightPreFixation": {
            "https://schema.hbp.eu/graphQuery/label": "Weight pre fixation"
          },
          "parcellationAtlas": {
            "https://schema.hbp.eu/graphQuery/label": "Brain atlas",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "region": {
            "https://schema.hbp.eu/graphQuery/label": "Brain region",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/link_icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\">\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M13.37 33.67a5 5 0 0 1-1.69-.29 4.68 4.68 0 0 1-1.41-.9 4.86 4.86 0 0 0-.94-.66 10.15 10.15 0 0 0-1.07-.42 6.25 6.25 0 0 1-2.05-1 2.33 2.33 0 0 1-.73-2.54 3 3 0 0 0 0-1.29 2.68 2.68 0 0 0-.86-1.13 4.26 4.26 0 0 1-1-1.19 3.88 3.88 0 0 1-.25-2 6.81 6.81 0 0 0 0-.86A4.44 4.44 0 0 0 3 19.91c-.1-.24-.21-.49-.3-.75-.58-1.69-.05-3.45.59-5.26.56-1.58 1.17-3.05 2.54-3.84l.26-.14a1.79 1.79 0 0 0 .53-.36 1.71 1.71 0 0 0 .27-.64C7.32 7.4 8.11 5.35 10 5.27a4.13 4.13 0 0 1 .46 0 1.69 1.69 0 0 0 .55 0 1.71 1.71 0 0 0 .59-.41l.23-.21c.37-.31 2.27-1.81 3.83-1.62a1.81 1.81 0 0 1 1.28.75 2.46 2.46 0 0 1 .29.52 7.37 7.37 0 0 1 .22 3.54c0 .4-.08.79-.09 1.17L17.23 11c0 1.12-.09 2.23-.12 3.35A102.75 102.75 0 0 0 17.22 25c0 .39.08.83.14 1.28.3 2.45.7 5.81-2.17 7a4.79 4.79 0 0 1-1.82.39zm-3.3-27.52H10c-1 0-1.69 1-2.26 3a2.49 2.49 0 0 1-.45 1 2.49 2.49 0 0 1-.8.57l-.23.12c-1.1.63-1.64 2-2.14 3.37-.59 1.65-1.07 3.26-.59 4.67.08.24.18.46.27.69a5.18 5.18 0 0 1 .5 1.71 7.58 7.58 0 0 1 0 1 3.18 3.18 0 0 0 .16 1.59 3.56 3.56 0 0 0 .8.94 3.36 3.36 0 0 1 1.11 1.55 3.76 3.76 0 0 1 0 1.66c-.12.72-.2 1.19.43 1.72a5.51 5.51 0 0 0 1.77.86 10.82 10.82 0 0 1 1.14.4 5.59 5.59 0 0 1 1.11.77 4 4 0 0 0 1.15.75 4.11 4.11 0 0 0 2.88 0c2.25-.93 1.92-3.67 1.63-6.08-.06-.47-.11-.92-.14-1.32a103.52 103.52 0 0 1-.11-10.83c0-1.12.08-2.23.12-3.35L16.42 9c0-.4.06-.82.1-1.22a6.73 6.73 0 0 0-.16-3.12 1.6 1.6 0 0 0-.18-.34.93.93 0 0 0-.68-.4 5.19 5.19 0 0 0-3.15 1.43l-.21.18a2.41 2.41 0 0 1-.93.6 2.39 2.39 0 0 1-.86 0z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M12.85 11.92a.44.44 0 0 1-.2 0 3.59 3.59 0 0 1-2.13-2.81 6 6 0 0 1 0-.83v-.61a3.36 3.36 0 0 0-1-1.34.44.44 0 0 1 .48-.77 3.84 3.84 0 0 1 1.38 2v.7a5.25 5.25 0 0 0 0 .71A2.73 2.73 0 0 0 13 11.08a.44.44 0 0 1-.2.84zm-3.33 6.17a4.38 4.38 0 0 1-3.77-2.47c-.11-.21-.21-.43-.31-.65a6.21 6.21 0 0 0-.46-.9c-.21-.32-.55-.61-.82-.54a.44.44 0 1 1-.23-.85 1.69 1.69 0 0 1 1.79.9 7 7 0 0 1 .53 1c.09.2.18.41.28.6a3.28 3.28 0 0 0 3.82 1.86.44.44 0 1 1 .28.84 3.49 3.49 0 0 1-1.11.21zm-5.61 4.28a.44.44 0 0 1-.09-.87 3.47 3.47 0 0 0 .63-.89c.49-.84 1.1-1.88 2.12-2a2.5 2.5 0 0 1 2 .95.44.44 0 0 1-.62.62c-.51-.51-.94-.74-1.3-.69-.58.07-1.07.91-1.47 1.58S4.49 22.26 4 22.36zm-.1-.87zm12.43 10.7a.43.43 0 0 1-.37-.21 4 4 0 0 1-.33-1.48c-.1-1-.22-2.08-1-2.51a9.43 9.43 0 0 0-1-.43 6.51 6.51 0 0 1-1.54-.81 3 3 0 0 1-1.05-2 5.53 5.53 0 0 0-.22-.81.43.43 0 0 1 .8-.3 6.28 6.28 0 0 1 .25.93 2.2 2.2 0 0 0 .74 1.49 5.77 5.77 0 0 0 1.36.69 10.33 10.33 0 0 1 1 .47c1.18.64 1.34 2.1 1.45 3.17a3.83 3.83 0 0 0 .22 1.14.43.43 0 0 1-.37.64zm-8.66-3.79c-.33 0-.66 0-1-.06s-.48 0-.68 0a.44.44 0 0 1 0-.88c.23 0 .49 0 .76.05.76.07 1.62.16 2-.32a.44.44 0 0 1 .68.56 2.19 2.19 0 0 1-1.76.65zm3.54-12.48a1.86 1.86 0 0 1-.66-.12.44.44 0 0 1 .31-.83c.65.25 1.41-.32 1.63-.5s.37-.33.55-.5a5.85 5.85 0 0 1 1.25-1 3.22 3.22 0 0 1 2.36-.26.44.44 0 1 1-.24.85 2.33 2.33 0 0 0-1.71.19 5.11 5.11 0 0 0-1.05.85c-.19.19-.39.37-.6.54a3 3 0 0 1-1.84.78zm2.09-6.8a.47.47 0 0 1-.21-.87 12.15 12.15 0 0 0 2.31-1.71 2.89 2.89 0 0 0 .93-2.1.47.47 0 0 1 .94-.09A3.7 3.7 0 0 1 16 7.2a12.85 12.85 0 0 1-2.49 1.86.47.47 0 0 1-.3.07zm-1.79 12.49h-.26a.44.44 0 1 1 0-.88 3.24 3.24 0 0 0 2.5-.65 3.72 3.72 0 0 0 .51-1c.35-.87.84-2.05 2.28-1.81a.44.44 0 0 1-.15.87c-.67-.11-.91.28-1.31 1.27a4.35 4.35 0 0 1-.67 1.24 3.68 3.68 0 0 1-2.9.96zM8 14.23a.44.44 0 0 1-.34-.23 1.05 1.05 0 0 1-.11-.91 1.29 1.29 0 0 1 .84-.72l.3-.1a1.74 1.74 0 0 0 .5-.2.26.26 0 0 0 .12-.19.41.41 0 0 0-.11-.31.44.44 0 1 1 .66-.57 1.29 1.29 0 0 1 .33 1 1.15 1.15 0 0 1-.48.81 2.46 2.46 0 0 1-.76.33l-.25.08c-.22.08-.31.16-.32.2a.28.28 0 0 0 .05.17.44.44 0 0 1-.38.66zm0 11.72h-.15a.44.44 0 0 1-.26-.57 4.2 4.2 0 0 0 .16-1.28A3.85 3.85 0 0 1 8 22.28a.44.44 0 1 1 .77.43 3.2 3.2 0 0 0-.22 1.39 4.89 4.89 0 0 1-.21 1.56.44.44 0 0 1-.34.29z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M20.51 33.67a4.79 4.79 0 0 1-1.82-.35c-2.87-1.19-2.46-4.55-2.17-7 .06-.46.11-.89.14-1.28a102.83 102.83 0 0 0 .11-10.73c0-1.12-.08-2.23-.12-3.35L16.57 9c0-.38-.05-.77-.09-1.17a7.37 7.37 0 0 1 .22-3.54 2.47 2.47 0 0 1 .3-.51A1.81 1.81 0 0 1 18.26 3c1.55-.2 3.46 1.32 3.83 1.62l.23.21a1.7 1.7 0 0 0 .58.41 1.69 1.69 0 0 0 .55 0 3.93 3.93 0 0 1 .46 0c1.85.08 2.64 2.13 3.07 3.66a1.71 1.71 0 0 0 .27.64 1.79 1.79 0 0 0 .53.36l.26.14c1.36.78 2 2.26 2.54 3.84.64 1.81 1.17 3.57.59 5.26-.09.26-.19.5-.3.75a4.43 4.43 0 0 0-.43 1.42 6.75 6.75 0 0 0 0 .86 3.89 3.89 0 0 1-.25 2 4.26 4.26 0 0 1-1 1.19 2.67 2.67 0 0 0-.86 1.13 3 3 0 0 0 0 1.29 2.33 2.33 0 0 1-.73 2.54 6.24 6.24 0 0 1-2.05 1 10.12 10.12 0 0 0-1.07.42 4.86 4.86 0 0 0-.94.66 4.68 4.68 0 0 1-1.41.9 5 5 0 0 1-1.62.37zM17.69 4.3a1.6 1.6 0 0 0-.18.34 6.74 6.74 0 0 0-.16 3.12c0 .4.08.82.1 1.22l.07 1.95c0 1.12.09 2.23.12 3.35a103.53 103.53 0 0 1-.11 10.83c0 .41-.08.85-.14 1.32-.29 2.41-.62 5.14 1.63 6.08a4.11 4.11 0 0 0 2.88 0 4 4 0 0 0 1.1-.71 5.59 5.59 0 0 1 1.16-.8 10.91 10.91 0 0 1 1.17-.46 5.51 5.51 0 0 0 1.77-.86c.63-.53.55-1 .43-1.72a3.77 3.77 0 0 1 0-1.66 3.36 3.36 0 0 1 1.11-1.55 3.56 3.56 0 0 0 .8-.94 3.18 3.18 0 0 0 .16-1.59 7.63 7.63 0 0 1 0-1 5.18 5.18 0 0 1 .5-1.71c.1-.22.19-.45.27-.69.49-1.42 0-3-.59-4.67-.5-1.41-1-2.73-2.14-3.37l-.23-.12a2.49 2.49 0 0 1-.8-.57 2.49 2.49 0 0 1-.45-1c-.57-2-1.29-3-2.26-3h-.36a2.39 2.39 0 0 1-.86 0 2.4 2.4 0 0 1-.93-.6l-.21-.18a5.19 5.19 0 0 0-3.17-1.41.93.93 0 0 0-.68.4z\"/>\n    <path opacity=\"0.6\" fill=\"#4D4D4D\"\n          d=\"M21 11.92a.44.44 0 0 1-.2-.84A2.73 2.73 0 0 0 22.46 9a5.24 5.24 0 0 0 0-.71v-.7a3.84 3.84 0 0 1 1.38-2 .44.44 0 0 1 .52.72 3.36 3.36 0 0 0-1 1.34v.61a6 6 0 0 1 0 .83 3.59 3.59 0 0 1-2.13 2.81.44.44 0 0 1-.23.02zm3.35 6.17a3.49 3.49 0 0 1-1.12-.18.44.44 0 0 1 .28-.84 3.28 3.28 0 0 0 3.82-1.86c.1-.19.19-.4.28-.6a7 7 0 0 1 .53-1 1.69 1.69 0 0 1 1.79-.9.44.44 0 1 1-.23.85c-.27-.07-.61.21-.82.54a6.25 6.25 0 0 0-.46.91c-.1.22-.2.44-.31.65a4.38 4.38 0 0 1-3.76 2.43zM30 22.37h-.09c-.5-.1-.82-.63-1.21-1.31s-.88-1.5-1.47-1.58c-.36 0-.8.19-1.3.69a.44.44 0 0 1-.62-.62 2.5 2.5 0 0 1 2-.95c1 .13 1.62 1.17 2.12 2a3.39 3.39 0 0 0 .63.89.44.44 0 0 1 .34.52.44.44 0 0 1-.4.36zM17.64 32.2a.43.43 0 0 1-.37-.64 3.83 3.83 0 0 0 .22-1.14c.11-1.07.27-2.54 1.45-3.17a10.29 10.29 0 0 1 1-.47 5.78 5.78 0 0 0 1.36-.69 2.2 2.2 0 0 0 .74-1.49 6.27 6.27 0 0 1 .25-.93.43.43 0 0 1 .8.3 5.56 5.56 0 0 0-.22.81 3 3 0 0 1-1.06 2 6.51 6.51 0 0 1-1.56.81 9.45 9.45 0 0 0-1 .43c-.79.42-.9 1.53-1 2.51A4 4 0 0 1 18 32a.43.43 0 0 1-.36.2zm8.65-3.79a2.19 2.19 0 0 1-1.81-.7.44.44 0 0 1 .68-.56c.39.48 1.25.39 2 .32.27 0 .53-.05.76-.05a.44.44 0 0 1 0 .88h-.68c-.24 0-.62.11-.95.11zm-3.54-12.48a3 3 0 0 1-1.85-.76c-.21-.17-.4-.36-.6-.54a5.11 5.11 0 0 0-1.05-.84 2.32 2.32 0 0 0-1.71-.19.44.44 0 1 1-.24-.85 3.21 3.21 0 0 1 2.36.26 5.85 5.85 0 0 1 1.24 1c.18.17.36.34.55.5s1 .74 1.63.5a.44.44 0 1 1 .31.83 1.85 1.85 0 0 1-.64.09zm-2.09-6.8a.47.47 0 0 1-.25-.07 12.85 12.85 0 0 1-2.49-1.86 3.7 3.7 0 0 1-1.19-2.84.47.47 0 0 1 .51-.43.47.47 0 0 1 .43.51 2.89 2.89 0 0 0 .93 2.1 12.15 12.15 0 0 0 2.31 1.71.47.47 0 0 1-.25.87zm1.8 12.49a3.68 3.68 0 0 1-2.91-.95 4.34 4.34 0 0 1-.67-1.24c-.41-1-.64-1.39-1.31-1.27a.44.44 0 1 1-.15-.87c1.44-.24 1.92.94 2.28 1.81a3.7 3.7 0 0 0 .51 1 3.24 3.24 0 0 0 2.5.65.44.44 0 0 1 0 .88zm3.36-7.39a.44.44 0 0 1-.38-.66.28.28 0 0 0 .05-.17s-.09-.12-.32-.2l-.25-.08a2.46 2.46 0 0 1-.76-.33 1.15 1.15 0 0 1-.48-.81A1.29 1.29 0 0 1 24 11a.44.44 0 1 1 .66.59.41.41 0 0 0-.11.31.26.26 0 0 0 .12.19 1.75 1.75 0 0 0 .5.2l.3.1a1.3 1.3 0 0 1 .84.72 1.05 1.05 0 0 1-.11.91.44.44 0 0 1-.38.21zm.09 11.72a.44.44 0 0 1-.41-.29 4.89 4.89 0 0 1-.21-1.56 3.19 3.19 0 0 0-.22-1.39.44.44 0 1 1 .77-.43 3.84 3.84 0 0 1 .33 1.79 4.2 4.2 0 0 0 .16 1.28.44.44 0 0 1-.26.57z\"/>\n    <path d=\"M13.37 33.67a5 5 0 0 1-1.69-.29 4.68 4.68 0 0 1-1.41-.9 4.86 4.86 0 0 0-.94-.66 10.15 10.15 0 0 0-1.07-.42 6.25 6.25 0 0 1-2.05-1 2.33 2.33 0 0 1-.73-2.54 3 3 0 0 0 0-1.29 2.68 2.68 0 0 0-.86-1.13 4.26 4.26 0 0 1-1-1.19 3.88 3.88 0 0 1-.25-2 6.81 6.81 0 0 0 0-.86A4.44 4.44 0 0 0 3 19.91c-.1-.24-.21-.49-.3-.75-.58-1.69-.05-3.45.59-5.26.56-1.58 1.17-3.05 2.54-3.84l.26-.14a1.79 1.79 0 0 0 .53-.36 1.71 1.71 0 0 0 .27-.64C7.32 7.4 8.11 5.35 10 5.27a4.13 4.13 0 0 1 .46 0 1.69 1.69 0 0 0 .55 0 1.71 1.71 0 0 0 .59-.41l.23-.21c.37-.31 2.27-1.81 3.83-1.62a1.81 1.81 0 0 1 1.28.75 2.46 2.46 0 0 1 .29.52 7.37 7.37 0 0 1 .22 3.54c0 .4-.08.79-.09 1.17L17.23 11c0 1.12-.09 2.23-.12 3.35A102.75 102.75 0 0 0 17.22 25c0 .39.08.83.14 1.28.3 2.45.7 5.81-2.17 7a4.79 4.79 0 0 1-1.82.39zm-3.3-27.52H10c-1 0-1.69 1-2.26 3a2.49 2.49 0 0 1-.45 1 2.49 2.49 0 0 1-.8.57l-.23.12c-1.1.63-1.64 2-2.14 3.37-.59 1.65-1.07 3.26-.59 4.67.08.24.18.46.27.69a5.18 5.18 0 0 1 .5 1.71 7.58 7.58 0 0 1 0 1 3.18 3.18 0 0 0 .16 1.59 3.56 3.56 0 0 0 .8.94 3.36 3.36 0 0 1 1.11 1.55 3.76 3.76 0 0 1 0 1.66c-.12.72-.2 1.19.43 1.72a5.51 5.51 0 0 0 1.77.86 10.82 10.82 0 0 1 1.14.4 5.59 5.59 0 0 1 1.11.77 4 4 0 0 0 1.15.75 4.11 4.11 0 0 0 2.88 0c2.25-.93 1.92-3.67 1.63-6.08-.06-.47-.11-.92-.14-1.32a103.52 103.52 0 0 1-.11-10.83c0-1.12.08-2.23.12-3.35L16.42 9c0-.4.06-.82.1-1.22a6.73 6.73 0 0 0-.16-3.12 1.6 1.6 0 0 0-.18-.34.93.93 0 0 0-.68-.4 5.19 5.19 0 0 0-3.15 1.43l-.21.18a2.41 2.41 0 0 1-.93.6 2.39 2.39 0 0 1-.86 0z\"/>\n    <path d=\"M12.85 11.92a.44.44 0 0 1-.2 0 3.59 3.59 0 0 1-2.13-2.81 6 6 0 0 1 0-.83v-.61a3.36 3.36 0 0 0-1-1.34.44.44 0 0 1 .48-.77 3.84 3.84 0 0 1 1.38 2v.7a5.25 5.25 0 0 0 0 .71A2.73 2.73 0 0 0 13 11.08a.44.44 0 0 1-.2.84zm-3.33 6.17a4.38 4.38 0 0 1-3.77-2.47c-.11-.21-.21-.43-.31-.65a6.21 6.21 0 0 0-.46-.9c-.21-.32-.55-.61-.82-.54a.44.44 0 1 1-.23-.85 1.69 1.69 0 0 1 1.79.9 7 7 0 0 1 .53 1c.09.2.18.41.28.6a3.28 3.28 0 0 0 3.82 1.86.44.44 0 1 1 .28.84 3.49 3.49 0 0 1-1.11.21zm-5.61 4.28a.44.44 0 0 1-.09-.87 3.47 3.47 0 0 0 .63-.89c.49-.84 1.1-1.88 2.12-2a2.5 2.5 0 0 1 2 .95.44.44 0 0 1-.62.62c-.51-.51-.94-.74-1.3-.69-.58.07-1.07.91-1.47 1.58S4.49 22.26 4 22.36zm-.1-.87zm12.43 10.7a.43.43 0 0 1-.37-.21 4 4 0 0 1-.33-1.48c-.1-1-.22-2.08-1-2.51a9.43 9.43 0 0 0-1-.43 6.51 6.51 0 0 1-1.54-.81 3 3 0 0 1-1.05-2 5.53 5.53 0 0 0-.22-.81.43.43 0 0 1 .8-.3 6.28 6.28 0 0 1 .25.93 2.2 2.2 0 0 0 .74 1.49 5.77 5.77 0 0 0 1.36.69 10.33 10.33 0 0 1 1 .47c1.18.64 1.34 2.1 1.45 3.17a3.83 3.83 0 0 0 .22 1.14.43.43 0 0 1-.37.64zm-8.66-3.79c-.33 0-.66 0-1-.06s-.48 0-.68 0a.44.44 0 0 1 0-.88c.23 0 .49 0 .76.05.76.07 1.62.16 2-.32a.44.44 0 0 1 .68.56 2.19 2.19 0 0 1-1.76.65zm3.54-12.48a1.86 1.86 0 0 1-.66-.12.44.44 0 0 1 .31-.83c.65.25 1.41-.32 1.63-.5s.37-.33.55-.5a5.85 5.85 0 0 1 1.25-1 3.22 3.22 0 0 1 2.36-.26.44.44 0 1 1-.24.85 2.33 2.33 0 0 0-1.71.19 5.11 5.11 0 0 0-1.05.85c-.19.19-.39.37-.6.54a3 3 0 0 1-1.84.78zm2.09-6.8a.47.47 0 0 1-.21-.87 12.15 12.15 0 0 0 2.31-1.71 2.89 2.89 0 0 0 .93-2.1.47.47 0 0 1 .94-.09A3.7 3.7 0 0 1 16 7.2a12.85 12.85 0 0 1-2.49 1.86.47.47 0 0 1-.3.07zm-1.79 12.49h-.26a.44.44 0 1 1 0-.88 3.24 3.24 0 0 0 2.5-.65 3.72 3.72 0 0 0 .51-1c.35-.87.84-2.05 2.28-1.81a.44.44 0 0 1-.15.87c-.67-.11-.91.28-1.31 1.27a4.35 4.35 0 0 1-.67 1.24 3.68 3.68 0 0 1-2.9.96zM8 14.23a.44.44 0 0 1-.34-.23 1.05 1.05 0 0 1-.11-.91 1.29 1.29 0 0 1 .84-.72l.3-.1a1.74 1.74 0 0 0 .5-.2.26.26 0 0 0 .12-.19.41.41 0 0 0-.11-.31.44.44 0 1 1 .66-.57 1.29 1.29 0 0 1 .33 1 1.15 1.15 0 0 1-.48.81 2.46 2.46 0 0 1-.76.33l-.25.08c-.22.08-.31.16-.32.2a.28.28 0 0 0 .05.17.44.44 0 0 1-.38.66zm0 11.72h-.15a.44.44 0 0 1-.26-.57 4.2 4.2 0 0 0 .16-1.28A3.85 3.85 0 0 1 8 22.28a.44.44 0 1 1 .77.43 3.2 3.2 0 0 0-.22 1.39 4.89 4.89 0 0 1-.21 1.56.44.44 0 0 1-.34.29z\"/>\n    <path d=\"M20.51 33.67a4.79 4.79 0 0 1-1.82-.35c-2.87-1.19-2.46-4.55-2.17-7 .06-.46.11-.89.14-1.28a102.83 102.83 0 0 0 .11-10.73c0-1.12-.08-2.23-.12-3.35L16.57 9c0-.38-.05-.77-.09-1.17a7.37 7.37 0 0 1 .22-3.54 2.47 2.47 0 0 1 .3-.51A1.81 1.81 0 0 1 18.26 3c1.55-.2 3.46 1.32 3.83 1.62l.23.21a1.7 1.7 0 0 0 .58.41 1.69 1.69 0 0 0 .55 0 3.93 3.93 0 0 1 .46 0c1.85.08 2.64 2.13 3.07 3.66a1.71 1.71 0 0 0 .27.64 1.79 1.79 0 0 0 .53.36l.26.14c1.36.78 2 2.26 2.54 3.84.64 1.81 1.17 3.57.59 5.26-.09.26-.19.5-.3.75a4.43 4.43 0 0 0-.43 1.42 6.75 6.75 0 0 0 0 .86 3.89 3.89 0 0 1-.25 2 4.26 4.26 0 0 1-1 1.19 2.67 2.67 0 0 0-.86 1.13 3 3 0 0 0 0 1.29 2.33 2.33 0 0 1-.73 2.54 6.24 6.24 0 0 1-2.05 1 10.12 10.12 0 0 0-1.07.42 4.86 4.86 0 0 0-.94.66 4.68 4.68 0 0 1-1.41.9 5 5 0 0 1-1.62.37zM17.69 4.3a1.6 1.6 0 0 0-.18.34 6.74 6.74 0 0 0-.16 3.12c0 .4.08.82.1 1.22l.07 1.95c0 1.12.09 2.23.12 3.35a103.53 103.53 0 0 1-.11 10.83c0 .41-.08.85-.14 1.32-.29 2.41-.62 5.14 1.63 6.08a4.11 4.11 0 0 0 2.88 0 4 4 0 0 0 1.1-.71 5.59 5.59 0 0 1 1.16-.8 10.91 10.91 0 0 1 1.17-.46 5.51 5.51 0 0 0 1.77-.86c.63-.53.55-1 .43-1.72a3.77 3.77 0 0 1 0-1.66 3.36 3.36 0 0 1 1.11-1.55 3.56 3.56 0 0 0 .8-.94 3.18 3.18 0 0 0 .16-1.59 7.63 7.63 0 0 1 0-1 5.18 5.18 0 0 1 .5-1.71c.1-.22.19-.45.27-.69.49-1.42 0-3-.59-4.67-.5-1.41-1-2.73-2.14-3.37l-.23-.12a2.49 2.49 0 0 1-.8-.57 2.49 2.49 0 0 1-.45-1c-.57-2-1.29-3-2.26-3h-.36a2.39 2.39 0 0 1-.86 0 2.4 2.4 0 0 1-.93-.6l-.21-.18a5.19 5.19 0 0 0-3.17-1.41.93.93 0 0 0-.68.4z\"/>\n    <path d=\"M21 11.92a.44.44 0 0 1-.2-.84A2.73 2.73 0 0 0 22.46 9a5.24 5.24 0 0 0 0-.71v-.7a3.84 3.84 0 0 1 1.38-2 .44.44 0 0 1 .52.72 3.36 3.36 0 0 0-1 1.34v.61a6 6 0 0 1 0 .83 3.59 3.59 0 0 1-2.13 2.81.44.44 0 0 1-.23.02zm3.35 6.17a3.49 3.49 0 0 1-1.12-.18.44.44 0 0 1 .28-.84 3.28 3.28 0 0 0 3.82-1.86c.1-.19.19-.4.28-.6a7 7 0 0 1 .53-1 1.69 1.69 0 0 1 1.79-.9.44.44 0 1 1-.23.85c-.27-.07-.61.21-.82.54a6.25 6.25 0 0 0-.46.91c-.1.22-.2.44-.31.65a4.38 4.38 0 0 1-3.76 2.43zM30 22.37h-.09c-.5-.1-.82-.63-1.21-1.31s-.88-1.5-1.47-1.58c-.36 0-.8.19-1.3.69a.44.44 0 0 1-.62-.62 2.5 2.5 0 0 1 2-.95c1 .13 1.62 1.17 2.12 2a3.39 3.39 0 0 0 .63.89.44.44 0 0 1 .34.52.44.44 0 0 1-.4.36zM17.64 32.2a.43.43 0 0 1-.37-.64 3.83 3.83 0 0 0 .22-1.14c.11-1.07.27-2.54 1.45-3.17a10.29 10.29 0 0 1 1-.47 5.78 5.78 0 0 0 1.36-.69 2.2 2.2 0 0 0 .74-1.49 6.27 6.27 0 0 1 .25-.93.43.43 0 0 1 .8.3 5.56 5.56 0 0 0-.22.81 3 3 0 0 1-1.06 2 6.51 6.51 0 0 1-1.56.81 9.45 9.45 0 0 0-1 .43c-.79.42-.9 1.53-1 2.51A4 4 0 0 1 18 32a.43.43 0 0 1-.36.2zm8.65-3.79a2.19 2.19 0 0 1-1.81-.7.44.44 0 0 1 .68-.56c.39.48 1.25.39 2 .32.27 0 .53-.05.76-.05a.44.44 0 0 1 0 .88h-.68c-.24 0-.62.11-.95.11zm-3.54-12.48a3 3 0 0 1-1.85-.76c-.21-.17-.4-.36-.6-.54a5.11 5.11 0 0 0-1.05-.84 2.32 2.32 0 0 0-1.71-.19.44.44 0 1 1-.24-.85 3.21 3.21 0 0 1 2.36.26 5.85 5.85 0 0 1 1.24 1c.18.17.36.34.55.5s1 .74 1.63.5a.44.44 0 1 1 .31.83 1.85 1.85 0 0 1-.64.09zm-2.09-6.8a.47.47 0 0 1-.25-.07 12.85 12.85 0 0 1-2.49-1.86 3.7 3.7 0 0 1-1.19-2.84.47.47 0 0 1 .51-.43.47.47 0 0 1 .43.51 2.89 2.89 0 0 0 .93 2.1 12.15 12.15 0 0 0 2.31 1.71.47.47 0 0 1-.25.87zm1.8 12.49a3.68 3.68 0 0 1-2.91-.95 4.34 4.34 0 0 1-.67-1.24c-.41-1-.64-1.39-1.31-1.27a.44.44 0 1 1-.15-.87c1.44-.24 1.92.94 2.28 1.81a3.7 3.7 0 0 0 .51 1 3.24 3.24 0 0 0 2.5.65.44.44 0 0 1 0 .88zm3.36-7.39a.44.44 0 0 1-.38-.66.28.28 0 0 0 .05-.17s-.09-.12-.32-.2l-.25-.08a2.46 2.46 0 0 1-.76-.33 1.15 1.15 0 0 1-.48-.81A1.29 1.29 0 0 1 24 11a.44.44 0 1 1 .66.59.41.41 0 0 0-.11.31.26.26 0 0 0 .12.19 1.75 1.75 0 0 0 .5.2l.3.1a1.3 1.3 0 0 1 .84.72 1.05 1.05 0 0 1-.11.91.44.44 0 0 1-.38.21zm.09 11.72a.44.44 0 0 1-.41-.29 4.89 4.89 0 0 1-.21-1.56 3.19 3.19 0 0 0-.22-1.39.44.44 0 1 1 .77-.43 3.84 3.84 0 0 1 .33 1.79 4.2 4.2 0 0 0 .16 1.28.44.44 0 0 1-.26.57z\"/>\n    <path  d=\"M36.68 34.83l-5.63-5.19a7.19 7.19 0 1 0-1.17 1.59l5.47 5a1 1 0 0 0 1.33-1.44zm-11.92-3a5.56 5.56 0 1 1 5.56-5.56 5.56 5.56 0 0 1-5.56 5.55z\"/>\n</svg>"
          },
          "viewer": {
            "https://schema.hbp.eu/graphQuery/label": "Viewer"
          },
          "methods": {
            "https://schema.hbp.eu/graphQuery/label": "Methods",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/overviewMaxDisplay": 1,
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/tag_icon": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 11.377083 13.05244\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 5.6585847,-3.1036376e-7 2.8334327,1.5730297 0.0088,3.1455497 0.0047,6.4719597 0,9.7983697 2.8323857,11.42515 l 2.831867,1.62729 1.070218,-0.60358 c 0.588756,-0.33201 1.874409,-1.06813 2.856675,-1.63608 L 11.377083,9.7797697 v -3.24735 -3.24786 l -0.992187,-0.62477 C 9.8391917,2.3160397 8.5525477,1.5769697 7.5256387,1.0175097 Z M 5.6580697,3.7398297 a 2.7061041,2.7144562 0 0 1 2.706293,2.71456 2.7061041,2.7144562 0 0 1 -2.706293,2.71456 2.7061041,2.7144562 0 0 1 -2.70578,-2.71456 2.7061041,2.7144562 0 0 1 2.70578,-2.71456 z\"/></svg>"
          },
          "allfiles": {
            "https://schema.hbp.eu/graphQuery/label": "Data download",
            "https://schema.hbp.eu/searchUi/icon": "download",
            "https://schema.hbp.eu/searchUi/isButton": true,
            "https://schema.hbp.eu/searchUi/termsOfUse": true
          },
          "files": {
            "https://schema.hbp.eu/graphQuery/label": "Files",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/termsOfUse": true
          },
          "subject": {
            "https://schema.hbp.eu/graphQuery/label": "Subject",
            "https://schema.hbp.eu/searchUi/hint": "Experimental subject that this sample was obtained from.",
            "https://schema.hbp.eu/searchUi/overview": true,
            "children": {
              "subject_name": {
                "https://schema.hbp.eu/graphQuery/label": "Name"
              },
              "species": {
                "https://schema.hbp.eu/graphQuery/label": "Species",
                "https://schema.hbp.eu/searchUi/overview": true,
                "https://schema.hbp.eu/searchUi/type": "text",
                "https://schema.hbp.eu/searchUi/facet_order": "bycount",
                "https://schema.hbp.eu/searchUi/facet": "list"
              },
              "sex": {
                "https://schema.hbp.eu/graphQuery/label": "Sex",
                "https://schema.hbp.eu/searchUi/facet": "list"
              },
              "age": {
                "https://schema.hbp.eu/graphQuery/label": "Age"
              },
              "agecategory": {
                "https://schema.hbp.eu/graphQuery/label": "Age category"
              },
              "weight": {
                "https://schema.hbp.eu/graphQuery/label": "Weight"
              },
              "strain": {
                "https://schema.hbp.eu/graphQuery/label": "Strain"
              },
              "genotype": {
                "https://schema.hbp.eu/graphQuery/label": "Genotype"
              }
            }
          },
          "datasetExists": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/facet": "exists"
          },
          "datasets": {
            "https://schema.hbp.eu/graphQuery/label": "Datasets",
            "https://schema.hbp.eu/searchUi/hint": "List of datasets in which the sample was used to produce data.",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "children": {
              "component": {
                "https://schema.hbp.eu/searchUi/type": "text"
              },
              "name": {}
            }
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "Sample"
      },
      "Contributor": {
        "https://schema.hbp.eu/searchUi/order": 8,
        "https://schema.hbp.eu/searchUi/searchable": true,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "custodianOf": {
            "https://schema.hbp.eu/graphQuery/label": "Custodian of",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "custodianOfModel": {
            "https://schema.hbp.eu/graphQuery/label": "Custodian of models",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "publications": {
            "https://schema.hbp.eu/graphQuery/label": "Publications",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/facet": "exists"
          },
          "contributions": {
            "https://schema.hbp.eu/graphQuery/label": "Contributions",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/facet": "exists"
          },
          "modelContributions": {
            "https://schema.hbp.eu/graphQuery/label": "Model contributions",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/facet": "exists"
          },
          "custodian": {
            "https://schema.hbp.eu/graphQuery/label": "Custodian of",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "children": {
              "typeLabel": {
                "https://schema.hbp.eu/graphQuery/label": "Type",
                "https://schema.hbp.eu/searchUi/sort": true
              },
              "instances": {
                "https://schema.hbp.eu/graphQuery/label": "Instances",
                "https://schema.hbp.eu/searchUi/sort": true
              }
            }
          },
          "contribution": {
            "https://schema.hbp.eu/graphQuery/label": "Contributions",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "children": {
              "typeLabel": {
                "https://schema.hbp.eu/graphQuery/label": "Type",
                "https://schema.hbp.eu/searchUi/sort": true
              },
              "instances": {
                "https://schema.hbp.eu/graphQuery/label": "Instances",
                "https://schema.hbp.eu/searchUi/sort": true
              }
            }
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "Contributor"
      },
      "Subject": {
        "https://schema.hbp.eu/searchUi/order": 4,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "species": {
            "https://schema.hbp.eu/graphQuery/label": "Species",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "sex": {
            "https://schema.hbp.eu/graphQuery/label": "Sex",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "age": {
            "https://schema.hbp.eu/graphQuery/label": "Age",
            "https://schema.hbp.eu/searchUi/overview": true
          },
          "agecategory": {
            "https://schema.hbp.eu/graphQuery/label": "Age category",
            "https://schema.hbp.eu/searchUi/overview": true
          },
          "weight": {
            "https://schema.hbp.eu/graphQuery/label": "Weight"
          },
          "strain": {
            "https://schema.hbp.eu/graphQuery/label": "Strain",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "genotype": {
            "https://schema.hbp.eu/graphQuery/label": "Genotype",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "samples": {
            "https://schema.hbp.eu/graphQuery/label": "Samples",
            "https://schema.hbp.eu/searchUi/hint": "List of samples that have been obtained from a given subject.",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/aggregate": "count"
          },
          "datasets": {
            "https://schema.hbp.eu/graphQuery/label": "Datasets",
            "https://schema.hbp.eu/searchUi/hint": "List of datasets in which the subject was used to produce data.",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "children": {
              "component": {},
              "name": {}
            }
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "datasetExists": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/facet": "exists"
          }
        },
        "http://schema.org/name": "Subject"
      },
      "Project": {
        "https://schema.hbp.eu/searchUi/order": 1,
        "https://schema.hbp.eu/searchUi/searchable": true,
        "https://schema.hbp.eu/searchUi/ribbon": {
          "https://schema.hbp.eu/searchUi/icon": "download",
          "https://schema.hbp.eu/searchUi/framed": {
            "https://schema.hbp.eu/searchUi/aggregation": "count",
            "https://schema.hbp.eu/searchUi/dataField": "search:datasets",
            "https://schema.hbp.eu/searchUi/suffix": {
              "https://schema.hbp.eu/searchUi/singular": "dataset",
              "https://schema.hbp.eu/searchUi/plural": "datasets"
            }
          },
          "https://schema.hbp.eu/searchUi/content": "Datasets"
        },
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 7.5
          },
          "dataset": {
            "https://schema.hbp.eu/graphQuery/label": "Datasets",
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "publications": {
            "https://schema.hbp.eu/graphQuery/label": "Related publications",
            "https://schema.hbp.eu/searchUi/hint": "List of publications that have been published as a part of this project.",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "Project"
      },
      "DatasetVersions": {
        "https://schema.hbp.eu/searchUi/order": 2,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "authors": {
            "https://schema.hbp.eu/graphQuery/label": "Authors",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "custodians": {
            "https://schema.hbp.eu/graphQuery/label": "Custodians",
            "https://schema.hbp.eu/searchUi/hint": "A custodian is the person responsible for the data bundle.",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "citation": {
            "https://schema.hbp.eu/graphQuery/label": "Cite dataset",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "quote-left",
            "https://schema.hbp.eu/searchUi/isButton": true
          },
          "doi": {
            "https://schema.hbp.eu/graphQuery/label": "DOI",
            "https://schema.hbp.eu/searchUi/hint": "This is the dataset DOI representing all the underlying datasets you must cite if you reuse this data in a way that leads to a publication"
          },
          "homepage": {
            "https://schema.hbp.eu/graphQuery/label": "Homepage"
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "datasets": {
            "https://schema.hbp.eu/graphQuery/label": "Dataset versions",
            "https://schema.hbp.eu/searchUi/hint": "List of existing versions of this dataset.",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "children": {
              "version": {
                "https://schema.hbp.eu/graphQuery/label": "Version",
                "https://schema.hbp.eu/searchUi/groupby": true
              },
              "innovation": {
                "https://schema.hbp.eu/graphQuery/label": "Innovation",
                "https://schema.hbp.eu/searchUi/markdown": true
              }
            }
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "DatasetVersions"
      },
      "Model": {
        "https://schema.hbp.eu/searchUi/order": 6,
        "https://schema.hbp.eu/searchUi/searchable": true,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "version": {
            "https://schema.hbp.eu/graphQuery/label": "Version",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "model": {
            "https://schema.hbp.eu/graphQuery/label": "Model Versions"
          },
          "contributors": {
            "https://schema.hbp.eu/graphQuery/label": "Contributors",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "header",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "owners": {
            "https://schema.hbp.eu/graphQuery/label": "Custodian",
            "https://schema.hbp.eu/searchUi/hint": "A custodian is the person responsible for the data bundle.",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "mainContact": {
            "https://schema.hbp.eu/graphQuery/label": "Main contact",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "embargo": {
            "https://schema.hbp.eu/graphQuery/label": "Files",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "allfiles": {
            "https://schema.hbp.eu/graphQuery/label": "Download model",
            "https://schema.hbp.eu/searchUi/icon": "download",
            "https://schema.hbp.eu/searchUi/isButton": true,
            "https://schema.hbp.eu/searchUi/termsOfUse": true
          },
          "publications": {
            "https://schema.hbp.eu/graphQuery/label": "Publications",
            "https://schema.hbp.eu/searchUi/hint": "List of publications that have been published as a part of this model.",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "brainStructures": {
            "https://schema.hbp.eu/graphQuery/label": "Brain structure",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "cellularTarget": {
            "https://schema.hbp.eu/graphQuery/label": "(Sub)cellular target",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "studyTarget": {
            "https://schema.hbp.eu/graphQuery/label": "Study target",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "modelScope": {
            "https://schema.hbp.eu/graphQuery/label": "Model scope",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "abstractionLevel": {
            "https://schema.hbp.eu/graphQuery/label": "Abstraction level",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "modelFormat": {
            "https://schema.hbp.eu/graphQuery/label": "Model format",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "usedDataset": {
            "https://schema.hbp.eu/graphQuery/label": "Used datasets",
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "producedDataset": {
            "https://schema.hbp.eu/graphQuery/label": "Produced datasets",
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "license_info": {
            "https://schema.hbp.eu/graphQuery/label": "License",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet_order": "byvalue"
          }
        },
        "http://schema.org/name": "Model"
      },
      "Software": {
        "https://schema.hbp.eu/searchUi/order": 7,
        "https://schema.hbp.eu/searchUi/searchable": true,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/boost": 20
          },
          "editorId": {
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "developers": {
            "https://schema.hbp.eu/graphQuery/label": "Developers",
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/layout": "header",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "citation": {
            "https://schema.hbp.eu/graphQuery/label": "Cite software",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/icon": "quote-left",
            "https://schema.hbp.eu/searchUi/isButton": true
          },
          "licenseOld": {
            "https://schema.hbp.eu/graphQuery/label": "License",
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet_order": "byvalue",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "license": {
            "https://schema.hbp.eu/graphQuery/label": "License",
            "https://schema.hbp.eu/searchUi/type": "text"
          },
          "copyright": {
            "https://schema.hbp.eu/graphQuery/label": "Copyright",
            "https://schema.hbp.eu/searchUi/type": "text"
          },
          "projects": {
            "https://schema.hbp.eu/graphQuery/label": "Project",
            "https://schema.hbp.eu/searchUi/boost": 10,
            "https://schema.hbp.eu/searchUi/order": 3
          },
          "custodians": {
            "https://schema.hbp.eu/graphQuery/label": "Custodians",
            "https://schema.hbp.eu/searchUi/hint": "A custodian is the person responsible for the data bundle.",
            "https://schema.hbp.eu/searchUi/separator": "; ",
            "https://schema.hbp.eu/searchUi/boost": 10
          },
          "homepageOld": {
            "https://schema.hbp.eu/graphQuery/label": "Homepage"
          },
          "homepage": {
            "https://schema.hbp.eu/graphQuery/label": "Homepage"
          },
          "sourceCodeOld": {
            "https://schema.hbp.eu/graphQuery/label": "Source code"
          },
          "sourceCode": {
            "https://schema.hbp.eu/graphQuery/label": "Source code"
          },
          "documentation": {
            "https://schema.hbp.eu/graphQuery/label": "Documentation"
          },
          "support": {
            "https://schema.hbp.eu/graphQuery/label": "Support"
          },
          "description": {
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/boost": 2
          },
          "publications": {
            "https://schema.hbp.eu/graphQuery/label": "Related publications",
            "https://schema.hbp.eu/searchUi/markdown": true,
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "versionOld": {
            "https://schema.hbp.eu/graphQuery/label": "Latest Version",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "appCategoryOld": {
            "https://schema.hbp.eu/graphQuery/label": "Application Category",
            "https://schema.hbp.eu/searchUi/separator": ", ",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "appCategory": {
            "https://schema.hbp.eu/graphQuery/label": "Application Category",
            "https://schema.hbp.eu/searchUi/separator": ", ",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "licenseForFilter": {
            "https://schema.hbp.eu/graphQuery/label": "License",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/type": "text",
            "https://schema.hbp.eu/searchUi/facet_order": "bycount",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "operatingSystemOld": {
            "https://schema.hbp.eu/graphQuery/label": "Operating System",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/tag_icon": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 11.377083 13.05244\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 5.6585847,-3.1036376e-7 2.8334327,1.5730297 0.0088,3.1455497 0.0047,6.4719597 0,9.7983697 2.8323857,11.42515 l 2.831867,1.62729 1.070218,-0.60358 c 0.588756,-0.33201 1.874409,-1.06813 2.856675,-1.63608 L 11.377083,9.7797697 v -3.24735 -3.24786 l -0.992187,-0.62477 C 9.8391917,2.3160397 8.5525477,1.5769697 7.5256387,1.0175097 Z M 5.6580697,3.7398297 a 2.7061041,2.7144562 0 0 1 2.706293,2.71456 2.7061041,2.7144562 0 0 1 -2.706293,2.71456 2.7061041,2.7144562 0 0 1 -2.70578,-2.71456 2.7061041,2.7144562 0 0 1 2.70578,-2.71456 z\"/></svg>",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "operatingSystem": {
            "https://schema.hbp.eu/graphQuery/label": "Operating System",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "devices": {
            "https://schema.hbp.eu/graphQuery/label": "Devices",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "programmingLanguages": {
            "https://schema.hbp.eu/graphQuery/label": "Programming languages",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list"
          },
          "requirements": {
            "https://schema.hbp.eu/graphQuery/label": "Requirements"
          },
          "featuresOld": {
            "https://schema.hbp.eu/graphQuery/label": "Features",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/tag_icon": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M576 448q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm1067 576q0 53-37 90l-491 492q-39 37-91 37-53 0-90-37l-715-716q-38-37-64.5-101t-26.5-117v-416q0-52 38-90t90-38h416q53 0 117 26.5t102 64.5l715 714q37 39 37 91z\"/></svg>"
          },
          "features": {
            "https://schema.hbp.eu/graphQuery/label": "Features",
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/facet": "list",
            "https://schema.hbp.eu/searchUi/isFilterableFacet": true
          },
          "languages": {
            "https://schema.hbp.eu/graphQuery/label": "Languages",
            "https://schema.hbp.eu/searchUi/layout": "summary"
          },
          "keywords": {
            "https://schema.hbp.eu/graphQuery/label": "Keywords",
            "https://schema.hbp.eu/searchUi/overview": true,
            "https://schema.hbp.eu/searchUi/overviewMaxDisplay": 3,
            "https://schema.hbp.eu/searchUi/layout": "summary",
            "https://schema.hbp.eu/searchUi/tag_icon": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M576 448q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm1067 576q0 53-37 90l-491 492q-39 37-91 37-53 0-90-37l-715-716q-38-37-64.5-101t-26.5-117v-416q0-52 38-90t90-38h416q53 0 117 26.5t102 64.5l715 714q37 39 37 91z\"/></svg>",
            "https://schema.hbp.eu/searchUi/order": 1,
            "https://schema.hbp.eu/searchUi/facet": "list",
            "https://schema.hbp.eu/searchUi/isFilterableFacet": true
          },
          "inputFormatsForFilter": {
            "https://schema.hbp.eu/graphQuery/label": "Input formats",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/facet": "list",
            "https://schema.hbp.eu/searchUi/isFilterableFacet": true
          },
          "outputFormatsForFilter": {
            "https://schema.hbp.eu/graphQuery/label": "Output formats",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/facet": "list",
            "https://schema.hbp.eu/searchUi/isFilterableFacet": true
          },
          "inputFormat": {
            "https://schema.hbp.eu/graphQuery/label": "Input formats",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "children": {
              "name": {
                "https://schema.hbp.eu/graphQuery/label": "Name",
                "https://schema.hbp.eu/searchUi/sort": true
              },
              "fileExtensions": {
                "https://schema.hbp.eu/graphQuery/label": "File extensions",
                "https://schema.hbp.eu/searchUi/sort": true
              },
              "relatedMediaType": {
                "https://schema.hbp.eu/graphQuery/label": "Media type",
                "https://schema.hbp.eu/searchUi/sort": true
              }
            }
          },
          "outputFormats": {
            "https://schema.hbp.eu/graphQuery/label": "Output formats",
            "https://schema.hbp.eu/searchUi/layout": "group",
            "https://schema.hbp.eu/searchUi/isTable": true,
            "children": {
              "name": {
                "https://schema.hbp.eu/graphQuery/label": "Name",
                "https://schema.hbp.eu/searchUi/sort": true
              },
              "fileExtensions": {
                "https://schema.hbp.eu/graphQuery/label": "File extensions",
                "https://schema.hbp.eu/searchUi/sort": true
              },
              "relatedMediaType": {
                "https://schema.hbp.eu/graphQuery/label": "Media type",
                "https://schema.hbp.eu/searchUi/sort": true
              }
            }
          },
          "components": {
            "https://schema.hbp.eu/graphQuery/label": "Sub-components",
            "https://schema.hbp.eu/searchUi/layout": "group"
          },
          "first_release": {
            "https://schema.hbp.eu/graphQuery/label": "First release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          },
          "last_release": {
            "https://schema.hbp.eu/graphQuery/label": "Last release",
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true,
            "https://schema.hbp.eu/searchUi/type": "date"
          }
        },
        "http://schema.org/name": "Software"
      },
      "Controlled term": {
        "https://schema.hbp.eu/searchUi/order": 12,
        "fields": {
          "id": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "identifier": {
            "https://schema.hbp.eu/searchUi/visible": false,
            "https://schema.hbp.eu/searchUi/ignoreForSearch": true
          },
          "title": {
            "https://schema.hbp.eu/graphQuery/label": "Name",
            "https://schema.hbp.eu/searchUi/sort": true,
            "https://schema.hbp.eu/searchUi/label_hidden": true,
            "https://schema.hbp.eu/searchUi/layout": "header"
          },
          "ontologyIdentifier": {
            "https://schema.hbp.eu/graphQuery/label": "Ontology identifier"
          },
          "definition": {
            "https://schema.hbp.eu/graphQuery/label": "Definition"
          },
          "description": {
            "https://schema.hbp.eu/graphQuery/label": "Description"
          },
          "externalDefinitions": {
            "https://schema.hbp.eu/graphQuery/label": "External definitions"
          },
          "synonyms": {
            "https://schema.hbp.eu/graphQuery/label": "Synonyms"
          }
        },
        "http://schema.org/name": "Controlled term"
      },
      "File": {
        "https://schema.hbp.eu/searchUi/order": 13,
        "fields": {},
        "http://schema.org/name": "File"
      }
    }
  };

  return dispatch => {
    dispatch(loadDefinitionRequest());
    API.axios
      .get(API.endpoints.definition())
      .then(({ data }) => {
        // const definition = data && data._source;
        const definition = labels._source;
        simplifySemantics(definition);
        data.authEndpoint && dispatch(setAuthEndpoint(data.authEndpoint));
        data.commit && dispatch(setCommit(data.commit));
        dispatch(loadDefinitionSuccess(definition));
      })
      .catch(e => {
        const { response } = e;
        const { status } = response;
        switch (status) {
        case 401: // Unauthorized
        case 403: // Forbidden
        case 511: // Network Authentication Required
        {
          const error = "Your session has expired. Please login again.";
          dispatch(sessionFailure(error));
          break;
        }
        case 500:
        {
          Sentry.captureException(e);
          break;
        }
        case 404:
        default:
        {
          const error = `The service is temporary unavailable. Please retry in a moment. (${e.message?e.message:e})`;
          dispatch(loadDefinitionFailure(error));
        }
        }
      });
  };
};