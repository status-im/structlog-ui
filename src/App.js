import React, {useState} from 'react';
import { SearchState, SortingState, IntegratedSorting, TreeDataState, CustomTreeData, FilteringState, IntegratedFiltering, TableColumnVisibility } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableTreeColumn, TableFilterRow, SearchPanel, Toolbar, ColumnChooser } from '@devexpress/dx-react-grid-bootstrap4';
import Convert from 'ansi-to-html';
import stripAnsi from 'strip-ansi';
import ReactJson from 'react-json-view';
import './App.css';
import Logs from './Logs.js';
import {Button, Card, Collapse} from 'react-bootstrap';
import ReactBootstrapSlider from 'react-bootstrap-slider';

import all_data from './log.json'

let convert = new Convert();

let all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)

let session_object = Object.values(all_data).find((x) => x.session === x.id)
// should be list of sessions instead

let data = [session_object];

function Section({title, children}) {
  const [open, setOpen] = useState(false);

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
        { name: 'name', title: 'Name' },
        { name: 'type', title: 'Type' },
        { name: 'timestamp', title: 'Timestamp' },
        // { name: 'error', title: 'Error' },
        // { name: 'inputs', title: 'Inputs' },
        { name: 'msg', title: 'Error' },
      ],
      rows: [session_object],
      tableColumnExtensions: [{ columnName: 'name', width: 300 }],
      // defaultExpandedRowIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
      defaultExpandedRowIds: [],
      defaultHiddenColumnNames: ['session', 'parent_id', 'id', 'error']
      // defaultHiddenColumnNames: []
    };

    this.previousLog = () => {
      if (this.state.current_index === 0) return;
      const nextRows = this.state.rows.slice();
      const nextLogs = this.state.logs.slice();
      let newItem = all_data_ordered[this.state.current_index - 1]
      data.pop();
      nextLogs.pop()
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
      let newItem = all_data_ordered[this.state.current_index]
      if (newItem.type.indexOf("log_") === 0) {
        nextLogs.push(newItem.name)
      } else {
        nextLogs.push("") // easier to slice it after...
      }
      newItem.name = stripAnsi(newItem.name)
      data.push(newItem)
      this.setState({
        rows: nextRows,
        current_index: (this.state.current_index + 1),
        current_id: newItem.id,
        logs: nextLogs,
        current: newItem
      });
    };

    this.getChildRows = (row, rootRows) => {
      if (row && !row.id) return []; // prevents invalid records from crashing app
      return (row ? data.filter((x) => { return x.parent_id === row.id }) : rootRows)
    }

    this.changeValue = ({target}) => {
      let value = target.value;
      if (value === this.state.current_index) return;

      if (value < this.state.current_index) {
        let diff = this.state.current_index - value;
        for (let i=0; i<diff; i++) {
          this.previousLog();
        }
      }

      if (value > this.state.current_index) {
        let diff = value - this.state.current_index;
        for (let i=0; i<diff; i++) {
          this.nextLog();
        }
      }
    }
  }

  render() {
    return (
      <div>
        step: {this.state.current_index} id: {this.state.current_id}
        <button onClick={this.previousLog}>Previous</button>
        <ReactBootstrapSlider min={0} max={this.state.max_index} change={this.changeValue} value={this.state.current_index} />
        <button onClick={this.nextLog}>Next</button>
        <div className="card">
          <ReactJson src={this.state.current} theme="monokai" groupArraysAfterLength={5} name={false} />
        </div>
        <Section title="Console Output">
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
        <Section title="Logs">
          <Grid rows={this.state.rows} columns={this.state.columns} >
            <TreeDataState defaultExpandedRowIds={this.state.defaultExpandedRowIds} />
            <CustomTreeData getChildRows={this.getChildRows} />
            <FilteringState defaultFilters={[]} />
            <SearchState defaultValue="" />
            <IntegratedFiltering />
            <SortingState defaultSorting={[{ columnName: 'Timestamp', direction: 'asc' }]} />
            <IntegratedSorting />
            <Table columnExtensions={this.state.tableColumnExtensions} />
            <TableHeaderRow showSortingControls />
            <TableColumnVisibility
              defaultHiddenColumnNames={this.state.defaultHiddenColumnNames}
            />
            <Toolbar />
            <SearchPanel />
            <TableFilterRow showFilterSelector={true} />
            <TableTreeColumn for="name" />
            <ColumnChooser />
          </Grid>
        </Section>
      </div>
    );
  }
}

export default App;
