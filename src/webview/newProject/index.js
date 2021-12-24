//局部全局变量
let gcName = "";
let gcPath = "";

//被点击的新建工程选项
let tarActive = $(".menu");
let allContent = $(".content");
let allHideStr = ".content_space, .content_example, .content_ndk, .content_ui";
let cancelBtn = $(".cancel");
let submitBtn = $(".submit");
let curActiveContent = "space"
//工程初始化form
let formArr = $(".form");
//空白工程数据
let sapceData = [
    "space_project_path", "space_project_name"
];
let spaceDynData = [
    "select_getSpace_ModuleInfo", "select_getSpace_LibInfo", "select_getSpace_CoreInfo"
];
//示例工程数据
let exampleData = [
    "example_project_path", "example_project_name"
];
let exampleDynData = [
    "select_getExample_ModuleInfo", "select_getExample_ExampleInfo", "select_getExample_CoreInfo"
];
//NDK数据
let ndkData = [
    "ndk_project_path", "ndk_project_name"
];
let ndkDynData = [
    "select_getNDK_ModuleInfo", "select_getNDK_ExampleInfo"
];
//UI工程数据
let uiData = [
    "ui_project_path", "ui_project_name"
];
let uiDynData = [
    "select_getUi_ModuleInfo", "select_getUi_LibInfo", "select_getUi_CoreInfo"
];


//激活 VsCode 通信
const vscode = acquireVsCodeApi();


//初始化激活空白工程
$(allHideStr).hide();
$(".content_space").show();
$("#space").addClass("active");
getMessagePerSwitch("pure");


//清楚工程临时数据
function clearTempData(tar1, tar2) {
    for (let i = 0; i < tar1.length; i++) {
        document.getElementsByName(tar1[i])[0].value = null;
    }
    for (let j = 0; j < tar2.length; j++) {
        $("." + tar2[j]).empty();
    }
}


//不同新建工程切换逻辑
tarActive.on("click", function () {
    tarActive.removeClass("active");
    $(this).addClass("active");
    $(allHideStr).hide();
    switch ($(this).attr("id")) {
        case "space":
            clearTempData(sapceData, spaceDynData);
            /* 添加初始化option */
            $(".select_getSpace_LibInfo").append('<option value="default" selected id="space_customeLib">点击选择</option>');
            $(".select_getSpace_CoreInfo").append('<option value="default" selected id="space_customeCore">点击选择</option>');
            getMessagePerSwitch("pure");
            curActiveContent = "space";
            $(".content_space").show();
            break;
        case "example":
            clearTempData(exampleData, exampleDynData);
            /* 添加初始化option */
            $(".select_getExample_CoreInfo").append('<option value="default" selected id="example_customeCore">点击选择</option>');
            getMessagePerSwitch("example");
            curActiveContent = "example";
            $(".content_example").show();
            break;
        case "ndk":
            clearTempData(ndkData, ndkDynData);
            getMessagePerSwitch("ndk");
            curActiveContent = "ndk";
            $(".content_ndk").show();
            break;
        case "ui":
            clearTempData(uiData, uiDynData);
            /* 添加初始化option */
            $(".select_getUi_LibInfo").append('<option value="default" selected id="ui_customeLib">点击选择</option>');
            $(".select_getUi_CoreInfo").append('<option value="default" selected id="ui_customeCore">点击选择</option>');
            getMessagePerSwitch("ui");
            curActiveContent = "ui";
            $(".content_ui").show();
            break;
        default:
            break;
    }
});


//按钮取消逻辑
cancelBtn.on("click", function () {
    //关闭 WebView
    vscode.postMessage({
        command: "cancelProject",
    });
});


//按钮完成逻辑
submitBtn.on("click", function () {
    handleSubmit(curActiveContent);
});


/* 为下拉框添加选项 */
function autoProduceOption(par, val) {
    par.append('<option selected>' + val + '</option>');
}


/********************************************** 导入工程 **********************************************/
function importProjectDisplay(whichDsp) {
    /* 隐藏选择框 */
    $(".navbar").hide();
    $(".tips").show();
    $(allHideStr).hide();
    whichDsp.show();
}


/* 添加红框提示错误 */
function addTips(tar) {
    tar.css({
        "border": "1px solid #b42525"
    });
}


