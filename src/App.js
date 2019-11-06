import React from 'react';
import './App.css';
import DetailModal from './DetailModal.js';
import ObjectSection from './ObjectSection.js';
import ConsoleSection from './ConsoleSection.js';
import LogsSection from './LogsSection.js';
import DebugBar from './DebugBar.js';

// import all_data from './logs/log_embark_run.json'
import all_data from './logs/log.json'
let all_data_ordered = Object.values(all_data).sort((x) => x.timestamp)

let session_object = Object.values(all_data).find((x) => x.session === x.id)
// should be list of sessions instead

let data = [session_object];

class App extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      current_index: 0,
      max_index: all_data_ordered.length,
      logs: [],
      current: session_object,
      shouldShowModal: false,
      modalTitle: "",
      modalContent: {},
      rows: data,
      cols: [
        { name: 'session', title: 'Session', hidden: true },
        { name: 'parent_id', title: 'Parent', hidden: true },
        { name: 'id', title: 'Id', hidden: true },
        { name: 'step', title: 'Step' },
        { name: 'name', title: 'Name', width: 600 },
        { name: 'type', title: 'Type' },
        { name: 'timestamp', title: 'Timestamp' },
        // { name: 'error', title: 'Error' },
        // { name: 'inputs', title: 'Inputs' },
        { name: 'msg', title: 'Error', hidden: true },
      ]
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
          if (!newItem) break;
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
          if (newItem.type && newItem.type.indexOf("log_") === 0) {
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
        <DebugBar currentStep={this.state.current_index} maxStep={this.state.max_index} currentId={this.state.current_index} goBack={this.previousLog} goForward={this.nextLog} changeStep={this.changeValue} goToStep={this.goToStep} />

        <div style={{"margin-top": "55px"}}>
          <ObjectSection log={this.state.current} open={true} />
          <ConsoleSection logs={this.state.logs} open={true} />
          <LogsSection
            open={true}
            cols={this.state.cols}
            rows={this.state.rows}
            viewRow={this.viewRow}
            getChildRows={this.getChildRows}
          />
        </div>
      </div>
    );
  }
}

export default App;
