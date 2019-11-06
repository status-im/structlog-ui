import React, {useState} from 'react';
import {Card, Collapse} from 'react-bootstrap';

function Section({title, children, defaultOpen}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <Card>
        <Card.Header onClick={() => setOpen(!open)} style={{"cursor": "pointer"}}>
          {title}
        </Card.Header>

        <Collapse in={open}>
          <Card.Body>
            {children}
          </Card.Body>
        </Collapse>
      </Card>
    </>
  );
}

export default Section;