package eu.ebrains.kg.search.utils;

import eu.ebrains.kg.search.model.DataStage;

public class ESHelper {

    private final static String INDEX_PREFIX_IN_PROGRESS = "in_progress";
    private final static String INDEX_PREFIX_PUBLICLY_RELEASED = "publicly_released";

    private final static String INDEX_SUFFIX_IDENTIFIERS = "identifiers";

    private static String getIndexPrefix(DataStage dataStage) {
        return dataStage == DataStage.IN_PROGRESS ? INDEX_PREFIX_IN_PROGRESS : INDEX_PREFIX_PUBLICLY_RELEASED;
    }

    public static String getIndex(DataStage dataStage, String type) {
        return String.format("%s_searchable_%s", getIndexPrefix(dataStage), type.toLowerCase());
    }

    public static String getIdentifierIndex(DataStage dataStage) {
        return String.format("%s_%s", getIndexPrefix(dataStage), INDEX_SUFFIX_IDENTIFIERS);
    }

    public static String getIndexesForDocument(DataStage dataStage) {
        return String.format("%s_*", getIndexPrefix(dataStage));
    }

    public static String getIndexesForSearch(DataStage dataStage) {
        return String.format("%s_searchable_*", getIndexPrefix(dataStage));
    }

}
