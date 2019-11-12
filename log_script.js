const lineByLine = require('n-readlines');
const fs = require('fs-extra');

const liner = new lineByLine('./structlog-embark.json');

let DB = {};
let line;

while (_line = liner.next()) {
  if (_line.length === 0) continue;
  let line = _line.toString('ascii')
  let data = JSON.parse(line)

  let id = data.id
  if (DB[id]) {
    DB[id] = {...DB[id], ...data}
    continue;
  }
  DB[id] = data
}

console.dir("wrote " + Object.keys(DB).length + " keys");
fs.writeJSONSync("./log.json", DB);
console.dir("done");
