import React, { useState } from 'react';
import {
  SearchState,
  // IntegratedFiltering,
} from '@devexpress/dx-react-grid';
import {
  SortingState,
  IntegratedSorting,
} from '@devexpress/dx-react-grid'
import { TreeDataState, CustomTreeData, } from '@devexpress/dx-react-grid';
import { FilteringState, IntegratedFiltering } from '@devexpress/dx-react-grid';
import { RowDetailState } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableRowDetail, TableTreeColumn, TableFilterRow, SearchPanel, Toolbar} from '@devexpress/dx-react-grid-bootstrap4';
// import logo from './logo.svg';
import './App.css';

import all_data from './log.json'
import { objectMethod } from '@babel/types';

console.dir(all_data)
window.all_data = all_data;

let all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)
let current_index = 0;

let session_object = Object.values(all_data).find((x) => x.session === x.id)
// should be list of sessions instead

let data = [session_object];

const RowDetail = ({ row }) => (
  <div>
    Inputs:
    <br />
    {JSON.stringify(row.inputs)}
    <br />
    Outputs:
    <br />
    {JSON.stringify(row.outputs)}
    <br />
    Error:
    <br />
    {JSON.stringify(row.error)}
    <br />
    {JSON.stringify(row.message)}
  </div>
);

function expandRow(payload) {
  console.dir(payload);
  return true;
}

//function App() {
class App extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      columns: [
        // { name: 'session', title: 'Session' },
        // { name: 'parent_id', title: 'Parent' },
        // { name: 'id', title: 'Id' },
        { name: 'name', title: 'Name' },
        { name: 'type', title: 'Type' },
        { name: 'timestamp', title: 'Timestamp' },
        // { name: 'error', title: 'Error' },
        // { name: 'inputs', title: 'Inputs' },
        { name: 'msg', title: 'Error' },
      ],
      // rows: Object.values(data),
      rows: [session_object],
      tableColumnExtensions: [{ columnName: 'name', width: 300 }],
      // defaultExpandedRowIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
      defaultExpandedRowIds: []
    };

    this.previousLog = () => {
      if (current_index === 0) return;
      const nextRows = this.state.rows.slice();
      console.dir(nextRows)
      data.pop();
      current_index -= 1
      this.setState({
        rows: nextRows
      });
    }

    this.nextLog = () => {
      const nextRows = this.state.rows.slice();
      if (!all_data_ordered[current_index]) return
      data.push(all_data_ordered[current_index])
      current_index += 1
      this.setState({
        rows: nextRows
      });
    };

    this.getChildRows = (row, rootRows) => {
      console.dir("--> request");
      console.dir("row");
      console.dir(JSON.stringify(row));
      console.dir("rootRows");
      console.dir(JSON.stringify(rootRows));

      // prevents invalid records from crashing app
      if (row && !row.id) {
        return [];
      }

      let children
      if (row) {
        children = data.filter((x) => { return x.parent_id === row.id })
        // children = Object.values(data).filter((x) => { return x.parent_id === row.id })
        // children = []
        console.dir("children Num")
        console.dir(children.length)
      }

      return (row ? children : rootRows)
    }
  }

  render() {
    // const [columns] = useState([
    //   // { name: 'session', title: 'Session' },
    //   // { name: 'parent_id', title: 'Parent' },
    //   { name: 'id', title: 'Id' },
    //   { name: 'type', title: 'Type' },
    //   { name: 'name', title: 'Name' },
    //   { name: 'timestamp', title: 'Timestamp' },
    //   { name: 'error', title: 'Error' },
    // ]);

    // const [data] = useState(generateRows({
    //   columnValues: {
    //     id: ({ index }) => index,
    //     parentId: ({ index, random }) => (index > 0 ? Math.trunc((random() * index) / 2) : null),
    //     // ...defaultColumnValues,
    //   },
    //   length: 20,
    // }));

    // const getChildRows = (row, rootRows) => (row ? row.items : rootRows)
    // const getChildRows = (row, rootRows) => (row ? [] : rootRows)
    // const getChildRows = (row, rootRows) => { console.dir("--> request"); console.dir(row); return (row ? Object.values(data).filter((x) => { return x.parent_id === row.id }) : rootRows) }
    // const getChildRows = (row, rootRows) => ([]);

    return (
      <div className="App">
        <div className="card">
          <button onClick={this.previousLog}>Previous</button>
          <button onClick={this.nextLog}>Next</button>
          <Grid
            // rows={data}
            // rows={Object.values(data)}
            // rows={[session_object]}
            rows={this.state.rows}
            columns={this.state.columns}
          >
            <TreeDataState
              defaultExpandedRowIds={this.state.defaultExpandedRowIds}
            />
            <CustomTreeData
              getChildRows={this.getChildRows}
            />
            <FilteringState defaultFilters={[]} />
            <SearchState defaultValue="" />
            <IntegratedFiltering />
            <SortingState
              defaultSorting={[{ columnName: 'Timestamp', direction: 'asc' }]}
            />
            <IntegratedSorting />
            <Table
              columnExtensions={this.state.tableColumnExtensions}
            />
            <TableHeaderRow showSortingControls />
            <Toolbar />
            <SearchPanel />
            <TableFilterRow />
            <TableTreeColumn
              // for="id"
              for="name"
            />
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
