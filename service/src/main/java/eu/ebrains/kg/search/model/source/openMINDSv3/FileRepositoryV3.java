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

package eu.ebrains.kg.search.model.source.openMINDSv3;

import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class FileRepositoryV3 extends SourceInstanceV3 {
    private String IRI;
    private List<File> files;
    private String filesStatus; // Workaround to check if a repo contains files

    public String getIRI() { return IRI; }

    public void setIRI(String IRI) { this.IRI = IRI; }

    public List<File> getFiles() { return files; }

    public void setFiles(List<File> files) { this.files = files; }

    public String getFilesStatus() { return filesStatus; }

    public boolean hasFiles() { return StringUtils.isNotBlank(filesStatus); }

    public void setFilesStatus(String filesStatus) { this.filesStatus = filesStatus; }

    public static class File {
        private String name;
        private String IRI;
        private Size size;
        private String format;

        public String getName() { return name; }

        public void setName(String name) { this.name = name; }

        public String getIRI() { return IRI; }

        public void setIRI(String IRI) { this.IRI = IRI; }

        public Size getSize() { return size; }

        public void setSize(Size size) { this.size = size; }

        public String getFormat() { return format; }

        public void setFormat(String format) { this.format = format; }
    }

    public static class Size {
        private int value;
        private String unit;

        public int getValue() {
            return value;
        }

        public void setValue(int value) {
            this.value = value;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }
    }
}
