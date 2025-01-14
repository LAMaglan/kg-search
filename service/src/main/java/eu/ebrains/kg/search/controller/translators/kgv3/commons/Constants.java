package eu.ebrains.kg.search.controller.translators.kgv3.commons;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@NoArgsConstructor(access= AccessLevel.PRIVATE)
public final class Constants {

    public static final String OPENMINDS_ROOT = "https://openminds.ebrains.eu/";
    public static final String OPENMINDS_INSTANCES = OPENMINDS_ROOT + "instances";

    public final static List<String> VERSION_INNOVATION_DEFAULTS = Arrays.asList("this is the first version of this research product.", "this is the only version of this dataset.");

    public final static List<String> DOMAINS_ALLOWING_EMBEDDING = Arrays.asList();

}