/* 判断那个需要添加提示 */
function whichTips(type, tar) {
    switch (type) {
        case "pure":
            break;
        case "example":
            break;
        case "ndk":
            break;
        case "ui":
            break;
        default:
            break;
    }
    for (let key in tar) {

    }
}


/* 发送导入工程数据(导入工程提交) */
function getImportProjectData(type, tar) {
    let projectPath = $("input[name=" + tar + "_project_path]").val();
    let projectName = $("input[name=" + tar + "_project_name]").val();
    if (!projectName.trim() || !projectPath) {
        Alert('名称或路径不能为空！');
        return false;
    } else {
        //验证上传文件的文件名是否合法
        var reg = new RegExp('[\\\\/:*?\"<>|]');
        if (reg.test(projectName) || reg.length > 255) {
            Alert('工程名称不能包含【\/:*?"<>|】这些非法字符,且长度不超过255个字符,请修改后重新上传!')
            return false;
        }
    }
    switch (tar) {
        case "space":
            vscode.postMessage({
                command: "importProject",
                text: {
                    "type": "pure",
                    "data": {
                        "projectName": projectName,
                        "projectPath": projectPath,
                        "libPath": $(".select_getSpace_LibInfo option:selected").text(),
                        "moduleModel": $(".select_getSpace_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getSpace_CoreInfo option:selected").text(),
                    }
                }
            });
            break;
        case "example":
            vscode.postMessage({
                command: "importProject",
                text: {
                    "type": "example",
                    "data": {
                        "projectName": projectName,
                        "projectPath": projectPath,
                        "moduleModel": $(".select_getExample_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getExample_CoreInfo option:selected").text(),
                        "example": $(".select_getExample_ExampleInfo option:selected").text(),
                    }
                }
            });
            break;
        case "ndk":
            vscode.postMessage({
                command: "importProject",
                text: {
                    "type": "ndk",
                    "data": {
                        "projectName": projectName,
                        "projectPath": projectPath,
                        "moduleModel": $(".select_getNDK_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getNDK_ExampleInfo option:selected").text(),
                    }
                }
            });
            break;
        case "ui":
            vscode.postMessage({
                command: "importProject",
                text: {
                    "type": "ui",
                    "data": {
                        "projectName": projectName,
                        "projectPath": projectPath,
                        "libPath": $(".select_getUi_LibInfo option:selected").text(),
                        "moduleModel": $(".select_getUi_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getUi_CoreInfo option:selected").text(),
                    }
                }
            });
            break;
        default:
            break;
    }
    // TODO
    vscode.postMessage({
        command: 'closeWebview',
        text: {
            "type": "importProjectWebview",
        }
    });
}
/********************************************** 导入工程 **********************************************/

/*********************************************** 数据交互↓ ************************************************/


/* 获取新建工程初始化数据命令(每次切换工程发送相应的工程类型) */
function getMessagePerSwitch(para) {
    vscode.postMessage({
        command: 'projectType',
        text: para,
    });
}


//发送给后台，由后台打开选择文件夹
function handelBackstage(name, type) {
    vscode.postMessage({
        command: name,
        text: type
    });
}


//Alert
function Alert(msg) {
    vscode.postMessage({
        command: "Alert",
        text: {
            "msg": msg,
        }
    });
}


//实时获取新建工程名称并导入工程路径
function getCurProjectName(e) {
    GCName = e;
    if (GCPath) {
        document.querySelector('.content .project_path').value = GCPath + GCName;
    }
}


