import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { FormattedMessage } from "react-intl";
import { CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { InputField } from "../input/InputField";
import { ReactComponent as VoiceIcon } from "../icons/VolumeHigh.svg";
import { IconButton } from "../input/IconButton";
import { Button } from "../input/Button";

export function ShowDescriptionModal({ onCancel, targetObject }) {
  const name = targetObject.components["media-loader"].data.mediaName;
  const role = targetObject.components["media-loader"].data.role;
  const descrption = [];
  var contentToSpeech = `Object ${name}, ${role}: `;
  try {
    const desc = JSON.parse(targetObject.components["media-loader"].data.description);
    for (let key in desc) {
      contentToSpeech = contentToSpeech + ` ${key}: ${desc[key]}.`;
      descrption.push(
        <InputField label={key} style={{ textAlign: "left" }}>
          {desc[key]}
        </InputField>
      );
    }
  } catch (e) {
    contentToSpeech = contentToSpeech + ` no description.`;
    descrption.push(
      <InputField label={<FormattedMessage id="objects-sidebar.object-decs" defaultMessage="Object Description" />}>
        <FormattedMessage id="objects-sidebar.object-no-decs" defaultMessage="This object has no description yet." />
      </InputField>
    );
  }

  useEffect(() => {
    responsiveVoice.speak(contentToSpeech);
  }, []);

  return (
    <Modal
      title="Description"
      afterTitle={
        <IconButton onClick={() => responsiveVoice.speak(contentToSpeech)}>
          <VoiceIcon />
        </IconButton>
      }
    >
      <Column padding="sm" center>
        <Row padding="sm" center noWrap>
          <Column padding center>
            <InputField
              style={{ textAlign: "left" }}
              label={<FormattedMessage id="room-sidebar.object-name" defaultMessage="Name" />}
            >
              {name}
            </InputField>
            <InputField
              style={{ textAlign: "left" }}
              label={<FormattedMessage id="room-sidebar.object-role" defaultMessage="Role" />}
            >
              {selectedDescObj.el.components["media-loader"].data.role}
            </InputField>
            {descrption}
          </Column>
          <Button sm style={{ "min-height": "90px" }} onClick={() => responsiveVoice.speak(contentToSpeech)}>
            <Column padding center>
              <div style={{ marginLeft: "5px" }}>
                <VoiceIcon width={36} height={36} />
              </div>

              <FormattedMessage id="description-modal.voice" defaultMessage="Voice" />
            </Column>
          </Button>
        </Row>
        <Row padding="sm">
          <span>&nbsp;&nbsp;&nbsp;</span>
          <CancelButton sm onClick={onCancel} />
        </Row>
      </Column>
    </Modal>
  );
}

ShowDescriptionModal.propTypes = {
  onCancel: PropTypes.func,
  targetObject: PropTypes.object.isRequired
};
