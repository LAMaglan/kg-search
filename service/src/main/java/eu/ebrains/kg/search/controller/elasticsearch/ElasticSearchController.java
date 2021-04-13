package eu.ebrains.kg.search.controller.elasticsearch;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.search.model.DataStage;
import eu.ebrains.kg.search.model.target.elasticsearch.ElasticSearchDocument;
import eu.ebrains.kg.search.model.target.elasticsearch.TargetInstance;
import eu.ebrains.kg.search.services.ESServiceClient;
import eu.ebrains.kg.search.utils.ESHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class ElasticSearchController {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ESServiceClient esServiceClient;
    private final int ESOperationsMaxCharPayload = 1000000;

    public ElasticSearchController(ESServiceClient esServiceClient) {
        this.esServiceClient = esServiceClient;
    }

    public void recreateSearchIndex(Map<String, Object> mapping, String type, DataStage dataStage) {
        String index = ESHelper.getSearchIndex(type, dataStage);
        try {
            esServiceClient.deleteIndex(index);
        } catch (WebClientResponseException e) {
            if(e.getStatusCode() != HttpStatus.NOT_FOUND) {
                throw  e;
            }
        }
        esServiceClient.createIndex(index, mapping);
    }

    public void recreateIdentifiersIndex(Map<String, Object> mapping, DataStage dataStage) {
        String index = ESHelper.getIdentifierIndex(dataStage);
        try {
            esServiceClient.deleteIndex(index);
        } catch (WebClientResponseException e) {
            if(e.getStatusCode() != HttpStatus.NOT_FOUND) {
                throw  e;
            }
        }
        esServiceClient.createIndex(index, mapping);
    }

    private List<StringBuilder> getInsertOperations(List<TargetInstance> instances) {
        List<StringBuilder> result = new ArrayList<>();
        if (CollectionUtils.isEmpty(instances)) {
            return result;
        }
        result.add(new StringBuilder());
        instances.forEach(instance -> {
            StringBuilder operations = result.get(result.size() - 1);
            if (operations.length() > ESOperationsMaxCharPayload) {
                operations = new StringBuilder();
                result.add(operations);
            }
            operations.append(String.format("{ \"index\" : { \"_id\" : \"%s\" } } \n", instance.getId()));
            try {
                operations.append(objectMapper.writeValueAsString(instance)).append("\n");
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        });
        return result;
    }
    private List<StringBuilder> getDeleteOperations(String index, List<TargetInstance> instances) {
        HashSet<String> ids = new HashSet<>();
        instances.forEach(instance -> ids.add(instance.getIdentifier().get(0)));
        List<StringBuilder> result = new ArrayList<>();
        result.add(new StringBuilder());
        List<ElasticSearchDocument> documents = esServiceClient.getDocuments(index);
        documents.forEach(document -> {
            StringBuilder operations = result.get(result.size() - 1);
            if (operations.length() > ESOperationsMaxCharPayload) {
                operations = new StringBuilder();
                result.add(operations);
            }
            if(!ids.contains(document.getId())) {
                operations.append(String.format("{ \"delete\" : { \"_id\" : \"%s\" } } \n", document.getId()));
            }
        });
        if (result.get(result.size() - 1).length() == 0) {
            result.remove(result.size() - 1);
        };
        return result;
    }

    private void indexDocuments(String index, List<TargetInstance> instances) {
        List<StringBuilder> operationsList = getInsertOperations(instances);
        if (!CollectionUtils.isEmpty(operationsList)) {
            esServiceClient.updateIndex(index, operationsList);
        }
    }
    public void indexSearchDocuments(List<TargetInstance> instances, String type, DataStage dataStage) {
        String index = ESHelper.getSearchIndex(type, dataStage);
        indexDocuments(index, instances);
    }

    public void indexIdentifierDocuments(List<TargetInstance> instances, DataStage dataStage) {
        String index = ESHelper.getIdentifierIndex(dataStage);
        indexDocuments(index, instances);
    }

    private void updateIndex(String index, List<TargetInstance> instances) {
        List<StringBuilder> operationsList = getInsertOperations(instances);
        List<StringBuilder> deleteOperationsList  = getDeleteOperations(index, instances);
        if (deleteOperationsList.size() > 0) {
            operationsList.addAll(deleteOperationsList);
        }
        if (!CollectionUtils.isEmpty(operationsList)) {
            esServiceClient.updateIndex(index, operationsList);
        }
    }
    public void updateSearchIndex(List<TargetInstance> instances, String type, DataStage dataStage) {
        String index = ESHelper.getSearchIndex(type, dataStage);
        updateIndex(index, instances);
    }

    public void updateIdentifiersIndex(List<TargetInstance> instances, String type, DataStage dataStage) {
        String index = ESHelper.getIdentifierIndex(dataStage);
        updateIndex(index, instances);
    }

}

