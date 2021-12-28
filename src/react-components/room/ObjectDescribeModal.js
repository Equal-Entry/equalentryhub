import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { AcceptButton, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { Row } from "../layout/Row";

const MAIN_INFO = "Main Info";
const GENERAL_INFO = "General Info";

export function ObjectDescribeModal({ onCancel, targetObject }) {
  const [genInput, setGenInput] = useState("");
  const [mainInput, setMainInput] = useState("");

  var oldJson = {};
  const oldDesc = targetObject.el.components["media-loader"].data.description;
  if (!!oldDesc) oldJson = JSON.parse(oldDesc);

  return (
    <Modal title="Describe This Object">
      <Column padding center>
        <TextAreaInputField
          label={MAIN_INFO}
          onChange={e => setMainInput(e.target.value)}
          defaultValue={oldJson[MAIN_INFO]}
        />

        <TextAreaInputField
          label={GENERAL_INFO}
          onChange={e => setGenInput(e.target.value)}
          defaultValue={oldJson[GENERAL_INFO]}
          minRows={3}
        />
        <Row padding="sm">
          <AcceptButton
            sm
            onClick={() => {
              if (!NAF.utils.isMine(targetObject.el)) NAF.utils.takeOwnership(targetObject.el);

              var newJson = {};
              newJson[MAIN_INFO] = !!mainInput ? mainInput : oldJson[MAIN_INFO];
              newJson[GENERAL_INFO] = !!genInput ? genInput : oldJson[GENERAL_INFO];

              targetObject.el.components["media-loader"].data.description = JSON.stringify(newJson);

              onCancel();
            }}
          />
          <span>&nbsp;&nbsp;&nbsp;</span>
          <CancelButton sm onClick={onCancel} />
        </Row>
      </Column>
    </Modal>
  );
}

ObjectDescribeModal.propTypes = {
  onCancel: PropTypes.func,
  targetObject: PropTypes.object.isRequired
};
