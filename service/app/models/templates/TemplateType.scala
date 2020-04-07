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
package models.templates

import play.api.mvc.PathBindable

sealed trait TemplateType {
  def apiName: String
}

object TemplateType {

  def apply(s: String): TemplateType = s.toUpperCase match {
    case "DATASET"        => Dataset
    case "PERSON"         => Person
    case "PROJECT"        => Project
    case "UNIMINDSPERSON" => UnimindsPerson
    case "MODELINSTANCE"  => ModelInstance
    case "SOFTWAREPROJECT" => SoftwareProject
  }

  def toSchema(templateType: TemplateType): String = templateType match {
    case Dataset        => "minds/core/dataset/v1.0.0"
    case Person         => "minds/core/person/v1.0.0"
    case Project        => "minds/core/placomponent/v1.0.0"
    case UnimindsPerson => "uniminds/core/person/v1.0.0"
    case ModelInstance  => "uniminds/core/modelinstance/v1.0.0"
    case SoftwareProject => "softwarecatalog/software/softwareproject/v1.0.0"
  }

  implicit def pathBinder(implicit stringBinder: PathBindable[String]): PathBindable[TemplateType] =
    new PathBindable[TemplateType] {
      override def bind(key: String, value: String): Either[String, TemplateType] = {
        for {
          str <- stringBinder.bind(key, value).right
        } yield TemplateType(str)
      }

      override def unbind(key: String, templateType: TemplateType): String = {
        templateType.toString
      }
    }
}

case object Dataset extends TemplateType {
  override def apiName: String = "Dataset"
}

case object Person extends TemplateType {
  override def apiName: String = "Contributor"
}

case object Project extends TemplateType {
  override def apiName: String = "Project"
}

case object UnimindsPerson extends TemplateType {
  override def apiName: String = "Contributor"
}

case object ModelInstance extends TemplateType {
  override def apiName: String = "Model"
}

case object SoftwareProject extends TemplateType {
  override def apiName: String = "Software"
}
