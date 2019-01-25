/*
 *   Copyright (c) 2019, EPFL/Human Brain Project PCO
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
package services.suggestion

import com.google.inject.Inject
import models.errors.{APIEditorError, APIEditorMultiError}
import models.instance.{NexusInstance, NexusInstanceReference, SuggestionInstance}
import models.user.NexusUser
import play.api.libs.ws.WSClient
import play.api.http.Status._
import services.ConfigurationService
import services.instance.InstanceApiService
import services.suggestion.SuggestionService.UserID

import scala.concurrent.{ExecutionContext, Future}

class SuggestionService @Inject()(wSClient: WSClient, config: ConfigurationService)(
  implicit executionContext: ExecutionContext
) {
  object SuggestionApiService extends SuggestionApiService

  def addUsersToInstance(
    instance: NexusInstanceReference,
    users: List[UserID],
    token: String
  ): Future[Either[APIEditorMultiError, Unit]] = {
    val f: List[Future[Either[APIEditorError, Unit]]] = for {
      id <- users
    } yield SuggestionApiService.addUserToSuggestionInstance(wSClient, config.kgQueryEndpoint, instance, id, token)

    Future.sequence(f).map { l =>
      val err = l.collect {
        case Left(e) => e
      }
      if (err.isEmpty) {
        Right(())
      } else {
        Left(APIEditorMultiError(INTERNAL_SERVER_ERROR, err))
      }
    }
  }

  def acceptSuggestion(
    nexusInstanceReference: NexusInstanceReference,
    token: String
  ): Future[Either[APIEditorError, Unit]] = {
    SuggestionApiService.acceptSuggestion(wSClient, config.kgQueryEndpoint, nexusInstanceReference, token)
  }

  def rejectSuggestion(
    nexusInstanceReference: NexusInstanceReference,
    token: String
  ): Future[Either[APIEditorError, Unit]] = {
    SuggestionApiService.rejectSuggestion(wSClient, config.kgQueryEndpoint, nexusInstanceReference, token)
  }

  def getUsersSuggestions(token: String): Future[Either[APIEditorError, List[SuggestionInstance]]] = {
    SuggestionApiService.getUsersSuggestions(wSClient, config.kgQueryEndpoint, token)
  }

  def getInstanceSuggestions(
    ref: NexusInstanceReference,
    token: String
  ): Future[Either[APIEditorError, List[SuggestionInstance]]] = {
    SuggestionApiService.getInstanceSuggestions(wSClient, config.kgQueryEndpoint, ref, token)
  }
}

object SuggestionService {
  type UserID = String
}
