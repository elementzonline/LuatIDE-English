const vscode = acquireVsCodeApi();
const selecte = document.getElementById('moduleModel');
const portSelecte = document.getElementById('modulePort');
// Handle the message inside the webview
window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case 'initConfigData':
            this.initData(message.text);
            break;
        case 'coreConfigPath':
            this.corePathHandle(message.text);
            break
        case 'libConfigPath':
            this.libPathHandle(message.text);
            break
        case 'serialPortUpdate':
            this.updateSerialPort(message.text);
            break;
    }
});
function alert(data) {
    // document.documentElement.style.setProperty('--test',rgb(34, 35, 35))
    vscode.postMessage({
        command: 'alert',
        text: data
    });
}
function initData(data) {
    document.getElementById('corePathInput').value = data['corePath'];
    document.getElementById('libPathInput').value = data['libPath'];
    // 初始化moduleModel下拉框数据
    selecte.options.length = 0;//清空原有数据
    for (let index = 0; index < data['moduleModelArray'].length; index++) {
        const element = data['moduleModelArray'][index];
        var option = document.createElement("option");
        option.text = element;
        selecte.append(option, null);
        if (data['moduleModel'] === element) {
            option.selected = true;
        }
    }
    // 初始化modulePort下拉框数据
    portSelecte.options.length = 0;
    for (let index = 0; index < data['modulePortArray'].length; index++) {
        const element = data['modulePortArray'][index];
        const reg = /\[(\w*)\]/ig;
        const comPortList = reg.exec(element);
        let comPort;
        if (comPortList === null) {
            comPort = "";
        }
        else {
            comPort = comPortList[1];
        }
        var option = document.createElement("option");
        option.text = element;
        portSelecte.append(option, null);
        if (data['modulePort'] === comPort) {
            option.selected = true;
        }
    }
}
function corePathHandle(data) {
    document.getElementById('corePathInput').value = data;
}
function libPathHandle(data) {
    document.getElementById('libPathInput').value = data;
}
function corePathSelect() {
    vscode.postMessage(
        {
            command: "coreConfigPath"
        }
    );
}
function libPathSelect() {
    vscode.postMessage(
        {
            command: "libConfigPath"
        }
    );
}
function moduleModelSelect() {
    const data = document.getElementById('moduleModel').value;
    vscode.postMessage(
        {
            command: "moduleModel",
            text: data
        }
    );
}
function modulePortSelect() {
    const data = document.getElementById('modulePort').value;
    vscode.postMessage(
        {
            command: "modulePort",
            text: data
        }
    );
}
function openConfigJson(data) {
    vscode.postMessage(
        {
            command: 'configJsonSelected',
            text: data
        }
    );
    return false;
}
