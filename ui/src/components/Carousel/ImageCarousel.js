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

import React, { useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./ImageCarousel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ImageCarousel = ({className, width, images, onClick}) => {

  const labelRef = useRef();

  const onClickItem = index => {
    typeof onClick === "function" && !Number.isNaN(Number(index)) && images && images.length && index < images.length && onClick(images[index]);
  };

  if (!images || !images.length) {
    return null;
  }

  return (
    <div className={`kgs-image_carousel ${className?className:""}`}>
      <Carousel width={width} autoPlay interval={3000} infiniteLoop={true} showThumbs={images.length > 1} showIndicators={false} stopOnHover={true} showStatus={false} onClickItem={onClickItem} >
        {images.map(({src, label, hasTarget, isTargetAnimated}) => (
          <div key={src}>
            <img src={src} alt={label?label:""}/>
            {label && (
              <p className="legend" ref={labelRef}>{label}</p>
            )}
            {typeof onClick === "function" && hasTarget && (
              <div className={`kgs-image_carousel-icon ${isTargetAnimated?"is-animated":""}`}>
                <FontAwesomeIcon icon={isTargetAnimated?"play":"search"} size="4x" />
              </div>
            )}
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;