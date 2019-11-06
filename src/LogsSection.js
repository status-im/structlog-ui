import React from 'react';
import { SearchState, SortingState, IntegratedSorting, TreeDataState, CustomTreeData, FilteringState, IntegratedFiltering, TableColumnVisibility } from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, TableTreeColumn, TableFilterRow, SearchPanel, Toolbar, ColumnChooser, TableColumnResizing, DragDropProvider, TableColumnReordering  } from '@devexpress/dx-react-grid-bootstrap4';
import {LogTypeProvider, StepTypeProvider} from './Formatters.js';

import Section from './Section.js';

let numberFilterOperations = [
  'equal',
  'notEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual',
];

let tableColumnExtensions = [{ columnName: 'name', width: 300, align: 'left' }];

function LogsSection({title, open, isStructured, defaultSorting, cols, rows, viewRow, getChildRows}) {
  let columns = cols;
  let defaultColumnWidths = cols.map((x) => { return {columnName: x.name, width: (x.width || 200)} })
  let defaultHiddenColumnNames = cols.filter((x) => x.hidden).map((x) => x.name)
  let defaultOrder = cols.map((x) => x.name)

  return (
    <Section title={title} defaultOpen={open}>
      <Grid rows={rows} columns={columns} >
        <LogTypeProvider for={["name"]} onClick={viewRow} />
        <StepTypeProvider for={["step"]} onClick={viewRow} availableFilterOperations={numberFilterOperations} />
        <TreeDataState defaultExpandedRowIds={[]} />
        {isStructured &&
          <>
            <CustomTreeData getChildRows={getChildRows} />
          </>
        }
        <FilteringState defaultFilters={[]} />
        <SearchState defaultValue="" />
        <IntegratedFiltering />
        <SortingState defaultSorting={defaultSorting} />
        <IntegratedSorting />
        <DragDropProvider />
        <Table columnExtensions={tableColumnExtensions} />
        <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
        <TableHeaderRow showSortingControls />
        <TableColumnVisibility defaultHiddenColumnNames={defaultHiddenColumnNames} />
        <TableColumnReordering defaultOrder={defaultOrder} />
        <Toolbar />
        <SearchPanel />
        <TableFilterRow showFilterSelector={true} />
        {isStructured && 
          <>
            <TableTreeColumn for="name" />
          </>
        }
        <ColumnChooser />
      </Grid>
    </Section>
  );
}

export default LogsSection;
