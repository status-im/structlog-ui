import React from 'react';
import './App.css';
import DetailModal from './DetailModal.js';
import ObjectSection from './ObjectSection.js';
import ConsoleSection from './ConsoleSection.js';
import LogsSection from './LogsSection.js';
import DebugBar from './DebugBar.js';

import all_data from './logs/log.json'
import LogManager from './DataManager.js';

class App extends React.PureComponent {

  constructor(props) {
    super(props);

    let logManager = new LogManager(all_data);

    this.state = {
      current_index: 0,
      max_index: logManager.maxStep,
      logs: [],
      current: logManager.getCurrentStep(),
      shouldShowModal: false,
      modalTitle: "",
      modalContent: {},
      rows: logManager.data,
      data: logManager.data,
      cols: [
        { name: 'session', title: 'Session', hidden: true },
        { name: 'parent_id', title: 'Parent', hidden: true },
        { name: 'id', title: 'Id', hidden: true },
        { name: 'step', title: 'Step', width: 100 },
        { name: 'timepassed', title: 'Time', width: 100 },
        { name: 'parent', title: 'ParentName'},
        { name: 'summary', title: 'Log', width: 600, hidden: true },
        { name: 'type', title: 'Type' },
        { name: 'name', title: 'Name', width: 600},
        // { name: 'inputs_preview', title: 'Inputs'},
        // { name: 'outputs_preview', title: 'Outputs'},
        { name: 'timestamp', title: 'Timestamp', hidden: true },
        // { name: 'error', title: 'Error' },
        // { name: 'inputs', title: 'Inputs' },
        { name: 'msg', title: 'Error', hidden: true },
      ]
    };

    this.update = (nextRows) => {
      let currentStep = logManager.getCurrentStep();
      this.setState({
        rows: nextRows,
        data: logManager.data.slice(),
        current_index: logManager.currentStep,
        current_id: currentStep.id,
        logs: logManager.logs,
        current: currentStep
      });
    }

    this.previousLog = () => {
      const nextRows = this.state.rows.slice();
      logManager.previousStep();
      this.update(nextRows);
    }

    this.nextLog = () => {
      const nextRows = this.state.rows.slice();
      logManager.nextStep();
      this.update(nextRows);
    }

    this.getChildRows = logManager.getChildRows.bind(logManager);

    this.goToStep = (value) => {
      const nextRows = this.state.rows.slice();
      logManager.goToStep(value);
      this.update(nextRows);
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

        let item = logManager.getStep(step);
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
        <DebugBar currentStep={this.state.current_index} maxStep={this.state.max_index} currentId={this.state.current_index} goBack={this.previousLog} goForward={this.nextLog} changeStep={this.changeValue} goToStep={this.goToStep} />
        <div style={{"margin-top": "55px"}}>
          <ObjectSection log={this.state.current} open={true} />
          <ConsoleSection logs={this.state.logs} open={true} />
          <LogsSection title={"Sequential Logs"} open={true} isStructured={false} defaultSorting={[{ columnName: 'Timestamp', direction: 'desc' }]} cols={this.state.cols} rows={this.state.data} viewRow={this.viewRow} getChildRows={this.getChildRows} />
          <LogsSection title={"Structured Logs"} open={true} isStructured={true} defaultSorting={[{ columnName: 'Timestamp', direction: 'asc' }]} cols={this.state.cols} rows={this.state.rows} viewRow={this.viewRow} getChildRows={this.getChildRows} />
        </div>
      </div>
    );
  }
}

export default App;
