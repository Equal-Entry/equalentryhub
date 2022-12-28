import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { AcceptButton, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { Row } from "../layout/Row";

const MAIN_INFO = "Description";
// const GENERAL_INFO = "Custom";
const NAME_INFO = 'Name';
const ROLE_INFO = 'Role'
// const DIMENSIONS_INFO = 'Dimensions'

export function ObjectDescribeModal({ onCancel, targetObject, isPinned }) {
  //change how info is accessed
  // const oldName = targetObject.el.components["media-loader"].data.mediaName;
  const oldName = targetObject.el.components["accessibility"] ? targetObject.el.components["accessibility"].data["dc:title"] : '';
  const oldDescription = targetObject.el.components["accessibility"] ? targetObject.el.components["accessibility"].data["dc:description"] : '';
  // const dimensions = targetObject.el.components["media-loader"].contentBounds;
  // const dimensionsString = `${Math.round(dimensions.x * 10)/10} x ${Math.round(dimensions.y * 10)/10} x ${Math.round(dimensions.z * 10)/10}`;
  // const [genInput, setGenInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState(oldDescription);
  const [nameInput, setNameInput] = useState(oldName);

  return (
    <Modal title="Describe This Object">
      <Column padding center>
        <TextAreaInputField
          label={NAME_INFO}
          onChange={e => setNameInput(e.target.value)}
          defaultValue={nameInput}
        />

        <TextAreaInputField
          label={MAIN_INFO}
          onChange={e => setDescriptionInput(e.target.value)}
          defaultValue={descriptionInput}
          minRows={3}
        />

        {/* <TextAreaInputField
          label={GENERAL_INFO}
          onChange={e => setGenInput(e.target.value)}
          defaultValue={oldJson[GENERAL_INFO]}
          minRows={3}
        /> */}

        <Row padding="sm">
          <AcceptButton
            sm
            onClick={() => {
              if (!NAF.utils.isMine(targetObject.el)) NAF.utils.takeOwnership(targetObject.el);

              targetObject.el.components["accessibility"].data["dc:description"] = descriptionInput;
              targetObject.el.components["accessibility"].data["dc:title"] = nameInput;

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
