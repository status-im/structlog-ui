import React from 'react';
import { SearchState, SortingState, IntegratedSorting, TreeDataState, CustomTreeData, FilteringState, IntegratedFiltering, TableColumnVisibility } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableTreeColumn, TableFilterRow, SearchPanel, Toolbar, ColumnChooser } from '@devexpress/dx-react-grid-bootstrap4';
import Convert from 'ansi-to-html';
import stripAnsi from 'strip-ansi';
import ReactJson from 'react-json-view';
import './App.css';
import Logs from './Logs.js';

import all_data from './log.json'

let convert = new Convert();

let all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)

let session_object = Object.values(all_data).find((x) => x.session === x.id)
// should be list of sessions instead

let data = [session_object];

class App extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      current_index: 0,
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
      if (newItem.type.indexOf("log_") === 0) {
        nextLogs.pop()
      }
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
      // let convert = new Convert()
      // newItem.name = convert.toHtml(newItem.name)
      if (newItem.type.indexOf("log_") === 0) {
        nextLogs.push(newItem.name)
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
  }

  render() {
    return (
      <div className="card">
        step: {this.state.current_index} id: {this.state.current_id}
        <button onClick={this.previousLog}>Previous</button> <button onClick={this.nextLog}>Next</button>
        <ReactJson src={this.state.current} />
        <Logs>
          {this.state.logs.map((item, i) => {
            return (
              <div key={`message-${i}`}>
                <p dangerouslySetInnerHTML={{ __html: (convert.toHtml(item || "")) }} />
              </div>
            );
          })}
        </Logs>
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
      </div>
    );
  }
}

export default App;
