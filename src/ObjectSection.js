import React from 'react';
import ReactJson from 'react-json-view';
import Section from './Section.js';

function ObjectSection({log, open}) {
  return (
    <Section title="Current" defaultOpen={open}>
      <ReactJson src={log} theme="monokai" groupArraysAfterLength={5} name={false} collapsed={2} />
    </Section>
  );
}

export default ObjectSection;

