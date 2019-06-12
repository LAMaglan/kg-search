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

import React, { PureComponent } from "react";
import { ObjectField, PrintViewObjectField } from "./ObjectField";
import { ValueField, PrintViewValueField } from "./ValueField";
import { LIST_SMALL_SIZE_STOP, 
        getNextSizeStop, 
        getFilteredItems, 
        getShowMoreLabel, 
        hasMore } from "./helpers";
import "./ListField.css";

const ListFieldBase = (renderUserInteractions = true) => {

  const ObjectFieldComponent = renderUserInteractions?ObjectField:PrintViewObjectField;
  const ValueFieldComponent = renderUserInteractions?ValueField:PrintViewValueField;

  const DefaultList = ({children}) => {
    return (
      <ul>
        {children}
      </ul>
    );
  };

  const CustomList = ({className, children}) => (
    <span className={className}>
      {children}
    </span>
  );

  const DefaultListItem = ({children}) => (
    <li>
      {children}
    </li>
  );

  const CustomListItem = ({isFirst, separator, children}) => (
    <span>
      {isFirst?null:separator}
      {children}
    </span>
  );

  const ListFieldComponent = ({list, separator, showAsTag, showToggle, toggleHandler, toggleLabel, hasMore}) => {
    const isCustom = separator || showAsTag;
    const List = isCustom?CustomList:DefaultList;
    const ListItem = isCustom?CustomListItem:DefaultListItem;
    const className =  `kgs-field__list ${showAsTag?"items-as-tags":""}`;
    return (
      <span>
        <List className={className}>
          {
            list.map(({isObject, key, data, mapping, group}, idx) => (
              <ListItem key={key} separator={separator} isFirst={!idx}>
                {isObject?
                  <ObjectFieldComponent show={true} data={data} mapping={mapping} group={group} />
                  :
                  <ValueFieldComponent show={true} data={data} mapping={mapping} group={group} />
                }
              </ListItem>
            ))
          }
          {showToggle && hasMore && (
            <ListItem key={-1} className="kgs-field__more">...</ListItem>
          )}
        </List>
        {showToggle && (
          <button className="kgs-field__viewMore-button" onClick={toggleHandler} role="link">{toggleLabel}</button>
        )}
      </span>
    );
  };

  class ListField extends PureComponent {
    constructor(props) {
      super(props);
      const sizeStop = getNextSizeStop(Number.POSITIVE_INFINITY, this.props);
      this.state = {
        sizeStop: sizeStop,
        items: getFilteredItems(sizeStop, this.maxSizeStop, this.props),
        hasShowMoreToggle: this.hasShowMoreToggle,
        showMoreLabel: getShowMoreLabel(sizeStop, this.maxSizeStop, this.props),
        hasMore: hasMore(sizeStop, this.maxSizeStop, this.props)
      };
      this.handleShowMoreClick = this.handleShowMoreClick.bind(this);
    }

    get maxSizeStop() {
      const {items, mapping} = this.props;

      if (!Array.isArray(items)) {
        return 0;
      }

      if (!renderUserInteractions && mapping && mapping.overviewMaxDisplay && mapping.overviewMaxDisplay < items.length) {
        return mapping.overviewMaxDisplay;
      }
      return items.length;
    }

    get hasShowMoreToggle() {
      const {items, mapping} = this.props;
      if (!Array.isArray(items) || (mapping && mapping.separator) || !renderUserInteractions) {
        return false;
      }

      return this.maxSizeStop > LIST_SMALL_SIZE_STOP;
    }

    handleShowMoreClick() {
      this.setState((state, props) => {
        const nextSizeStop = getNextSizeStop(state.sizeStop, props);
        return {
          sizeStop: nextSizeStop,
          items: getFilteredItems(nextSizeStop, this.maxSizeStop, props),
          hasShowMoreToggle: this.hasShowMoreToggle,
          showMoreLabel: getShowMoreLabel(nextSizeStop, this.maxSizeStop, props),
          hasMore: hasMore(nextSizeStop, this.maxSizeStop, props)
        };
      });
    }

    render() {
      const {show, mapping} = this.props;
      if (!show) {
        return null;
      }

      return (
        <ListFieldComponent list={this.state.items} separator={mapping && !mapping.tagIcon && mapping.separator} showAsTag={mapping && !!mapping.tagIcon} showToggle={this.state.hasShowMoreToggle} toggleHandler={this.handleShowMoreClick} toggleLabel={this.state.showMoreLabel} hasMore={this.state.hasMore}/>
      );
    }
  }
  return ListField;
};

export const ListField = ListFieldBase(true);
export const PrintViewListField = ListFieldBase(false);