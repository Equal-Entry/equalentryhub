import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { AcceptButton, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { Row } from "../layout/Row";

const NAME_INFO = "Name";
const DESCRIPTION_INFO = "Description";

export function ObjectDescribeModal({ onCancel, targetObject, isPinned }) {
  const [descInput, setDescInput] = useState(targetObject.el.components.accessibility.data["dc:description"]);
  const [nameInput, setNameInput] = useState(targetObject.el.components.accessibility.data["dc:title"]);

  return (
    <Modal title="Describe This Object">
      <Column padding center>
        <TextAreaInputField
          label={NAME_INFO}
          onChange={e => setNameInput(e.target.value)}
          defaultValue={nameInput}
        />

        <TextAreaInputField
          label={DESCRIPTION_INFO}
          onChange={e => setDescInput(e.target.value)}
          defaultValue={descInput}
          minRows={3}
        />
        <Row padding="sm">
          <AcceptButton
            sm
            onClick={() => {
              if (!NAF.utils.isMine(targetObject.el)) NAF.utils.takeOwnership(targetObject.el);

              targetObject.el.components.accessibility.data["dc:description"] = descInput
              targetObject.el.components.accessibility.data["dc:title"] = nameInput

              if (isPinned) window.APP.pinningHelper.setPinned(targetObject.el, true);

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
