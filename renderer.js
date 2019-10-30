const serialport = require('serialport')
const createTable = require('data-table')

var serialcomm = new serialport('COM5', { baudRate: 9600 });
const byteLength = require('@serialport/parser-byte-length');
const parser = serialcomm.pipe(new byteLength({ length: 1 }));

function onData(data) {
    document.getElementById('receivedBytes').value += parseInt('0x' + data.toString('hex')) + "\n";
    document.getElementById('receivedBytes').scrollTop = document.getElementById('receivedBytes').scrollHeight;
}

function onSerialOpen() {
    parser.on('data', onData);
}

function onError(err) {
    err && console.error(err);
}

function writeData(data) {
    serialcomm.write(data, onError)
}

serialcomm.on('open', onSerialOpen);
serialcomm.on('error', onError);

serialport.list((err, ports) => {
    console.log('ports', ports);
    if (err) {
        document.getElementById('error').textContent = err.message
        return
    } else {
        document.getElementById('error').textContent = ''
    }

    if (ports.length === 0) {
        document.getElementById('error').textContent = 'No ports discovered'
    }

    const headers = Object.keys(ports[0])
    const table = createTable(headers)
    tableHTML = ''
    table.on('data', data => tableHTML += data)
    table.on('end', () => document.getElementById('ports').innerHTML = tableHTML)
    ports.forEach(port => table.write(port))
    table.end();
})

document.getElementById('turn-on').onclick = function() {
    writeData('H');
};

document.getElementById('turn-off').onclick = function() {
    writeData('L');
};
