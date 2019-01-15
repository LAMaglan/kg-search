/*
 *   Copyright (c) 2018, EPFL/Human Brain Project PCO
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package services.query

import models.NexusPath
import models.instance.NexusInstanceReference
import play.api.http.HeaderNames._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.http.ContentTypes._
import constants.QueryConstants._

import scala.concurrent.Future

trait QueryService {

  def params(p: (String, Option[_])*): List[(String, String)] = {
    p.foldLeft(List[(String, String)]()) {
      case (acc, el) =>
        el._2 match {
          case Some(e) => (el._1, e.toString) :: acc
          case _       => acc
        }
    }
  }

  def getInstancesWithId(
    wSClient: WSClient,
    apiEndpoint: String,
    nexusInstanceReference: NexusInstanceReference,
    query: String,
    token: String,
    vocab: Option[String] = None
  ): Future[WSResponse] = {
    wSClient
      .url(s"$apiEndpoint/query/${nexusInstanceReference.nexusPath.toString()}/instances/${nexusInstanceReference.id}")
      .addQueryStringParameters(params(VOCAB -> vocab): _*)
      .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token)
      .post(query)
  }

  def getInstances(
    wSClient: WSClient,
    apiEndpoint: String,
    nexusPath: NexusPath,
    query: String,
    token: String,
    from: Option[Int] = None,
    size: Option[Int] = None,
    search: String,
    vocab: Option[String] = None
  ): Future[WSResponse] = {

    wSClient
      .url(s"$apiEndpoint/query/${nexusPath.toString()}/instances")
      .addQueryStringParameters(params(VOCAB -> vocab, START -> from, SIZE -> size, SEARCH -> Some(search)): _*)
      .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token)
      .post(query)
  }

}
