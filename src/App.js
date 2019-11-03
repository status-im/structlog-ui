import React, {useState} from 'react';
import { SearchState, SortingState, IntegratedSorting, TreeDataState, CustomTreeData, FilteringState, IntegratedFiltering, TableColumnVisibility, DataTypeProvider } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableTreeColumn, TableFilterRow, SearchPanel, Toolbar, ColumnChooser, TableColumnResizing, DragDropProvider, TableColumnReordering  } from '@devexpress/dx-react-grid-bootstrap4';
import Convert from 'ansi-to-html';
import stripAnsi from 'strip-ansi';
import ReactJson from 'react-json-view';
import './App.css';
import Logs from './Logs.js';
import {Button, Card, Collapse, Navbar, Nav, Container, Modal} from 'react-bootstrap';
import ReactBootstrapSlider from 'react-bootstrap-slider';

import all_data from './log_embark_run.json'

let convert = new Convert();

let all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)

let session_object = Object.values(all_data).find((x) => x.session === x.id)
// should be list of sessions instead

let data = [session_object];

const ImportFromFileBodyComponent = () => {
  let fileReader;

  const handleFileRead = (e) => {
      const content = fileReader.result;
      console.log(content);
      // … do something with the 'content' …
  };

  const handleFileChosen = (file) => {
    if (!file) return;
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  return <div className='upload-expense'>
      <input type='file'
             id='file'
             className='input-file'
             accept='.csv'
             onChange={e => handleFileChosen(e.target.files[0])}
      />
  </div>;
};

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

const LogFormatter = ({ onClick }) => {
  return (props) => {
    return (
      <span onClick={onClick(props)}>
        {stripAnsi(props.value)}
      </span>
    )
  }
};

const LogTypeProvider = (props) => {
  console.dir(props)
  return (
    <DataTypeProvider
      formatterComponent={LogFormatter(props)}
      {...props}
    />
  )
}

const StepFormatter = ({onClick}) => {
  return (props) => {
    return (
      <span onClick={onClick(props)}>
        {stripAnsi(props.value)}
      </span>
    );
  }
}

const StepTypeProvider = (props) => {
  return (
    <DataTypeProvider
      formatterComponent={StepFormatter(props)}
      {...props}
    />
  )
}


class App extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      current_index: 0,
      max_index: all_data_ordered.length,
      logs: [],
      current: session_object,
      columns: [
        { name: 'session', title: 'Session' },
        { name: 'parent_id', title: 'Parent' },
        { name: 'id', title: 'Id' },
        { name: 'step', title: 'Step' },
        { name: 'name', title: 'Name' },
        { name: 'type', title: 'Type' },
        { name: 'timestamp', title: 'Timestamp' },
        // { name: 'error', title: 'Error' },
        // { name: 'inputs', title: 'Inputs' },
        { name: 'msg', title: 'Error' },
      ],
      rows: [session_object],
      tableColumnExtensions: [{ columnName: 'name', width: 300, align: 'left' }],
      // defaultExpandedRowIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
      defaultExpandedRowIds: [],
      defaultHiddenColumnNames: ['session', 'parent_id', 'id', 'error'],
      // defaultHiddenColumnNames: []
      defaultColumnWidths: [
        // { columnName: 'step', width: 10 },

        { columnName: 'session', width: 200 },
        { columnName: 'parent_id', width: 200 },
        { columnName: 'id', width: 200 },
        { columnName: 'step', width: 150 },
        { columnName: 'name', width: 600 },
        { columnName: 'type', width: 200 },
        { columnName: 'timestamp', width: 200 },
        // { name: 'error', width: 200 },
        // { name: 'inputs', width: 200 },
        { columnName: 'msg', width: 200 },
      ],
      defaultOrder: ['session', 'parent_id', 'id', 'step', 'name', 'type', 'timestamp', 'msg'],
      numberFilterOperations: [
        'equal',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
      ],
      shouldShowModal: false,
      modalTitle: "",
      modalContent: {}
    };

    this.previousLog = () => {
      if (this.state.current_index === 0) return;
      const nextRows = this.state.rows.slice();
      const nextLogs = this.state.logs.slice();
      let newItem = all_data_ordered[this.state.current_index - 1]
      data.pop();
      nextLogs.pop()
      newItem.step = this.state.current_index - 1
      this.setState({
        rows: nextRows,
        current_index: (this.state.current_index - 1),
        logs: nextLogs,
        current: newItem
      });
    }

    this.nextLog = () => {
      const nextRows = this.state.rows.slice();
      const nextLogs = this.state.logs.slice();
      if (!all_data_ordered[this.state.current_index]) return

      let current_step = this.state.current_index + 1

      let newItem = all_data_ordered[this.state.current_index]
      if (newItem.type.indexOf("log_") === 0) {
        nextLogs.push(current_step + ". " + newItem.name)
      } else {
        nextLogs.push("") // easier to slice it after...
      }
      // newItem.name = stripAnsi(newItem.name)
      newItem.step = current_step
      data.push(newItem)
      this.setState({
        rows: nextRows,
        current_index: (current_step),
        current_id: newItem.id,
        logs: nextLogs,
        current: newItem
      });
    };

    this.getChildRows = (row, rootRows) => {
      if (row && !row.id) return []; // prevents invalid records from crashing app
      return (row ? data.filter((x) => { return x.parent_id === row.id }) : rootRows)
    }

    this.goToStep = (value) => {
      if (value === this.state.current_index) return;

      if (value < this.state.current_index) {
        let diff = this.state.current_index - value;

        const nextRows = this.state.rows.slice();
        const nextLogs = this.state.logs.slice();

        for (let i=0; i<diff; i++) {
          let newItem = all_data_ordered[this.state.current_index - diff - 1]
          data.pop();
          nextLogs.pop()
          newItem.step = this.state.current_index - diff - 1
        }

      let newItem = all_data_ordered[this.state.current_index - diff]

        this.setState({
          rows: nextRows,
          current_index: (this.state.current_index - diff),
          logs: nextLogs,
          current: newItem
        });
      }

      if (value > this.state.current_index) {
        let diff = value - this.state.current_index;

        const nextRows = this.state.rows.slice();
        const nextLogs = this.state.logs.slice();

        for (let i=0; i<diff; i++) {
          // TODO: refactor this
          if (!all_data_ordered[this.state.current_index]) return

          let current_step = this.state.current_index + i + 1

          let newItem = all_data_ordered[current_step]
          if (!newItem) break;
          if (newItem.type.indexOf("log_") === 0) {
            nextLogs.push(current_step + ". " + newItem.name)
          } else {
            nextLogs.push("") // easier to slice it after...
          }
          // newItem.name = stripAnsi(newItem.name)
          newItem.step = current_step
          data.push(newItem)
        }

        let current_index = this.state.current_index + diff
        let newItem = all_data_ordered[current_index]
        // FIXME: probably not needed / wrong index
        if (!newItem) {
          newItem = all_data_ordered[this.state.current_index + diff - 1]
          current_index = this.state.current_index + diff - 1
        }

        this.setState({
          rows: nextRows,
          current_index: (current_index),
          current_id: newItem.id,
          logs: nextLogs,
          current: newItem
        });

      }
    }

    this.changeValue = ({target}) => {
      let value = target.value;
      this.goToStep(value)
    }

    this.changeStep = (step) => {
      return () => {
        this.goToStep(parseInt(step))
      }
    }

    this.setShow = (value) => {
      this.setState({shouldShowModal: value})
    }

    this.viewRow = (value) => {
      return () => {
        const {step} = value.row;
        let item = all_data_ordered[step]

        if (!item) return;

        this.setState({
          modalTitle: "step " + item.step,
          modalContent: item,
          shouldShowModal: true
        })
      }
    }
  }

  render() {
    return (
      <div>
        <DetailModal show={this.state.shouldShowModal} setShow={this.setShow} title={this.state.modalTitle} content={this.state.modalContent} />
        <Navbar fixed="top" style={{"background-color": "white", "border-bottom": "1px solid black"}}>
          {/* <ImportFromFileBodyComponent /> */}
          <Button onClick={() => { this.setState({shouldShowModal: true})}}>show</Button>
          <Navbar.Brand href="#">StructLog</Navbar.Brand>
          <Nav className="mr-auto">
          step: {this.state.current_index} / {this.state.max_index} id: {this.state.current_id}
          </Nav>
          < inline>
          <button onClick={() => { this.goToStep(1) }}>First</button>
          <button onClick={this.previousLog}>Previous</button>
          <ReactBootstrapSlider min={0} max={this.state.max_index} change={this.changeValue} value={this.state.current_index} />
          <button onClick={this.nextLog}>Next</button>
          <button onClick={() => { this.goToStep(this.state.max_index) }}>Last</button>
          </inline>
        </Navbar>
        <div style={{"margin-top": "55px"}}>
        <Section title="Current" defaultOpen={true}>
          <ReactJson src={this.state.current} theme="monokai" groupArraysAfterLength={5} name={false} collapsed={2} />
        </Section>
        <Section title="Console Output" defaultOpen={true}>
          <Logs>
            {this.state.logs.map((item, i) => {
              return (
                <div key={`message-${i}`}>
                  <p dangerouslySetInnerHTML={{ __html: (convert.toHtml(item || "")) }} />
                </div>
              );
            })}
          </Logs>
        </Section>
        <Section title="Logs" defaultOpen={true}>
          <Grid rows={this.state.rows} columns={this.state.columns} >
            <LogTypeProvider for={["name"]} onClick={this.viewRow} />
            <StepTypeProvider for={["step"]} onClick={this.viewRow} availableFilterOperations={this.state.numberFilterOperations} />
            <TreeDataState defaultExpandedRowIds={this.state.defaultExpandedRowIds} />
            <CustomTreeData getChildRows={this.getChildRows} />
            <FilteringState defaultFilters={[]} />
            <SearchState defaultValue="" />
            <IntegratedFiltering />
            <SortingState defaultSorting={[{ columnName: 'Timestamp', direction: 'asc' }]} />
            <IntegratedSorting />
            <DragDropProvider />
            <Table columnExtensions={this.state.tableColumnExtensions} />
            <TableColumnResizing defaultColumnWidths={this.state.defaultColumnWidths} />
            <TableHeaderRow showSortingControls />
            <TableColumnVisibility
              defaultHiddenColumnNames={this.state.defaultHiddenColumnNames}
            />
            <TableColumnReordering defaultOrder={this.state.defaultOrder} />
            <Toolbar />
            <SearchPanel />
            <TableFilterRow showFilterSelector={true} />
            <TableTreeColumn for="name" />
            <ColumnChooser />
          </Grid>
        </Section>
        </div>
      </div>
    );
  }
}

export default App;
