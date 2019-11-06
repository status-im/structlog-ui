import React from 'react';
import {Modal} from 'react-bootstrap';
import ReactJson from 'react-json-view';

function DetailModal({show, setShow, title, content}) {
  return (
    <>
      <Modal
        size="xl"
        show={show}
        onHide={() => setShow(false)}
        // dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReactJson src={content} theme="monokai" groupArraysAfterLength={10} name={false} collapsed={3} />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DetailModal;