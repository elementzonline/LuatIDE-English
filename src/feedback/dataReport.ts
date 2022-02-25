// 1、携带uuid 的token请求服务器
// 2、服务器有一个接口获取


// import * as http from 'http';
import * as path from 'path';
import * as  fs from "fs";
// import * as  queryString from 'querystring';
import * as  os from "os";

function doPost(url, data, fn) {
    data = data || {};
    let content = data; //待发送内容
    let urlParse = require('url').parse(url, true);
    let isHttp = urlParse.protocol === 'http:';
    let options = {
        host: urlParse.hostname,
        port: urlParse.port || (isHttp ? 80 : 443),
        path: urlParse.path,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': content.length
        }
    };
    let req = require(isHttp ? 'http' : 'https').request(options, function (res) {
        let _data = '';
        res.on('data', function (chunk) {
            _data += chunk;
        });
        res.on('end', function () {
            fn !== undefined && fn(_data);
        });
    });
    req.write(content);
    req.end();
}

function getuuid() {
    let uuidPath: string = path.join(<string>process.env['APPDATA'], "LuatIDE", "uuid.txt");
    let uuid: string = fs.readFileSync(uuidPath).toString();
    return uuid;
}

function getExtensionVersion() {
    let extensionPath = path.join(__dirname, "../..", "package.json");
    let packageFile = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
    if (packageFile) {
        // console.log(packageFile.version);
        return packageFile.version;
    }
    else {
        return undefined;
    }
}

function getIPv4() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface: any = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}


// {
//     "launch_id": "c789bea16ef14a2ea0c34e0a452ca566",
//     "client_id": "e3c0d71ba0244351817712a168916a62",
//     "client_ver": "2.1.37",
//     "rver": 1,
//     "host_name": "DESKTOP-RSBTU1F",
//     "client_ip": "192.168.1.179",
//     "client_time": 1637140447257,
//     "uptime": 1,
//     "platform": "Windows-10-10.0.19041-SP0",
//     "processor": "AMD64 Family 25 Model 33 Stepping 0, AuthenticAMD"
// }
export function activaReport() {
    let uuid = getuuid();
    let reportData = new Map();
    reportData["launch_id"] = uuid;
    reportData["client_id"] = uuid;
    reportData["client_ver"] = getExtensionVersion();
    reportData["rver"] = 1;
    reportData["host_name"] = os.hostname();
    reportData["client_ip"] = getIPv4();
    reportData["client_time"] = os.uptime();
    reportData["uptime"] = 1;
    reportData["platform"] = os.version + " " + os.arch;
    reportData["processor"] = process.env["PROCESSOR_IDENTIFIER"];
    let postData = JSON.stringify(reportData, null, "\t");
    doPost('https://luatos.com/api/ide/report', postData, function (data) {
        console.log("postdata success result",data);
    });
}
