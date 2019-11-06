import React from 'react';
import Convert from 'ansi-to-html';
import Section from './Section.js';
import Logs from './Logs.js';

let convert = new Convert();

function ConsoleSection({logs, open}) {
  return (
    <Section title="Console Output" defaultOpen={open}>
      <Logs>
        {logs.map((item, i) => {
          return (
            <div key={`message-${i}`}>
              <p dangerouslySetInnerHTML={{ __html: (convert.toHtml(item || "")) }} />
            </div>
          );
        })}
      </Logs>
    </Section>
  );
}

export default ConsoleSection;

