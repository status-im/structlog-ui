var _get = require('lodash.get');

// map a property depending on type to an identifier
const identifier_mappings = {
  request: {
    "pipeline:register": "inputs[0].file",
    "processes:register": "inputs[0]",
    "services:register": "inputs[0]",
    "process:logs:register": "inputs[0].processName",
    "runcode:whitelist": "inputs[0]",
    "runcode:register": "inputs[0]",
    "communication:node:register": "inputs[0]",
    "blockchain:node:register": "inputs[0]",
    "blockchain:node:start": "inputs[0].client",
    "whisper:node:register": "inputs[0]",
    "blockchain:client:register": "inputs[0]",
    "blockchain:request:register": "inputs[1]",
    "blockchain:api:register": "inputs[1]",
    "deployment:deployer:register": "inputs[0]",
    "blockchain:client:provider": "inputs[0]",
    "embarkjs:plugin:register": "inputs", // multiple relevant params
    "embarkjs:console:register": "inputs", // multiple  relevant params
    "embarkjs:contract:generate": "inputs[0].className", // multiple  relevant params
    "console:register:helpCmd": "inputs[0].cmdName",
    "storage:node:register": "inputs[0]",
    "storage:upload:register": "inputs[0]",
    "deployment:contract:deploy": "inputs[0].className",
  },
  trigger_action: {
    "deployment:contract:shouldDeploy": "inputs.contract.className",
    "deployment:contract:beforeDeploy": "inputs.contract.className",
    "deployment:contract:deployed": "inputs.contract.className",
    "deployment:contract:undeployed": "inputs.contract.className",
    "blockchain:proxy:request": "inputs.reqData.method",
    "blockchain:proxy:response": "inputs.reqData.method",
  },
  action_run: {
    "deployment:contract:shouldDeploy": "inputs.contract.className",
    "deployment:contract:beforeDeploy": "inputs.contract.className",
    "deployment:contract:deployed": "inputs.contract.className",
    "deployment:contract:undeployed": "inputs.contract.className",
    "blockchain:proxy:request": "inputs.reqData.method",
    "blockchain:proxy:response": "inputs.reqData.method",
  },
  method: {
    "deployContract": "inputs.contract.className"
  }
}

identifier_mappings.old_request = identifier_mappings.request;

class LogManager {

  constructor(all_data) {
    this.currentStep = 0;
    this.all_data_ordered = this.getData(all_data);
    this.maxStep = this.all_data_ordered.length - 1;

    let session_object = Object.values(all_data).find((x) => x.session === x.id)
    this.data = [session_object];
    this.logs = [];
  }

  getData(data) {
    let session = Object.values(data).find((x) => x.session === x.id)

    return Object.values(data).sort((x) => x.timestamp).map((x) => {
      // TODO: should be done on the embark level not on the logger
      if (x.name && x.name.indexOf('bound ') > 0) {
        x.name = x.name.replace('bound ', ' ')
      }
      x.timepassed = (x.timestamp - session.timestamp) / 1000.0;
      if (data[x.parent_id]) {
        if (x.parent_id === session.id && x.module) {
          x.parent = x.module;
        } else {
          x.parent = data[x.parent_id].name;
        }
      }

      if (identifier_mappings[x.type] && identifier_mappings[x.type][x.name]) {
        x.name += ` (${_get(x, identifier_mappings[x.type][x.name], "???")})`
      } else if (x.type === 'action_run') {
        let real_name = x.name.split(" ")[0];

        if (identifier_mappings[x.type] && identifier_mappings[x.type][real_name]) {
          x.name += ` (${_get(x, identifier_mappings[x.type][real_name], "???")})`
        }
      }

      if (x.name === "blockchain:proxy:request") {
        if (x && x.inputs && x.inputs.reqData && x.inputs.reqData.method) {
          x.name += ` (${x.inputs.reqData.method})`
        } else {
          x.name += ` (???)`
        }
      }

      if (x.inputs) {
        let params = []
        if (Array.isArray(x.inputs)) {
          for (let i of x.inputs) {
            if (typeof (i) === 'string') {
              let value = `"${i.slice(0, 90)}"`
              if (i.length > 90) {
                value += "..."
              }
              params.push(value)
            } else if (i === null || i === undefined) {
              params.push(i)
            } else if (typeof (i) === 'object') {
              let value = `${JSON.stringify(i).slice(0, 90)}`
              params.push(value)
            } else {
              params.push(typeof (i))
            }
          }
        } else if (typeof (x.inputs) === 'object') {
          let value = `${JSON.stringify(x.inputs).slice(0, 90)}`
          params = [value]
        }
        x.inputs_preview = `(${params.join(', ')})`;
      }

      if (x.outputs) {
        let params = []
        if (Array.isArray(x.outputs)) {
          for (let i of x.outputs) {
            if (typeof (i) === 'string') {
              let value = `"${i.slice(0, 90)}"`
              if (i.length > 90) {
                value += "..."
              }
              params.push(value)
            } else if (i === null || i === undefined) {
              params.push(i)
            } else if (typeof (i) === 'object') {
              let value = `${JSON.stringify(i).slice(0, 90)}`
              params.push(value)
            } else {
              params.push(typeof (i))
            }
          }
        } else if (typeof (x.outputs) === 'object') {
          let value = `${JSON.stringify(x.outputs).slice(0, 90)}`
          params = [value]
        }
        x.outputs_preview = `(${params.join(', ')})`;
      }

      return x;
    });
  }

  getCurrentStep() {
    return this.all_data_ordered[this.currentStep];
  }

  getStep(step) {
    return this.all_data_ordered[step];
  }

  getChildRows(row, rootRows) {
    if (row && !row.id) return []; // prevents invalid records from crashing app
    return (row ? this.data.filter((x) => { return x.parent_id === row.id }) : rootRows)
  }

  nextStep() {
    this.currentStep += 1;

    let newItem = this.all_data_ordered[this.currentStep]

    if (newItem && newItem.type && newItem.type.indexOf("log_") === 0) {
      this.logs.push(this.currentStep + ". " + newItem.name)
    } else {
      this.logs.push("") // easier to slice it after...
    }

    newItem.step = this.currentStep
    this.data.push(newItem)
  };

  previousStep() {
    this.currentStep -= 1;
    this.data.pop();
    this.logs.pop();
  }

  goToStep(value) {
    if (value < this.currentStep) {
      let diff = this.currentStep - value;

      for (let i = 0; i < diff; i++) {
        this.previousStep();
      }
    }

    if (value > this.currentStep) {
      let diff = value - this.currentStep;

      for (let i = 0; i < diff; i++) {
        this.nextStep();
      }
    }
  }

}

export default LogManager;