/* 新建工程提交 */
function handleSubmit(tar) {
    let projectPath = $("input[name=" + tar + "_project_path]").val();
    let projectName = $("input[name=" + tar + "_project_name]").val();
    if (!projectName.trim() || !projectPath) {
        Alert('名称或路径不能为空！');
        return false;
    } else {
        //验证上传文件的文件名是否合法
        var reg = new RegExp('[\\\\/:*?\"<>|]');
        if (reg.test(projectName) || reg.length > 255) {
            Alert('工程名称不能包含【\/:*?"<>|】这些非法字符,且长度不超过255个字符,请修改后重新上传!')
            return false;
        }
    }
    switch (tar) {
        case "space":
            vscode.postMessage({
                command: "pureProject",
                text: {
                    "projectName": projectName,
                    "projectPath": projectPath,
                    "libPath": $(".select_getSpace_LibInfo option:selected").text(),
                    "moduleModel": $(".select_getSpace_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getSpace_CoreInfo option:selected").text(),
                }
            });
            break;
        case "example":
            vscode.postMessage({
                command: "exampleProject",
                text: {
                    "projectName": projectName,
                    "projectPath": projectPath,
                    "moduleModel": $(".select_getExample_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getExample_CoreInfo option:selected").text(),
                    "example": $(".select_getExample_ExampleInfo option:selected").text(),
                }
            });
            break;
        case "ndk":
            vscode.postMessage({
                command: "ndkProject",
                text: {
                    "projectName": projectName,
                    "projectPath": projectPath,
                    "moduleModel": $(".select_getNDK_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getNDK_ExampleInfo option:selected").text(),
                }
            });
            break;
        case "ui":
            vscode.postMessage({
                command: "uiProject",
                text: {
                    "projectName": projectName,
                    "projectPath": projectPath,
                    "libPath": $(".select_getUi_LibInfo option:selected").text(),
                    "moduleModel": $(".select_getUi_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getUi_CoreInfo option:selected").text(),
                }
            });
            break;

        default:
            break;
    }
    $(".father").hide();
}


/* 新建工程 接受VsCode发送的自定义路径 */
function customPathManagment(whichProject, whichCustom, pathData) {
    switch (whichProject) {
        case "space":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#space_customepath").val(pathData);
                    break;
                case "customLibPath":
                    $("#space_customeLib").text(pathData);
                    $("#space_customeLib").prop("selected", true);
                    break;
                case "customCorePath":
                    $("#space_customeCore").text(pathData);
                    $("#space_customeCore").prop("selected", true);
                    break;
                default:
                    break;
            }
            break;
        case "example":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#example_customepath").val(pathData);
                    break;
                case "customCorePath":
                    $("#example_customeCore").text(pathData);
                    $("#example_customeCore").prop("selected", true);
                    break;
                default:
                    break;
            }
            break;
        case "ndk":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#ndk_customepath").val(pathData);
                    break;
                default:
                    break;
            }
            break;
        case "ui":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#ui_customepath").val(pathData);
                    break;
                case "customLibPath":
                    $("#ui_customeLib").text(pathData);
                    $("#ui_customeLib").prop("selected", true);
                    break;
                case "customCorePath":
                    $("#ui_customeCore").text(pathData);
                    $("#ui_customeCore").prop("selected", true);
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
}


/* 为下拉框添加选项 */
function addOptionToSelect(whichSelect, arr, whichModule) {
    for (let i = 0; i < arr[whichModule].length; i++) {
        autoProduceOption(whichSelect, arr[whichModule][i]);
    }
}


