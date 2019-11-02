import React from 'react';
import { SearchState, SortingState, IntegratedSorting, TreeDataState, CustomTreeData, FilteringState, IntegratedFiltering } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableTreeColumn, TableFilterRow, SearchPanel, Toolbar } from '@devexpress/dx-react-grid-bootstrap4';
import './App.css';

import all_data from './log.json'

let all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)
let current_index = 0;

let session_object = Object.values(all_data).find((x) => x.session === x.id)
// should be list of sessions instead

let data = [session_object];

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
      rows: [session_object],
      tableColumnExtensions: [{ columnName: 'name', width: 300 }],
      // defaultExpandedRowIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
      defaultExpandedRowIds: []
    };

    this.previousLog = () => {
      if (current_index === 0) return;
      const nextRows = this.state.rows.slice();
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
      if (row && !row.id) return []; // prevents invalid records from crashing app
      return (row ? data.filter((x) => { return x.parent_id === row.id }) : rootRows)
    }
  }

  render() {
    return (
      <div className="App">
        <div className="card">
          <button onClick={this.previousLog}>Previous</button>
          <button onClick={this.nextLog}>Next</button>
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
            <Toolbar />
            <SearchPanel />
            <TableFilterRow />
            <TableTreeColumn for="name" />
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
