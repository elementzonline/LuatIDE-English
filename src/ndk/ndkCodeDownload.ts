import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { getNdkDefaultPath } from '../variableInterface';
const { Subject } = require('await-notify');

// 下载 NDK 代码
async function getNdkCode() {
	console.log("\x1b[0;96m[正在下载 NDK 编译环境，请等待......]");
	let ndkSavePath = getNdkDefaultPath();
	console.log("[appDataPath]", ndkSavePath);
	let ndkCommand: any;
	if (!fs.existsSync(ndkSavePath)) {
		ndkCommand = 'git clone https://gitee.com/openLuat/luatos-ndk.git ' + ndkSavePath;
		ndkSavePath = '';
	}
	else {
		ndkCommand = 'git pull';
	}
	// 开始下载
	const task = new vscode.Task({ type: 'luatide-task' }, vscode.TaskScope.Global, "LuatIDE", 'NDK download');
	task.execution = new vscode.ShellExecution(ndkCommand, { cwd: ndkSavePath });
	task.isBackground = false; //true 隐藏日志
	task.presentationOptions = {
		echo: false,
		focus: false,
		clear: true,
		showReuseMessage: true
	};
	vscode.tasks.executeTask(task);
	let taskRunStatus = false;
    // 这里订阅的Task结束事件，不区分Task，所有的的Task的时间都会过来，
    // 所以在用完通知之后需要使用dispose取消订阅
    let onDidEndTaskHand = vscode.tasks.onDidEndTask(function (event: any) {
        console.log(event);
        if(event.execution._task._name==="LuatIDE" && event.execution._task._source==="NDK download")
        {
            taskRunStatus = true;
        }
    });
    

    let timesleep = new Subject();
    while (1) {
        if (taskRunStatus === false) {
            await timesleep.wait(1000);
            console.log("Wait for the NDK download task to finish!");
        }
        else {
            // 取消订阅这个消息
            onDidEndTaskHand.dispose();
            break;
        }
    }

}

// git下载提示
async function downGit() {
	const answer = await vscode.window.showInformationMessage('请安装Git客户端以获取NDK编译环境,安装完毕请重启VsCode', '跳转下载');
	if (answer === '跳转下载') {
		vscode.env.openExternal(vscode.Uri.parse('https://git-scm.com/downloads'));
	}
};

// ndk工程下载检测处理
export async function getNdkProject() {
	let result: string | undefined = '是';
	if (!fs.existsSync(getNdkDefaultPath())) {
		result = await vscode.window.showInformationMessage('NDK工程需要额外的资源(500+MB),是否下载?', { modal: true }, '是').then(result => {
			return result;
		});
	}
	if (result === "是") {
		try {
			const version = childProcess.execSync('git --version').toString();
			console.log('version',version);
			if (version) {
				await getNdkCode();
			}
		} catch (error) {
			console.log('\x1b[0;93m[请安装Git客户端以获取NDK编译环境] \x1b[0;99mhttps://git-scm.com/downloads');
			await downGit();
		}
	}
}