/* 新建工程初始化数据管理[空白工程] */
function pureProjectInitDataManagment(initData) {
    let moduleSelected = $(".select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".select_getSpace_LibInfo");
    let coreSelected = $(".select_getSpace_CoreInfo");

    switch (moduleSelected.text()) {
        case "Air72XUX/Air82XUX":
            addOptionToSelect(libSelected, initData.libList, "Air72XUX/Air82XUX");
            addOptionToSelect(coreSelected, initData.coreList, "Air72XUX/Air82XUX");
            break;
        case "Air72XCX":
            addOptionToSelect(libSelected, initData.libList, "Air72XCX");
            addOptionToSelect(coreSelected, initData.coreList, "Air72XCX");
            break;
        case "Simulator":
            addOptionToSelect(libSelected, initData.libList, "Simulator");
            addOptionToSelect(coreSelected, initData.coreList, "Simulator");
            break;
        case "Air10X":
            addOptionToSelect(libSelected, initData.libList, "Air10X");
            addOptionToSelect(coreSelected, initData.coreList, "Air10X");
            break;
        default:
            break;
    }
}


/* 新建工程初始化数据管理[示例工程] */
function exampleProjectInitDataManagment(initData) {
    let moduleSelected = $(".select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".select_getExample_ExampleInfo");
    let coreSelected = $(".select_getExample_CoreInfo");

    switch (moduleSelected.text()) {
        case "Air72XUX/Air82XUX":
            addOptionToSelect(exampleSelected, initData.exampleList, "Air72XUX/Air82XUX");
            addOptionToSelect(coreSelected, initData.coreList, "Air72XUX/Air82XUX");
            break;
        case "Air72XCX":
            addOptionToSelect(exampleSelected, initData.exampleList, "Air72XCX");
            addOptionToSelect(coreSelected, initData.coreList, "Air72XCX");
            break;
        case "Simulator":
            addOptionToSelect(exampleSelected, initData.exampleList, "Simulator");
            addOptionToSelect(coreSelected, initData.coreList, "Simulator");
            break;
        case "Air10X":
            addOptionToSelect(exampleSelected, initData.exampleList, "Air10X");
            addOptionToSelect(coreSelected, initData.coreList, "Air10X");
            break;
        default:
            break;
    }
}


/* 新建工程初始化数据管理[NDK工程] */
function ndkProjectInitDataManagment(initData) {
    let moduleSelected = $(".select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".select_getNDK_ExampleInfo");

    switch (moduleSelected.text()) {
        case "Air72XUX/Air82XUX":
            addOptionToSelect(exampleSelected, initData.exampleList, "Air72XUX/Air82XUX");
            break;
        case "Air72XCX":
            addOptionToSelect(exampleSelected, initData.exampleList, "Air72XCX");
            break;
        case "Simulator":
            addOptionToSelect(exampleSelected, initData.exampleList, "Simulator");
            break;
        case "Air10X":
            addOptionToSelect(exampleSelected, initData.exampleList, "Air10X");
            break;
        default:
            break;
    }
}


/* 新建工程初始化数据管理[UI工程] */
function uiProjectInitDataManagment(initData) {
    let moduleSelected = $(".select_getUi_ModuleInfo option:selected");
    let libSelected = $(".select_getUi_LibInfo");
    let coreSelected = $(".select_getUi_CoreInfo");

    switch (moduleSelected.text()) {
        case "Air72XUX/Air82XUX":
            addOptionToSelect(libSelected, initData.libList, "Air72XUX/Air82XUX");
            addOptionToSelect(coreSelected, initData.coreList, "Air72XUX/Air82XUX");
            break;
        case "Air72XCX":
            addOptionToSelect(libSelected, initData.libList, "Air72XCX");
            addOptionToSelect(coreSelected, initData.coreList, "Air72XCX");
            break;
        case "Simulator":
            addOptionToSelect(libSelected, initData.libList, "Simulator");
            addOptionToSelect(coreSelected, initData.coreList, "Simulator");
            break;
        case "Air10X":
            addOptionToSelect(libSelected, initData.libList, "Air10X");
            addOptionToSelect(coreSelected, initData.coreList, "Air10X");
            break;
        default:
            break;
    }
}


/* 获取vscode端发送的数据 */
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        /* 新建工程初始化数据获取 */
        case "pureProjectInitData":
            pureProjectInitDataManagment(message.text);
            break;
        case "exampleProjectInitData":
            exampleProjectInitDataManagment(message.text);
            break;
        case "ndkProjectInitData":
            ndkProjectInitDataManagment(message.text);
            break;
        case "uiProjectInitData":
            uiProjectInitDataManagment(message.text);
            break;
            /* 自定义工程路径, lib库, core文件 */
        case "customProjectPath":
            customPathManagment(curActiveContent, "customProjectPath", message.text);
            break;
        case "customLibPath":
            customPathManagment(curActiveContent, "customLibPath", message.text);
            break;
        case "customCorePath":
            customPathManagment(curActiveContent, "customCorePath", message.text);
            break;
            // TODO
        case "importProjectData":
            // 判断是哪个工程
            let targetProject = null;
            switch (message.text.type) {
                case "pure":
                    targetProject = $(".content_space");
                    /* 添加相应的导入数据 */
                    break;
                case "example":
                    targetProject = $(".content_example");
                    break;
                case "ndk":
                    targetProject = $(".content_ndk");
                    break;
                case "ui":
                    targetProject = $(".content_ui");
                    break;
                default:
                    break;
            }
            importProjectDisplay(targetProject);
            break;
        default:
            break;
    }
});

// console.log("ooooooo", $("#space_customeLib").text("opo"));