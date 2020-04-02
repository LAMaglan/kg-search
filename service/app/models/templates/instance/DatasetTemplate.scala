/*
 *   Copyright (c) 2020, EPFL/Human Brain Project PCO
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
package models.templates.instance

import java.net.URLEncoder

import models.{DatabaseScope, INFERRED}
import models.templates.Template
import models.templates.entities.{ValueObject, _}
import utils._

import scala.collection.immutable.HashMap

trait DatasetTemplate extends Template {
  def fileProxy: String

  def dataBaseScope: DatabaseScope

  val result: Map[String, TemplateComponent] = HashMap(
    "identifier" -> Value[String]("identifier", identity),
    "title" -> Value[String]("title", identity),
    "contributors" -> ObjectListReader(
      "contributors",
      ObjectValue(
        List(
          Reference("relativeUrl", ref => ref.map(TemplateHelper.schemaIdToSearchId("Contributor"))),
          Value[String]("name", identity)
        )
      )
    ),
    "citation" -> Merge(
      FirstElement(ValueList[String]("citation", identity)),
      FirstElement(ValueList[String]("doi", doi => {
        doi.map(doiStr => {
          val url = URLEncoder.encode(doiStr, "UTF-8")
          s" [DOI: $doiStr]\n[DOI: $doiStr]: https://doi.org/$url"
        })
      })),
      l =>
        r => {
          (l, r) match {
            case (Some(ValueObject(maybeCitation: Option[String])), Some(ValueObject(maybeDoi: Option[String]))) =>
              val strOpt = for {
                citationStr <- maybeCitation
                doiStr <- maybeDoi
              } yield citationStr + doiStr
              strOpt.map(s => ValueObject[String](Some(s)))
            case _ => None
          }
      }
    ),
    "zip" -> Value[String]("zip", identity),
    "dataDescriptor" -> Optional(Value[String]("dataDescriptor", identity)),
    "doi" -> FirstElement(ValueList[String]("doi", identity)),
    "license_info" -> FirstElement(
      ObjectListReader("license", ObjectValue(List(Url("url"), Value[String]("name", identity))))
    ),
    "component" -> FirstElement(
      ObjectListReader(
        "component",
        ObjectValue(
          List(
            Reference("relativeUrl", ref => ref.map(TemplateHelper.schemaIdToSearchId("Project"))),
            Value[String]("name", identity)
          )
        )
      )
    ),
    "owners" -> FirstElement(
      ObjectListReader(
        "owners",
        ObjectValue(
          List(
            Reference("relativeUrl", ref => ref.map(TemplateHelper.schemaIdToSearchId("Contributor"))),
            Value[String]("name", identity)
          )
        )
      )
    ),
    "description" -> Value[String]("description", identity),
    "speciesFilter" -> FirstElement(ValueList[String]("speciesFilter", identity)),
    "embargoForFilter" -> FirstElement(ValueList[String]("embargoForFilter", identity)),
    "embargo" -> Optional(
      FirstElement(
        ValueList[String](
          "embargo", {
            case ValueObject(Some("Embargoed")) =>
              ValueObject[String](
                Some(
                  "This dataset is temporarily under embargo. The data will become available for download after the embargo period."
                )
              )
            case ValueObject(Some("Under review")) =>
              ValueObject[String](
                Some(
                  "This dataset is currently reviewed by the Data Protection Office regarding GDPR compliance. The data will be available after this review."
                )
              )
            case _ => ValueObject[String](None)
          }
        )
      )
    ),
    "files" -> Optional(
      Merge(
        FirstElement(ValueList[String]("embargo", identity)),
        ObjectListReader(
          "files",
          ObjectValue(
            List(
              Merge(
                ObjectValue(List(Url("absolute_path"), Value[String]("name", identity))),
                Value[Boolean]("private_access", identity),
                urlOpt =>
                  privateAccesOpt => {
                    (urlOpt, privateAccesOpt) match {
                      case (
                          Some(ObjectValueMap(List(UrlObject(url), ValueObject(name: Option[String])))),
                          Some(ValueObject(privateAccess: Option[Boolean]))
                          ) =>
                        val opt = for {
                          privateAccessVal <- privateAccess
                          if privateAccessVal
                          urlStr <- url
                          nameStr <- name
                        } yield
                          ObjectValueMap(
                            List(
                              UrlObject(Some(s"$fileProxy/files/cscs?url=$urlStr")),
                              ValueObject[String](Some(s"ACCESS PROTECTED: $nameStr"))
                            )
                          )
                        opt.orElse(urlOpt)
                      case _ => urlOpt
                    }

                }
              ),
              CustomField[String]("human_readable_size", "fileSize", identity),
              Optional(
                Merge(
                  FirstElement(ValueList[String]("preview_url", identity)),
                  FirstElement(ValueList[String]("is_preview_animated", identity)),
                  previewOpt =>
                    isAnimatedOpt => {
                      (previewOpt, isAnimatedOpt) match {
                        case (
                            Some(ValueObject(preview: Option[String])),
                            Some(ValueObject(isAnimated: Option[String]))
                            ) =>
                          for {
                            previewVal <- preview
                            isAnimatedStr <- isAnimated
                          } yield
                            NestedObject(
                              "previewUrl",
                              ObjectValueMap(
                                List(
                                  UrlObject(Some(previewVal)),
                                  CustomObject("isAnimated", Some(isAnimatedStr.toBoolean.toString))
                                )
                              )
                            )

                        case _ => None
                      }

                  }
                )
              )
            )
          )
        ),
        embargoOpt =>
          filesOpt => {
            embargoOpt.fold(filesOpt)(_ => None)
        }
      )
    ),
    "external_datalink" -> ObjectValue(List(Url("external_datalink"), Value[String]("external_datalink", identity))),
    "publications" -> ObjectListReader(
      "publications",
      Merge(
        Value[String]("citation", identity),
        Value[String]("doi", doi => {
          doi.map { doiStr =>
            val url = URLEncoder.encode(doiStr, "UTF-8")
            s"[DOI: $doiStr]\n[DOI: $doiStr]: https://doi.org/$url"
          }
        }),
        citation =>
          doi => {
            (citation, doi) match {
              case (Some(citationObj: ValueObject[String]), Some(doiObj: ValueObject[String])) =>
                val strOpt = for {
                  citationStr <- citationObj.value
                  doiStr <- doiObj.value
                } yield citationStr + "\n" + doiStr
                strOpt.map(str => ValueObject[String](Some(str)))
              case _ => doi
            }
        }
      )
    ),
    "atlas" -> FirstElement(ValueList[String]("parcellationAtlas", identity)),
    "region" -> ObjectListReader(
      "parcellationRegion",
      ObjectValue(List(Url("url"), OrElse(Value[String]("alias", identity), Value[String]("name", identity))))
    ),
    "preparation" -> FirstElement(ValueList[String]("preparation", identity)),
    "methods" -> ValueList[String]("methods", identity),
    "protocol" -> ValueList[String]("protocol", identity),
    "viewer" ->
    OrElse(
      ObjectListReader(
        "brainviewer",
        ObjectValue(
          List(Url("url"), Value[String]("name", js => js.map(str => "Show " + str + " in brain atlas viewer")))
        )
      ),
      ObjectListReader(
        "neuroglancer",
        ObjectValue(
          List(Url("url"), Value[String]("title", js => js.map(str => "Show " + str + " in brain atlas viewer")))
        )
      )
    ),
    "subjects" -> ObjectListReader(
      "subjects",
      ObjectValue(
        List(
          Nested(
            "subject_name",
            ObjectValue(
              List(
                Reference("identifier", ref => ref.map(TemplateHelper.refUUIDToSearchId("Subject"))),
                Value[String]("name", identity),
              )
            )
          ),
          Nested("species", FirstElement(ValueList[String]("species", identity))),
          Nested("sex", FirstElement(ValueList[String]("sex", identity))),
          Nested("age", Value[String]("age", identity)),
          Nested("agecategory", FirstElement(ValueList[String]("agecategory", identity))),
          Nested("weight", Value[String]("weight", identity)),
          Nested("strain", Optional(Value[String]("strain", identity))),
          Nested("genotype", Value[String]("genotype", identity)),
          Nested(
            "samples",
            ObjectListReader(
              "samples",
              ObjectValue(
                List(
                  Reference("identifier", ref => ref.map(TemplateHelper.refUUIDToSearchId("Sample"))),
                  Value[String]("name", identity)
                )
              )
            )
          )
        ), { a =>
          ObjectValueMap(List(NestedObject("children", a)))
        }
      )
    ),
    "first_release" -> Value[String]("first_release", identity),
    "last_release" -> Value[String]("last_release", identity),
  )

  val template: Map[String, TemplateComponent] = dataBaseScope match {
    case INFERRED => HashMap("editorId" -> Value[String]("editorId", identity)) ++ result
    case _        => result
  }
}
