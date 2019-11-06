import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import ReactBootstrapSlider from 'react-bootstrap-slider';

function DebugBar({currentStep, maxStep, currentId, goBack, goForward, changeStep, goToStep}) {
  return (
    <Navbar fixed="top" style={{ "background-color": "white", "border-bottom": "1px solid black" }}>
      <Navbar.Brand href="#">StructLog</Navbar.Brand>
      <Nav className="mr-auto">
        step: {currentStep} / {maxStep} id: {currentId}
      </Nav>
      < inline>
        <button onClick={() => { goToStep(1) }}>First</button>
        <button onClick={goBack}>Previous</button>
        <ReactBootstrapSlider min={0} max={maxStep} change={changeStep} value={currentStep} />
        <button onClick={goForward}>Next</button>
        <button onClick={() => { goToStep(maxStep) }}>Last</button>
      </inline>
    </Navbar>
  );
}

export default DebugBar;
