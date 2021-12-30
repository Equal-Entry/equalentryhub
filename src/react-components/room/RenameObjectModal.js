import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { AcceptButton, CancelButton } from "../input/Button";
import { Column } from "../layout/Column";
import { TextInputField } from "../input/TextInputField";
import { getObjectUrl } from "./object-hooks";

export function RenameObjectModal({ onCancel, targetObject, deselectObject, isPinned }) {
  const url = getObjectUrl(targetObject);
  const originalSrc = url.split("|");
  const originalUrl = originalSrc[0];
  const originalName = originalSrc[1];

  const [input, setInput] = useState("");

  return (
    <Modal title="Rename This Object">
      <Column padding center>
        <TextInputField label="Please Enter" defaultValue={originalName} onChange={e => setInput(e.target.value)} />
        <AcceptButton
          onClick={() => {
            const targetEl = targetObject.el;
            const mediaLoaderData = targetEl.components["media-loader"].data;

            mediaLoaderData.src = originalUrl + "|" + input;
            mediaLoaderData.mediaName = input;
            targetEl.setAttribute("media-loader", mediaLoaderData);

            targetEl.components["media-loader"].refresh();

            if (isPinned) window.APP.pinningHelper.setPinned(targetEl, true);

            deselectObject();
            onCancel();
          }}
        />
        <CancelButton onClick={onCancel} />
      </Column>
    </Modal>
  );
}

RenameObjectModal.propTypes = {
  onCancel: PropTypes.func,
  targetObject: PropTypes.object.isRequired,
  deselectObject: PropTypes.func
};
