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

package eu.ebrains.kg.search.model.target.elasticsearch.instances;

import com.fasterxml.jackson.annotation.JsonIgnore;
import eu.ebrains.kg.search.model.target.elasticsearch.ElasticSearchInfo;
import eu.ebrains.kg.search.model.target.elasticsearch.FieldInfo;
import eu.ebrains.kg.search.model.target.elasticsearch.MetaInfo;
import eu.ebrains.kg.search.model.target.elasticsearch.TargetInstance;
import eu.ebrains.kg.search.model.target.elasticsearch.instances.commons.*;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

@Getter
@Setter
@MetaInfo(name = "Parcellation entity")
public class ParcellationEntity implements TargetInstance {
    @JsonIgnore
    private List<String> allIdentifiers;

    @ElasticSearchInfo(type = "keyword")
    private Value<String> type = new Value<>("Parcellation entity");

    @FieldInfo(visible = false)
    private String id;

    @ElasticSearchInfo(type = "keyword")
    @FieldInfo(visible = false)
    private List<String> identifier;

    @ElasticSearchInfo(type = "keyword")
    private Value<String> category;

    @ElasticSearchInfo(type = "keyword")
    private Value<String> disclaimer;

    @FieldInfo(label = "Name", sort = true, layout = "header", boost = 20)
    private Value<String> title;

    @FieldInfo(label = "Brain atlas")
    private Value<String> brainAtlas;

    @FieldInfo(label = "Related UBERON parcellation")
    private TargetInternalReference relatedUberonTerm;

    @FieldInfo(label = "Is child structure of")
    private List<TargetInternalReference> parents;

    @FieldInfo(label = "Is a parent structure of")
    private List<TargetInternalReference> children;

    @FieldInfo(label = "Ontology identifier")
    private List<Value<String>> ontologyIdentifier;

    @FieldInfo(isTable = true, layout = "Versions")
    private List<Children<VersionWithServiceLink>> versionsTable;

    @FieldInfo(isTable = true, layout = "Viewers")
    private List<Children<VersionWithServiceLink>> viewerLinks;


    @Override
    public boolean isSearchableInstance() {
        return false;
    }

    @Getter
    @Setter
    public static class VersionWithServiceLink {
        @FieldInfo(label = "Version")
        private Value<String> version;

        @FieldInfo
        private TargetExternalReference viewer;

        @FieldInfo(label="Laterality", separator = ", ")
        private List<TargetInternalReference> laterality;

        @FieldInfo(label="Inspired by", separator = ", ")
        private List<TargetInternalReference> inspiredBy;

        @FieldInfo(label="Visualized in", separator = ", ")
        private List<TargetInternalReference> visualizedIn;

    }



}
