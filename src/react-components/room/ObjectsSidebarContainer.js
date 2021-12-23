import React, { useCallback, useRef, useState }  from "react";
import { FormattedMessage, useIntl, defineMessages } from "react-intl";
import PropTypes from "prop-types";
import { NoObjects, ObjectsSidebar, ObjectsSidebarItem } from "./ObjectsSidebar";
import { List } from "../layout/List";
import { useObjectList } from "./useObjectList";
import { CloseButton } from "../input/CloseButton";
import { Sidebar } from "../sidebar/Sidebar";
import { Column } from "../layout/Column";
import { InputField } from "../input/InputField";

export function ObjectsSidebarContainer({ onClose, hubChannel }) {
  const listRef = useRef();
  const { objects, selectedObject, selectObject, unfocusObject, focusObject } = useObjectList();

  const onUnfocusListItem = useCallback(
    e => {
      if (e.relatedTarget === listRef.current || !listRef.current.contains(e.relatedTarget)) {
        unfocusObject();
      }
    },
    [unfocusObject, listRef]
  );

  const [selectedDescObj, setSelectedDescObj] = useState(null);

  const setSelectedObj = useCallback(
    object => {
      setSelectedDescObj(object);
    },
    [setSelectedDescObj]
  );

  if(!!selectedDescObj){

    const desc = JSON.parse(selectedDescObj.el.components["media-loader"].data.description)
    const descInfo = []

    for (let key in desc){
      descInfo.push(
      <InputField label={key}>
            {desc[key]}
      </InputField>
      )
    }

    return (
      <Sidebar
        title={
          <FormattedMessage
            id="objects-sidebar.object-decs"
            defaultMessage="Object Description"
          />
        }
        beforeTitle = {<CloseButton onClick = {() => setSelectedDescObj(null)}></CloseButton>}
      >
        <Column padding>
          <InputField label={<FormattedMessage id="room-sidebar.object-name" defaultMessage="Name" />}>
            {selectedDescObj.el.object3D.name}
          </InputField>
          {descInfo}
        </Column>
      </Sidebar>
    );
  }

  return (
    <ObjectsSidebar objectCount={objects.length} onClose={onClose}>
      {objects.length > 0 ? (
        <List ref={listRef}>
          {objects.map(object => (
            <ObjectsSidebarItem
              selected={selectedObject === object}
              object={object}
              onSelectDesc = {setSelectedObj}
              key={object.id}
              onClick={() => selectObject(object)}
              onMouseOver={() => focusObject(object)}
              onFocus={() => focusObject(object)}
              onMouseOut={onUnfocusListItem}
              onBlur={onUnfocusListItem}
            />
          ))}
        </List>
      ) : (
        <NoObjects canAddObjects={hubChannel.can("spawn_and_move_media")} />
      )}
    </ObjectsSidebar>
  );
}

ObjectsSidebarContainer.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
