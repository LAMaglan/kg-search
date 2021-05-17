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

package eu.ebrains.kg.search.controller.translators;

import eu.ebrains.kg.search.model.DataStage;
import eu.ebrains.kg.search.model.source.openMINDSv3.FileV3;
import eu.ebrains.kg.search.model.target.elasticsearch.instances.File;
import eu.ebrains.kg.search.utils.IdUtils;
import org.apache.commons.lang3.StringUtils;

public class FileOfKGV3Translator implements Translator<FileV3, File> {

    public File translate(FileV3 file, DataStage dataStage, boolean liveMode) {
        if(file.getFileRepository() == null) {
            return null;
        }
        File f = new File();
        f.setFileRepository(IdUtils.getUUID(file.getFileRepository()));
        f.setIri(file.getIri());
        f.setId(IdUtils.getUUID(file.getId()));
        f.setIdentifier(IdUtils.getUUID(file.getIdentifier()));
        f.setName(file.getName());
        FileV3.Size size = file.getSize();
        if(size != null && StringUtils.isNotBlank(size.getUnit())) {
            f.setSize(String.format("%d %s", size.getValue(), size.getUnit()));
        }
        f.setFormat(file.getFormat());
        return f;
    }
}
