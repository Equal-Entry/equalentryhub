import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { AcceptButton, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { TextAreaInputField } from "../input/TextAreaInputField";
import { Row } from "../layout/Row";

const MAIN_INFO = "Description";
// const GENERAL_INFO = "Custom";
const PRICE_INFO = "Price";
const NAME_INFO = 'Name';
const ROLE_INFO = 'Role'
const DIMENSIONS_INFO = 'Dimensions'

export function ObjectDescribeModal({ onCancel, targetObject, isPinned }) {
  const oldName = targetObject.el.components["media-loader"].data.mediaName;
  const oldRole = targetObject.el.components["media-loader"].data.role;
  const dimensions = targetObject.el.components["media-loader"].contentBounds;
  const dimensionsString = `${Math.round(dimensions.x * 10)/10} x ${Math.round(dimensions.y * 10)/10} x ${Math.round(dimensions.z * 10)/10}`;
  // const [genInput, setGenInput] = useState("");
  const [mainInput, setMainInput] = useState('');
  const [priceInput, setPriceInput] = useState("");
  const [dimensionsInput, setDimensionsInput] = useState(dimensionsString);
  const [nameInput, setNameInput] = useState(oldName);
  const [roleInput, setRoleInput] = useState(oldRole);

  var oldJson = {};
  const oldDesc = targetObject.el.components["media-loader"].data.description;
  if (!!oldDesc) oldJson = JSON.parse(oldDesc);


  return (
    <Modal title="Describe This Object">
      <Column padding center>
        <TextAreaInputField
          label={NAME_INFO}
          onChange={e => setNameInput(e.target.value)}
          defaultValue={oldName}
        />
        
        <TextAreaInputField
          label={ROLE_INFO}
          onChange={e => setRoleInput(e.target.value)}
          defaultValue={oldRole}
        />

        <TextAreaInputField
          label={MAIN_INFO}
          onChange={e => setMainInput(e.target.value)}
          defaultValue={oldJson[MAIN_INFO]}
          minRows={3}
        />

        {/* <TextAreaInputField
          label={GENERAL_INFO}
          onChange={e => setGenInput(e.target.value)}
          defaultValue={oldJson[GENERAL_INFO]}
          minRows={3}
        /> */}

        <TextAreaInputField
          label={DIMENSIONS_INFO}
          onChange={e => setDimensionsInput(e.target.value)}
          defaultValue={dimensionsString}
        />

        <TextAreaInputField
          label={PRICE_INFO}
          onChange={e => setPriceInput(e.target.value)}
          defaultValue={oldJson[PRICE_INFO]}
        />

        <Row padding="sm">
          <AcceptButton
            sm
            onClick={() => {
              if (!NAF.utils.isMine(targetObject.el)) NAF.utils.takeOwnership(targetObject.el);

              var newJson = {};
              newJson[MAIN_INFO] = !!mainInput ? mainInput : oldJson[MAIN_INFO];
              // newJson[GENERAL_INFO] = !!genInput ? genInput : oldJson[GENERAL_INFO];
              newJson[PRICE_INFO] = !!priceInput ? priceInput : oldJson[PRICE_INFO];
              newJson[DIMENSIONS_INFO] = !!dimensionsInput ? dimensionsInput : oldJson[DIMENSIONS_INFO];

              targetObject.el.components["media-loader"].data.description = JSON.stringify(newJson);
              targetObject.el.components["media-loader"].data.mediaName = nameInput;
              targetObject.el.components["media-loader"].data.role = roleInput;

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
