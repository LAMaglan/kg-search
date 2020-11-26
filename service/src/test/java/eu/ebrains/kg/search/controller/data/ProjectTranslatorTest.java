package eu.ebrains.kg.search.controller.data;

import eu.ebrains.kg.search.controller.utils.TranslatorTestHelper;
import eu.ebrains.kg.search.controller.utils.WebClientHelper;
import eu.ebrains.kg.search.model.DatabaseScope;
import eu.ebrains.kg.search.model.source.ResultOfKGv2;
import eu.ebrains.kg.search.model.source.openMINDSv1.ProjectV1;
import eu.ebrains.kg.search.model.source.openMINDSv1.SubjectV1;
import eu.ebrains.kg.search.model.target.elasticsearch.ElasticSearchDocument;
import org.apache.commons.io.IOUtils;
import org.junit.Assert;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ProjectTranslatorTest {
    private static class ProjectV1Result extends ResultOfKGv2<ProjectV1> { }

    @Test
    public void compareReleasedProjects() {
        compareProjects(DatabaseScope.RELEASED);
    }

    @Test
    public void compareInferredSubjects() {
        compareProjects(DatabaseScope.INFERRED);
    }

    private void compareProjects(DatabaseScope databaseScope) {
        List<String> result = new ArrayList<>();
        ProjectV1Result queryResult = WebClientHelper.executeQuery("query/minds/core/placomponent/v1.0.0/search", databaseScope, ProjectV1Result.class);
        queryResult.getResults().forEach(project -> {
            String id = project.getIdentifier();
            Map<String, Object> expected = WebClientHelper.getDocument(databaseScope.equals(DatabaseScope.RELEASED)?"public":"curated", "Subject", id, ElasticSearchDocument.class).getSource();
            List<String> messages = TranslatorTestHelper.compareProject(project, expected, databaseScope, false);
            if (!messages.isEmpty()) {
                result.add("\n\n\tSubject: " + id + "\n\t\t" + String.join("\n\t\t", messages));
            }
        });
        if (!result.isEmpty()) {
            Assert.fail(String.join("", result));
        }
    }

    @Test
    public void compareReleasedProject() throws IOException {
        String sourceJson = IOUtils.toString(this.getClass().getResourceAsStream("/v1/projectReleasedSource.json"), StandardCharsets.UTF_8);
        String expectedJson = IOUtils.toString(this.getClass().getResourceAsStream("/v2/projectReleasedTarget.json"), StandardCharsets.UTF_8);
        List<String> result = TranslatorTestHelper.compareProject(sourceJson, expectedJson, DatabaseScope.RELEASED, false);
        if (!result.isEmpty()) {
            Assert.fail("\n\t" + String.join("\n\t", result));
        }
    }

    @Test
    public void compareInferredProject() throws IOException {
        String sourceJson = IOUtils.toString(this.getClass().getResourceAsStream("/v1/projectInferredSource.json"), StandardCharsets.UTF_8);
        String expectedJson = IOUtils.toString(this.getClass().getResourceAsStream("/v2/projectInferredTarget.json"), StandardCharsets.UTF_8);
        List<String> result = TranslatorTestHelper.compareProject(sourceJson, expectedJson, DatabaseScope.INFERRED, false);
        if (!result.isEmpty()) {
            Assert.fail("\n\t" + String.join("\n\t", result));
        }

    }

    @Test
    public void compareInferredLiveProject() throws IOException {
        String sourceJson = IOUtils.toString(this.getClass().getResourceAsStream("/v1/projectInferredSource.json"), StandardCharsets.UTF_8);
        String expectedJson = IOUtils.toString(this.getClass().getResourceAsStream("/v2/projectInferredLiveTarget.json"), StandardCharsets.UTF_8);
        List<String> result = TranslatorTestHelper.compareProject(sourceJson, expectedJson, DatabaseScope.INFERRED, true);
        if (!result.isEmpty()) {
            Assert.fail("\n\t" + String.join("\n\t", result));
        }
    }
}
