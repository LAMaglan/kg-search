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
package models.templates.entities

import play.api.libs.json.{Format, JsNull, JsValue, Json, Writes}

case class ValueObject[ReturnType: Format](value: Option[ReturnType]) extends TemplateEntity {
  override type T = ValueObject[ReturnType]

  def map[B: Format](t: ReturnType => B): ValueObject[B] = {
    ValueObject[B](this.value.map(t))
  }
  override def toJson: JsValue = Json.toJson(this)(ValueObject.implicitWrites[ReturnType])

  override def zero: ValueObject[ReturnType] = ValueObject.zero[ReturnType]
}

object ValueObject {
  implicit def implicitWrites[ReturnType: Writes]: Writes[ValueObject[ReturnType]] =
    new Writes[ValueObject[ReturnType]] {

      def writes(u: ValueObject[ReturnType]): JsValue = {
        u.value.fold[JsValue](JsNull)(str => Json.obj("value" -> str))
      }
    }
  def zero[ReturnType: Format]: ValueObject[ReturnType] = ValueObject[ReturnType](None)
}
