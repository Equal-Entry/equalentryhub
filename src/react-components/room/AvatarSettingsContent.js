import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, AcceptButton, CancelButton } from "../input/Button";
import styles from "./AvatarSettingsContent.scss";
import { TextInputField } from "../input/TextInputField";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { Column } from "../layout/Column";
import { FormattedMessage } from "react-intl";

export function AvatarSettingsContent({
  displayName,
  displayNameInputRef,
  disableDisplayNameInput,
  onChangeDisplayName,
  avatarPreview,
  displayNamePattern,
  onChangeAvatar,
  ...rest
}) {
  const [selectedDesc, setSelectedDesc] = useState(false);
  const [descInput, setDescInput] = useState("");

  if (selectedDesc) {
    const orginDesc = document.getElementById("avatar-rig").components["player-info"].data.description;
    return (
      <Column as="form" className={styles.content}>
        <TextAreaInputField
          label={
            <FormattedMessage
              id="avatar-settings-content.please-enter-description"
              defaultMessage="Please Enter Description"
            />
          }
          defaultValue={orginDesc}
          minRows={5}
          onChange={e => setDescInput(e.target.value)}
        />
        <AcceptButton
          preset="accept"
          onClick={() => {
            const newDesc = descInput ? descInput : orginDesc;
            document.getElementById("avatar-rig").components["player-info"].data.description = newDesc;
            setSelectedDesc(false);
          }}
        />
        <CancelButton onClick={() => setSelectedDesc(false)} />
      </Column>
    );
  }
  return (
    <Column as="form" className={styles.content} {...rest}>
      <TextInputField
        disabled={disableDisplayNameInput}
        label={<FormattedMessage id="avatar-settings-content.display-name-label" defaultMessage="Display Name" />}
        value={displayName}
        pattern={displayNamePattern}
        spellCheck="false"
        required
        onChange={onChangeDisplayName}
        description={
          <FormattedMessage
            id="avatar-settings-content.display-name-description"
            defaultMessage="Alphanumerics, hyphens, underscores, and tildes. At least 3 characters, no more than 32"
          />
        }
        ref={displayNameInputRef}
      />
      <div className={styles.avatarPreviewContainer}>
        {avatarPreview || <div />}
        <Button type="button" preset="basic" onClick={onChangeAvatar}>
          <FormattedMessage id="avatar-settings-content.change-avatar-button" defaultMessage="Change Avatar" />
        </Button>
      </div>
      <AcceptButton preset="accept" type="submit" />
      <Button type="button" preset="primary" onClick={() => setSelectedDesc(true)}>
        <FormattedMessage id="avatar-settings-content.add-avatar-desc" defaultMessage="Add Description" />
      </Button>
    </Column>
  );
}

AvatarSettingsContent.propTypes = {
  className: PropTypes.string,
  displayName: PropTypes.string,
  displayNameInputRef: PropTypes.func,
  disableDisplayNameInput: PropTypes.bool,
  displayNamePattern: PropTypes.string,
  onChangeDisplayName: PropTypes.func,
  avatarPreview: PropTypes.node,
  onChangeAvatar: PropTypes.func
};
