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

package eu.ebrains.kg.search.model.source.openMINDSv1;

import eu.ebrains.kg.search.model.source.SourceInstanceV1andV2;
import eu.ebrains.kg.search.model.source.commonsV1andV2.Publication;
import eu.ebrains.kg.search.model.source.commonsV1andV2.SourceInternalReference;

import java.util.List;

public class ProjectV1 extends SourceInstanceV1andV2 {
    private String description;
    private List<SourceInternalReference> datasets;
    private String title;
    private List<Publication> publications;

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public List<SourceInternalReference> getDatasets() { return datasets; }

    public void setDatasets(List<SourceInternalReference> datasets) { this.datasets = datasets; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public List<Publication> getPublications() { return publications; }

    public void setPublications(List<Publication> publications) { this.publications = publications; }
}
