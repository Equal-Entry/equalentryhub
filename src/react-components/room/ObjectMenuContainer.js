import React from "react";
import PropTypes from "prop-types";
import { ObjectMenu, ObjectMenuButton } from "./ObjectMenu";
import { useObjectList } from "./useObjectList";
import {
  usePinObject,
  useRemoveObject,
  useGoToSelectedObject,
  getObjectUrl,
  isPlayer,
  isMe,
  useHideAvatar
} from "./object-hooks";
import { ReactComponent as PinIcon } from "../icons/Pin.svg";
import { ReactComponent as LinkIcon } from "../icons/Link.svg";
import { ReactComponent as GoToIcon } from "../icons/GoTo.svg";
import { ReactComponent as DeleteIcon } from "../icons/Delete.svg";
import { ReactComponent as AvatarIcon } from "../icons/Avatar.svg";
import { ReactComponent as HideIcon } from "../icons/Hide.svg";
import { ReactComponent as ObjectIcon } from "../icons/Object.svg";
import { ReactComponent as AddIcon } from "../icons/Add.svg";
import { FormattedMessage } from "react-intl";

function MyMenuItems({ onOpenProfile }) {
  return (
    <ObjectMenuButton onClick={onOpenProfile}>
      <AvatarIcon />
      <span>
        <FormattedMessage id="object-menu.edit-avatar-button" defaultMessage="Edit Avatar" />
      </span>
    </ObjectMenuButton>
  );
}

MyMenuItems.propTypes = {
  onOpenProfile: PropTypes.func.isRequired
};

function PlayerMenuItems({ hubChannel, activeObject, deselectObject }) {
  const hideAvatar = useHideAvatar(hubChannel, activeObject.el);

  return (
    <ObjectMenuButton
      onClick={() => {
        deselectObject();
        hideAvatar();
      }}
    >
      <HideIcon />
      <span>
        <FormattedMessage id="object-menu.hide-avatar-button" defaultMessage="Hide" />
      </span>
    </ObjectMenuButton>
  );
}

PlayerMenuItems.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  activeObject: PropTypes.object.isRequired,
  deselectObject: PropTypes.func.isRequired
};

function ObjectMenuItems({
  hubChannel,
  scene,
  activeObject,
  deselectObject,
  onGoToObject,
  onClickRename,
  onClickEditDesc
}) {
  const { canPin, isPinned, togglePinned } = usePinObject(hubChannel, scene, activeObject);
  const { canRemoveObject, removeObject } = useRemoveObject(hubChannel, scene, activeObject);
  const { canGoTo, goToSelectedObject } = useGoToSelectedObject(scene, activeObject);
  const url = getObjectUrl(activeObject);

  const canRenameOrDescribe = hubChannel.canOrWillIfCreator("update_hub");

  return (
    <>
      <ObjectMenuButton disabled={!canPin} onClick={togglePinned}>
        <PinIcon />
        <span>
          {isPinned ? (
            <FormattedMessage id="object-menu.unpin-object-button" defaultMessage="Unpin" />
          ) : (
            <FormattedMessage id="object-menu.pin-object-button" defaultMessage="Pin" />
          )}
        </span>
      </ObjectMenuButton>
      {url && (
        <ObjectMenuButton as="a" href={url} target="_blank" rel="noopener noreferrer">
          <LinkIcon />
          <span>
            <FormattedMessage id="object-menu.object-link-button" defaultMessage="Link" />
          </span>
        </ObjectMenuButton>
      )}
      <ObjectMenuButton
        disabled={!canGoTo}
        onClick={() => {
          console.log(activeObject.el.components["media-loader"]);
          goToSelectedObject();
          deselectObject();
          onGoToObject();
        }}
      >
        <GoToIcon />
        <span>
          <FormattedMessage id="object-menu.view-object-button" defaultMessage="View" />
        </span>
      </ObjectMenuButton>
      <ObjectMenuButton
        disabled={!canRemoveObject}
        onClick={() => {
          removeObject();
          deselectObject();
        }}
      >
        <DeleteIcon />
        <span>
          <FormattedMessage id="object-menu.delete-object-button" defaultMessage="Delete" />
        </span>
      </ObjectMenuButton>
      {canRenameOrDescribe && (
        <ObjectMenuButton
          onClick={() => {
            onClickRename(activeObject, deselectObject);
          }}
        >
          <ObjectIcon />
          <span>
            <FormattedMessage id="object-menu.object-rename-button" defaultMessage="Rename" />
          </span>
        </ObjectMenuButton>
      )}
      {canRenameOrDescribe && (
        <ObjectMenuButton
          onClick={() => {
            onClickEditDesc(activeObject);
          }}
        >
          <AddIcon />
          <span>
            <FormattedMessage id="object-menu.object-describe-button" defaultMessage="Describe" />
          </span>
        </ObjectMenuButton>
      )}
    </>
  );
}

ObjectMenuItems.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  activeObject: PropTypes.object.isRequired,
  deselectObject: PropTypes.func.isRequired,
  onGoToObject: PropTypes.func.isRequired
};

export function ObjectMenuContainer({
  hubChannel,
  scene,
  onOpenProfile,
  onGoToObject,
  onClickRename,
  onClickEditDesc
}) {
  const {
    objects,
    activeObject,
    deselectObject,
    selectNextObject,
    selectPrevObject,
    toggleLights,
    lightsEnabled
  } = useObjectList();

  let menuItems;

  if (isMe(activeObject)) {
    menuItems = <MyMenuItems onOpenProfile={onOpenProfile} />;
  } else if (isPlayer(activeObject)) {
    menuItems = <PlayerMenuItems hubChannel={hubChannel} activeObject={activeObject} deselectObject={deselectObject} />;
  } else {
    menuItems = (
      <ObjectMenuItems
        hubChannel={hubChannel}
        scene={scene}
        activeObject={activeObject}
        deselectObject={deselectObject}
        onGoToObject={onGoToObject}
        onClickRename={onClickRename}
        onClickEditDesc={onClickEditDesc}
      />
    );
  }

  return (
    <ObjectMenu
      // title={<FormattedMessage id="object-menu.title" defaultMessage="Object" />} orginal l10n for object
      title={activeObject.name}
      currentObjectIndex={objects.indexOf(activeObject)}
      objectCount={objects.length}
      onClose={deselectObject}
      onBack={deselectObject}
      onNextObject={selectNextObject}
      onPrevObject={selectPrevObject}
      onToggleLights={toggleLights}
      lightsEnabled={lightsEnabled}
    >
      {menuItems}
    </ObjectMenu>
  );
}

ObjectMenuContainer.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  onOpenProfile: PropTypes.func.isRequired,
  onGoToObject: PropTypes.func.isRequired,
  onClickRename: PropTypes.func.isRequired
};
