package eu.ebrains.kg.search.model.source.openMINDSv1;

import eu.ebrains.kg.search.model.source.commons.Publication;
import eu.ebrains.kg.search.model.source.commons.InternalReference;

import java.util.Date;
import java.util.List;

public class ProjectV1 {
    private Date firstReleaseAt;
    private String description;
    private Date lastReleaseAt;
    private List<InternalReference> datasets;
    private String title;
    private List<Publication> publications;
    private String identifier;
    private String editorId;
    private List<Container> container;

    public Date getFirstReleaseAt() { return firstReleaseAt; }

    public void setFirstReleaseAt(Date firstReleaseAt) { this.firstReleaseAt = firstReleaseAt; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public Date getLastReleaseAt() { return lastReleaseAt; }

    public void setLastReleaseAt(Date lastReleaseAt) { this.lastReleaseAt = lastReleaseAt; }

    public List<InternalReference> getDatasets() { return datasets; }

    public void setDatasets(List<InternalReference> datasets) { this.datasets = datasets; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public List<Publication> getPublications() { return publications; }

    public void setPublications(List<Publication> publications) { this.publications = publications; }

    public String getIdentifier() { return identifier; }

    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getEditorId() { return editorId; }

    public void setEditorId(String editorId) { this.editorId = editorId; }

    public List<Container> getContainer() { return container; }

    public void setContainer(List<Container> container) { this.container = container; }

    public static class Container {
        private String relativeUrl;

        public String getRelativeUrl() { return relativeUrl; }

        public void setRelativeUrl(String relativeUrl) { this.relativeUrl = relativeUrl; }
    }

}
