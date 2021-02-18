package eu.ebrains.kg.search.controller.translators;

import eu.ebrains.kg.search.model.DataStage;
import eu.ebrains.kg.search.model.source.openMINDSv2.SoftwareV2;
import eu.ebrains.kg.search.model.target.elasticsearch.instances.Software;
import eu.ebrains.kg.search.model.target.elasticsearch.instances.commons.TargetExternalReference;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;

import java.util.Comparator;
import java.util.stream.Collectors;

import static eu.ebrains.kg.search.controller.translators.TranslatorCommons.*;

public class SoftwareTranslator implements Translator<SoftwareV2, Software> {

    public Software translate(SoftwareV2 softwareV2, DataStage dataStage, boolean liveMode) {
        Software s = new Software();
        if (!CollectionUtils.isEmpty(softwareV2.getVersions())) {
            softwareV2.getVersions().sort(Comparator.comparing(SoftwareV2.Version::getVersion).reversed());
        }
        SoftwareV2.Version version = firstItemOrNull(softwareV2.getVersions());

        if (dataStage == DataStage.IN_PROGRESS) {
            s.setEditorId(softwareV2.getEditorId());
        }
        s.setAppCategory(emptyToNull(version.getApplicationCategory()));
        s.setIdentifier(softwareV2.getIdentifier());
        s.setTitle(softwareV2.getTitle());

        s.setDescription(softwareV2.getDescription() + (StringUtils.isBlank(version.getDescription())? "": ("\n\n" + version.getDescription())));

        if (!CollectionUtils.isEmpty(version.getSourceCode())) {
            s.setSourceCode(version.getSourceCode().stream()
                    .map(sc -> new TargetExternalReference(sc, sc))
                    .collect(Collectors.toList()));
        }
        s.setFeatures(emptyToNull(version.getFeatures()));
        if (!CollectionUtils.isEmpty(version.getDocumentation())) {
            s.setDocumentation(version.getDocumentation().stream()
                    .map(d -> new TargetExternalReference(d, d))
                    .collect(Collectors.toList()));
        }
        s.setLicense(emptyToNull(version.getLicense()));
        s.setOperatingSystem(emptyToNull(version.getOperatingSystem()));
        s.setVersion(version.getVersion());
        if (!CollectionUtils.isEmpty(version.getHomepage())) {
            s.setHomepage(version.getHomepage().stream()
                    .map(h -> new TargetExternalReference(h, h))
                    .collect(Collectors.toList()));
        }
        s.setFirstRelease(softwareV2.getFirstReleaseAt());
        s.setLastRelease(softwareV2.getLastReleaseAt());
        return s;
    }
}
