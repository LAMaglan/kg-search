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

package eu.ebrains.kg.search.services;

import eu.ebrains.kg.search.configuration.OauthClient;
import eu.ebrains.kg.search.model.DataStage;
import eu.ebrains.kg.search.model.ErrorReport;
import eu.ebrains.kg.search.model.source.ResultsOfKG;
import eu.ebrains.kg.search.model.source.SourceInstanceV1andV2;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class KGV3ServiceClient {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final WebClient serviceAccountWebClient;
    private final WebClient userWebClient;
    private final String kgCoreEndpoint;

    public KGV3ServiceClient(@Qualifier("asServiceAccount") WebClient serviceAccountWebClient, @Qualifier("asUser") WebClient userWebClient, @Value("${kgcore.endpoint}") String kgCoreEndpoint) {
        this.serviceAccountWebClient = serviceAccountWebClient;
        this.userWebClient = userWebClient;
        this.kgCoreEndpoint = kgCoreEndpoint;
    }

    public <T> T executeQueryForIndexing(String queryId, DataStage dataStage, Class<T> clazz) {
        String url = String.format("%s/queries/%s/instances?stage=%s", kgCoreEndpoint, queryId, dataStage);
        return executeCallForIndexing(clazz, url);
    }

    public <T> T executeQueryForIndexing(Class<T> clazz, DataStage dataStage, String queryId, int from, int size) {
        String url = String.format("%s/queries/%s/instances?stage=%s&from=%d&size=%d", kgCoreEndpoint, queryId, dataStage, from, size);
        return executeCallForIndexing(clazz, url);
    }

    public <T> T executeQueryForIndexing(Class<T> clazz, DataStage dataStage, String queryId, int from, int size, Map<String, String> params) {
        StringBuilder p = new StringBuilder();
        for (Map.Entry<String, String> param : params.entrySet()) {
            p.append(String.format("&%s=%s", param.getKey(), URLEncoder.encode(param.getValue(), StandardCharsets.UTF_8)));
        }
        String url = String.format("%s/queries/%s/instances?stage=%s&from=%d&size=%d%s", kgCoreEndpoint, queryId, dataStage, from, size, p);
        return executeCallForIndexing(clazz, url);
    }

    public <T> T executeQueryForIndexing(Class<T> clazz, DataStage dataStage, String queryId, String id) {
        String url = String.format("%s/queries/%s/instances?stage=%s&instanceId=%s", kgCoreEndpoint, queryId, dataStage, id);
        return executeCallForIndexing(clazz, url);
    }

    public <T> T executeQuery(Class<T> clazz, DataStage dataStage, String queryId, String id) {
        String url = String.format("%s/queries/%s/instances?stage=%s&instanceId=%s", kgCoreEndpoint, queryId, dataStage, id);
        return executeCallForLive(clazz, url);
    }

    public Map getInstance(String id, DataStage dataStage) {
        String url = String.format("%s/instances/%s?stage=%s&returnIncomingLinks=true", kgCoreEndpoint, id, dataStage);
        return executeCallForLive(Map.class, url);
    }

    public void uploadQuery(String queryId, String payload) {
        String url = String.format("%s/queries/%s?space=kg-search", kgCoreEndpoint, queryId);
        serviceAccountWebClient.put()
                .uri(url)
                .body(BodyInserters.fromValue(payload))
                .headers(h -> h.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }


    private <T> T executeCallForLive(Class<T> clazz, String url) {
       try {
           return userWebClient.get()
                   .uri(url)
                   .headers(h -> h.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE))
                   .retrieve()
                   .bodyToMono(clazz)
                   .doOnSuccess(KGServiceUtils::parsingErrorHandler)
                   .doFinally(t -> OauthClient.ERROR_REPORTING_THREAD_LOCAL.remove())
                   .block();
       } catch (WebClientResponseException.NotFound e){
           return null;
       }
    }


    private <T> T executeCallForIndexing(Class<T> clazz, String url) {
        return serviceAccountWebClient.get()
                .uri(url)
                .headers(h -> h.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE))
                .retrieve()
                .bodyToMono(clazz).doOnSuccess(KGServiceUtils::parsingErrorHandler)
                .doFinally(t -> OauthClient.ERROR_REPORTING_THREAD_LOCAL.remove())
                .block();
    }
}
