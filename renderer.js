const serialport = require('serialport')
const createTable = require('data-table')
const { ipcRenderer } = require('electron')

var serialcomm = new serialport('COM5', { baudRate: 9600 });
const byteLength = require('@serialport/parser-byte-length');
const parser = serialcomm.pipe(new byteLength({ length: 1 }));

const appVersion = document.getElementById('version')
const notification = document.getElementById('notification')
const message = document.getElementById('message')
const restartButton = document.getElementById('restart-button');

function onData(data) {
    document.getElementById('receivedBytes').value += '0x' + data.toString('hex') + "\n";
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

ipcRenderer.send('app_version');

ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    appVersion.innerHTML = 'Software Version: ' + arg.version;
})

ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'Downloading a new update.';
    notification.classList.remove('hidden');
})

ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Would you like to restart now?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
})

function closeNotification() {
    notification.classList.add('hidden');
}

function restartApp() {
    ipcRenderer.send('restart_app');
}
