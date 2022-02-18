
import path = require('path');
import * as vscode from 'vscode';
import * as shellJs from 'shelljs';

// 下载 NDK 代码
function getNdkCode() {
  console.log("\x1b[0;96m[正在下载 NDK 编译环境，请等待......]");
  const rootDir: any = process.env['APPDATA'];
  const ndkSavePath = path.join(rootDir, 'LuatIDE');
  console.log("[appDataPath]", ndkSavePath);
  let ndkDownCommand = 'git clone git@gitee.com:openLuat/luatos-ndk.git ' + ndkSavePath + '\\luatos-ndk';
  console.log(ndkDownCommand);
  shellJs.exec(ndkDownCommand, async function(code, data, error){
    console.log("[NDK下载结果code]： ", code);
    console.log("[NDK下载结果data]： ", data);
    console.log("[NDK下载结果error]： ", error);
    const codeRes = await code;
    if (codeRes === 128){
      // let uPCodeCommand = 'cd ' + ndkSavePath + '\\luatos-ndk';
      // shellJs.exec(uPCodeCommand, function(a, b, c){
      //   shellJs.exec('git pull', function(code1, data1, error1){
      //     if (code1 === 0){
      //       console.log('\x1b[0;92m[你已经获取最新版本NDK编译环境！]');
      //     }
      //   });
      // });
      vscode.window.showInformationMessage('NDK编译环境已准备完毕！');
    }
    if (codeRes === 0){
      console.log('\x1b[0;92m[你已经下载最新版本NDK编译环境！]');
      vscode.window.showInformationMessage('NDK编译环境已准备完毕！');
    }
  });
}


async function downGit(){
  const answer = await vscode.window.showInformationMessage('请安装Git客户端以获取NDK编译环境', '跳转下载');
  if (answer === '跳转下载'){
    vscode.env.openExternal(vscode.Uri.parse('https://git-scm.com/downloads'));
  }
};


class NdkSource {
  public getNdkProject(): void {
    let term = vscode.window.activeTerminal || vscode.window.createTerminal("NdkDownload");
    term.show(true);
    shellJs.exec('git --version', function(code, odata, err){
      if (code === 1){
          console.log('\x1b[0;93m[请安装Git客户端以获取NDK编译环境] \x1b[0;99mhttps://git-scm.com/downloads');
          downGit();
      }
      if (code === 0){
        if (odata.search(/git version/gi) > -1){
          console.log('[检查Git环境]： ', odata);
          getNdkCode();
        }
      }
    });
  }

}

export const ndkSource: NdkSource = new NdkSource();

