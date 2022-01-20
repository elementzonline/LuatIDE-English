//被点击的新建工程选项
let tarActive = $(".menu");
let allContent = $(".content");
let allHideStr = ".content_space, .content_example, .content_ndk, .content_ui";
let cancelBtn = $(".cancel");
let submitBtn = $(".submit");
let curActiveContent = "space";
let temImportData = null;
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
// 判断是否是导入工程
let isInImportProject = false;
// 判断是否是 Air10X 模块型号
let isInAir101 = false;
// 判断是否是 Air72XCX 模块型号
let isInAirCx72 = false;


//激活 VsCode 通信
// const vscode = acquireVsCodeApi();


//初始化激活空白工程
$(allHideStr).hide();
$(".content_space").show();
$("#space").addClass("active");
if (!isInImportProject) {
    getMessagePerSwitch("pure");
}


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
            getMessagePerSwitch("pure");
            curActiveContent = "space";
            $(".content_space").show();
            break;
        case "example":
            clearTempData(exampleData, exampleDynData);
            /* 添加初始化option */
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
    if (isInImportProject) {
        getImportProjectData(curActiveContent);
    } else {
        handleSubmit(curActiveContent);
    }
});


/* 为下拉框添加选项 */
function autoProduceOption(par, val) {
    par.append('<option>' + val + '</option>');
}


/*********************************************** 数据交互↓ ************************************************/
/* 为下拉框添加选项 */
function addOptionToSelect(whichSelect, arr, whichModule) {
    for (let i = 0; i < arr[whichModule].length; i++) {
        autoProduceOption(whichSelect, arr[whichModule][i]);
    }
}


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


/* 对 Air10X 和 Air72XCX 模块型号做特殊处理 */
function handelBackstageExtra(name, type) {
    if (isInAir101 && type === "customLibPath") {
        Alert("当前模块型号不支持 lib 配置！");
    } else if (isInAirCx72 && type === "customCorePath") {
        Alert("当前模块型号不支持 core 配置！");
    } else {
        vscode.postMessage({
            command: name,
            text: type
        });
    }
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
                    "projectPath": (projectPath + "\\" + projectName),
                    "libPath": $(".select_getSpace_LibInfo option:selected").text() === "点击选择" ? "" : $(".select_getSpace_LibInfo option:selected").text(),
                    "moduleModel": $(".select_getSpace_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getSpace_CoreInfo option:selected").text() === "点击选择" ? "" : $(".select_getSpace_CoreInfo option:selected").text(),
                }
            });
            break;
        case "example":
            vscode.postMessage({
                command: "exampleProject",
                text: {
                    "projectName": projectName,
                    "projectPath": (projectPath + "\\" + projectName),
                    "moduleModel": $(".select_getExample_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getExample_CoreInfo option:selected").text() === "点击选择" ? "" : $(".select_getExample_CoreInfo option:selected").text(),
                    "example": $(".select_getExample_ExampleInfo option:selected").text(),
                }
            });
            break;
        case "ndk":
            vscode.postMessage({
                command: "ndkProject",
                text: {
                    "projectName": projectName,
                    "projectPath": (projectPath + "\\" + projectName),
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
                    "projectPath": (projectPath + "\\" + projectName),
                    "libPath": $(".select_getUi_LibInfo option:selected").text() === "点击选择" ? "" : $(".select_getUi_LibInfo option:selected").text(),
                    "moduleModel": $(".select_getUi_ModuleInfo option:selected").text(),
                    "corePath": $(".select_getUi_CoreInfo option:selected").text() === "点击选择" ? "" : $(".select_getUi_CoreInfo option:selected").text(),
                }
            });
            break;
        default:
            break;
    }
    $(".father").hide();
    //关闭 WebView
    vscode.postMessage({
        command: "cancelProject",
    });
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
                    $("#space_customeLib").prop("display", "block");
                    break;
                case "customCorePath":
                    $("#space_customeCore").text(pathData);
                    $("#space_customeCore").prop("selected", true);
                    $("#space_customeCore").prop("display", "block");
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
                    $("#example_customeCore").prop("display", "block");
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
                    $("#ui_customeLib").prop("display", "block");
                    break;
                case "customCorePath":
                    $("#ui_customeCore").text(pathData);
                    $("#ui_customeCore").prop("selected", true);
                    $("#ui_customeLib").prop("display", "block");
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
}


/* 模块型号类型 */
const moduleOne = "air72XUX/air82XUX";
const moduleTwo = "air72XCX";
const moduleThree = "simulator";
const moduleFour = "air101";
const moduleFive = "air103";
const moduleSix = "air105";

/* 新建工程 暂存VsCode发送的工程数据 */
let temPureProjectData = null;
let temExampleProjectData = null;
let temNdkProjectData = null;
let temUiProjectData = null;


/* 对组件选择做特殊处理[空白工程] */
$(".select_getSpace_LibInfo").on("change", function() {
    if ($('.select_getSpace_LibInfo option:selected').attr("class") === 'space_customeLibOption'){
        $('.select_getSpace_LibInfo option:first').prop("selected", "selected");
        handelBackstageExtra('openSource', 'customLibPath');
    }
    else{
        $("#space_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[空白工程] */
$(".select_getSpace_CoreInfo").on("change", function() {
    if ($('.select_getSpace_CoreInfo option:selected').attr("class") === 'space_customeCoreOption'){
        $('.select_getSpace_CoreInfo option:first').prop("selected", "selected");
        handelBackstageExtra('openSource', 'customCorePath');
    }
    else{
        $("#space_customeCore").prop("display", "none");
    }
});


/* 新建工程 模块型号select添加刷新数据[空白工程] */
$(".select_getSpace_ModuleInfo").on("change", function () {
    let moduleSelected = $(".select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".select_getSpace_LibInfo");
    let coreSelected = $(".select_getSpace_CoreInfo");

    libSelected.empty();
    coreSelected.empty();

    /* 隐藏提示信息 */
    $(".tip_spaceLib").hide();
    $(".tip_spaceCore").hide();

    switch (moduleSelected.text()) {
        case moduleOne:
            isInAir101 = false;
            isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temPureProjectData.libList, moduleOne);
            addOptionToSelect(coreSelected, temPureProjectData.coreList, moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            break;
        case moduleTwo:
            /* 目前 Air72CXC 没有 Core */
            isInAir101 = false;
            isInAirCx72 = true;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", true);
            addOptionToSelect(libSelected, temPureProjectData.libList, moduleTwo);
            addOptionToSelect(coreSelected, temPureProjectData.coreList, moduleTwo);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceCore").show();
            break;
        case moduleThree:
            isInAir101 = false;
            isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temPureProjectData.libList, moduleThree);
            addOptionToSelect(coreSelected, temPureProjectData.coreList, moduleThree);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            break;
        case moduleFour:
            /* 目前 Air10X 没有 lib */
            isInAir101 = true;
            isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temPureProjectData.libList, moduleFour);
            addOptionToSelect(coreSelected, temPureProjectData.coreList, moduleFour);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceLib").show();
            break;
        case moduleFive:
            /* 目前 Air10X 没有 lib */
            isInAir101 = true;
            isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temPureProjectData.libList, moduleFive);
            addOptionToSelect(coreSelected, temPureProjectData.coreList, moduleFive);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceLib").show();
            break;
        case moduleSix:
            /* 目前 Air10X 没有 lib */
            isInAir101 = true;
            isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temPureProjectData.libList, moduleSix);
            addOptionToSelect(coreSelected, temPureProjectData.coreList, moduleSix);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceLib").show();
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="space_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="space_customeCore" style="display: none;">点击选择</option>');
});


/* 新建工程初始化数据管理[空白工程] */
function pureProjectInitDataManagment(initData) {
    /* 添加初始化模块型号 */
    for (let i = 0; i < initData.moduleList.length; i++) {
        autoProduceOption($(".select_getSpace_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".select_getSpace_LibInfo");
    let coreSelected = $(".select_getSpace_CoreInfo");

    switch (moduleSelected.text()) {
        case moduleOne:
            isInAir101 = false;
            isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, initData.libList, moduleOne);
            addOptionToSelect(coreSelected, initData.coreList, moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            break;
        case moduleTwo:
            addOptionToSelect(libSelected, initData.libList, moduleTwo);
            addOptionToSelect(coreSelected, initData.coreList, moduleTwo);
            break;
        case moduleThree:
            addOptionToSelect(libSelected, initData.libList, moduleThree);
            addOptionToSelect(coreSelected, initData.coreList, moduleThree);
            break;
        case moduleFour:
            addOptionToSelect(libSelected, initData.libList, moduleFour);
            addOptionToSelect(coreSelected, initData.coreList, moduleFour);
            break;
        case moduleFive:
            addOptionToSelect(libSelected, initData.libList, moduleFive);
            addOptionToSelect(coreSelected, initData.coreList, moduleFive);
            break;
        case moduleSix:
            addOptionToSelect(libSelected, initData.libList, moduleSix);
            addOptionToSelect(coreSelected, initData.coreList, moduleSix);
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="space_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="space_customeCore" style="display: none;">点击选择</option>');

    /* 隐藏提示信息 */
    $(".tip_spaceLib").hide();
    $(".tip_spaceCore").hide();

    /* 导入工程操作 */
    if (isInImportProject){
        importSpaceProject(temImportData);
    }
}


/* 对组件选择做特殊处理[示例工程] */
$(".select_getExample_CoreInfo").on("change", function() {
    if ($('.select_getExample_CoreInfo option:selected').attr("class") === 'example_customeCoreOption'){
        $('.select_getExample_CoreInfo option:first').prop("selected", "selected");
        handelBackstageExtra('openSource', 'customCorePath');
    }
    else{
        $("#example_customeCore").prop("display", "none");
    }
});


/* 新建工程 模块型号select添加刷新数据[示例工程] */
$(".select_getExample_ModuleInfo").on("change", function () {
    let moduleSelected = $(".select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".select_getExample_ExampleInfo");
    let coreSelected = $(".select_getExample_CoreInfo");

    exampleSelected.empty();
    coreSelected.empty();

    /* 隐藏提示信息 */
    $(".tip_exampleCore").hide();

    switch (moduleSelected.text()) {
        case moduleOne:
            isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            addOptionToSelect(exampleSelected, temExampleProjectData.exampleList, moduleOne);
            addOptionToSelect(coreSelected, temExampleProjectData.coreList, moduleOne);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case moduleTwo:
            isInAirCx72 = true;
            coreSelected.prop("disabled", true);
            addOptionToSelect(exampleSelected, temExampleProjectData.exampleList, moduleTwo);
            addOptionToSelect(coreSelected, temExampleProjectData.coreList, moduleTwo);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            $(".tip_exampleCore").show();
            break;
        case moduleThree:
            isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            addOptionToSelect(exampleSelected, temExampleProjectData.exampleList, moduleThree);
            addOptionToSelect(coreSelected, temExampleProjectData.coreList, moduleThree);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case moduleFour:
            isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            addOptionToSelect(exampleSelected, temExampleProjectData.exampleList, moduleFour);
            addOptionToSelect(coreSelected, temExampleProjectData.coreList, moduleFour);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case moduleFive:
            isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            addOptionToSelect(exampleSelected, temExampleProjectData.exampleList, moduleFive);
            addOptionToSelect(coreSelected, temExampleProjectData.coreList, moduleFive);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case moduleSix:
            isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            addOptionToSelect(exampleSelected, temExampleProjectData.exampleList, moduleSix);
            addOptionToSelect(coreSelected, temExampleProjectData.coreList, moduleSix);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    coreSelected.append('<option value="default" id="example_customeCore" style="display: none;">点击选择</option>');
});


/* 新建工程初始化数据管理[示例工程] */
function exampleProjectInitDataManagment(initData) {
    /* 添加初始化模块型号 */
    for (let i = 0; i < initData.moduleList.length; i++) {
        autoProduceOption($(".select_getExample_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".select_getExample_ExampleInfo");
    let coreSelected = $(".select_getExample_CoreInfo");

    switch (moduleSelected.text()) {
        case moduleOne:
            isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            addOptionToSelect(exampleSelected, initData.exampleList, moduleOne);
            addOptionToSelect(coreSelected, initData.coreList, moduleOne);
            /* 添加自定义选项 */
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case moduleTwo:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleTwo);
            addOptionToSelect(coreSelected, initData.coreList, moduleTwo);
            break;
        case moduleThree:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleThree);
            addOptionToSelect(coreSelected, initData.coreList, moduleThree);
            break;
        case moduleFour:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleFour);
            addOptionToSelect(coreSelected, initData.coreList, moduleFour);
            break;
        case moduleFive:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleFive);
            addOptionToSelect(coreSelected, initData.coreList, moduleFive);
            break;
        case moduleSix:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleSix);
            addOptionToSelect(coreSelected, initData.coreList, moduleSix);
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    coreSelected.append('<option value="default" id="example_customeCore" style="display: none;">点击选择</option>');

    /* 隐藏提示信息 */
    $(".tip_exampleCore").hide();

    /* 导入工程操作 */
    if (isInImportProject){
        importExampleProject(temImportData);
    }
}


/* 新建工程 模块型号select添加刷新数据[NDK工程] */
$(".select_getNDK_ModuleInfo").on("change", function () {
    let moduleSelected = $(".select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".select_getNDK_ExampleInfo");

    exampleSelected.empty();

    switch (moduleSelected.text()) {
        case moduleOne:
            addOptionToSelect(exampleSelected, temNdkProjectData.exampleList, moduleOne);
            break;
        case moduleTwo:
            addOptionToSelect(exampleSelected, temNdkProjectData.exampleList, moduleTwo);
            break;
        case moduleThree:
            addOptionToSelect(exampleSelected, temNdkProjectData.exampleList, moduleThree);
            break;
        case moduleFour:
            addOptionToSelect(exampleSelected, temNdkProjectData.exampleList, moduleFour);
            break;
        case moduleFive:
            addOptionToSelect(exampleSelected, temNdkProjectData.exampleList, moduleFive);
            break;
        case moduleSix:
            addOptionToSelect(exampleSelected, temNdkProjectData.exampleList, moduleSix);
            break;
        default:
            break;
    }
});


/* 新建工程初始化数据管理[NDK工程] */
function ndkProjectInitDataManagment(initData) {
    /* 添加初始化模块型号 */
    for (let i = 0; i < initData.moduleList.length; i++) {
        autoProduceOption($(".select_getNDK_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".select_getNDK_ExampleInfo");

    switch (moduleSelected.text()) {
        case moduleOne:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleOne);
            break;
        case moduleTwo:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleTwo);
            break;
        case moduleThree:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleThree);
            break;
        case moduleFour:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleFour);
            break;
        case moduleFive:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleFive);
            break;
        case moduleSix:
            addOptionToSelect(exampleSelected, initData.exampleList, moduleSix);
            break;
        default:
            break;
    }
    
    /* 导入工程操作 */
    if (isInImportProject){
        importNdkProject(temImportData);
    }
}


/* 对组件选择做特殊处理[UI工程] */
$(".select_getUi_LibInfo").on("change", function() {
    if ($('.select_getUi_LibInfo option:selected').attr("class") === 'ui_customeLibOption'){
        $('.select_getUi_LibInfo option:first').prop("selected", "selected");
        handelBackstageExtra('openSource', 'customLibPath');
    }
    else{
        $("#ui_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[UI工程] */
$(".select_getUi_CoreInfo").on("change", function() {
    if ($('.select_getUi_CoreInfo option:selected').attr("class") === 'ui_customeCoreOption'){
        $('.select_getUi_CoreInfo option:first').prop("selected", "selected");
        handelBackstageExtra('openSource', 'customCorePath');
    }
    else{
        $("#ui_customeCore").prop("display", "none");
    }
});


/* 新建工程 模块型号select添加刷新数据[UI工程] */
$(".select_getUi_ModuleInfo").on("change", function () {
    let moduleSelected = $(".select_getUi_ModuleInfo option:selected");
    let libSelected = $(".select_getUi_LibInfo");
    let coreSelected = $(".select_getUi_CoreInfo");

    libSelected.empty();
    coreSelected.empty();
    
    /* 隐藏提示信息 */
    $(".tip_uiLib").hide();
    $(".tip_uiCore").hide();

    switch (moduleSelected.text()) {
        case moduleOne:
            isInAirCx72 = false;
            isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temUiProjectData.libList, moduleOne);
            addOptionToSelect(coreSelected, temUiProjectData.coreList, moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            break;
        case moduleTwo:
            isInAirCx72 = true;
            isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", true);
            addOptionToSelect(libSelected, temUiProjectData.libList, moduleTwo);
            addOptionToSelect(coreSelected, temUiProjectData.coreList, moduleTwo);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            $(".tip_uiCore").show();
            break;
        case moduleThree:
            isInAirCx72 = false;
            isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temUiProjectData.libList, moduleThree);
            addOptionToSelect(coreSelected, temUiProjectData.coreList, moduleThree);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            break;
        case moduleFour:
            isInAirCx72 = false;
            isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temUiProjectData.libList, moduleFour);
            addOptionToSelect(coreSelected, temUiProjectData.coreList, moduleFour);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case moduleFive:
            isInAirCx72 = false;
            isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temUiProjectData.libList, moduleFive);
            addOptionToSelect(coreSelected, temUiProjectData.coreList, moduleFive);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case moduleSix:
            isInAirCx72 = false;
            isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, temUiProjectData.libList, moduleSix);
            addOptionToSelect(coreSelected, temUiProjectData.coreList, moduleSix);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="ui_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="ui_customeCore" style="display: none;">点击选择</option>');
});


/* 新建工程初始化数据管理[UI工程] */
function uiProjectInitDataManagment(initData) {
    /* 添加初始化模块型号 */
    for (let i = 0; i < initData.moduleList.length; i++) {
        autoProduceOption($(".select_getUi_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".select_getUi_ModuleInfo option:selected");
    let libSelected = $(".select_getUi_LibInfo");
    let coreSelected = $(".select_getUi_CoreInfo");

    switch (moduleSelected.text()) {
        case moduleOne:
            isInAirCx72 = false;
            isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            addOptionToSelect(libSelected, initData.libList, moduleOne);
            addOptionToSelect(coreSelected, initData.coreList, moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            break;
        case moduleTwo:
            addOptionToSelect(libSelected, initData.libList, moduleTwo);
            addOptionToSelect(coreSelected, initData.coreList, moduleTwo);
            break;
        case moduleThree:
            addOptionToSelect(libSelected, initData.libList, moduleThree);
            addOptionToSelect(coreSelected, initData.coreList, moduleThree);
            break;
        case moduleFour:
            addOptionToSelect(libSelected, initData.libList, moduleFour);
            addOptionToSelect(coreSelected, initData.coreList, moduleFour);
            break;
        case moduleFive:
            addOptionToSelect(libSelected, initData.libList, moduleFive);
            addOptionToSelect(coreSelected, initData.coreList, moduleFive);
            break;
        case moduleSix:
            addOptionToSelect(libSelected, initData.libList, moduleSix);
            addOptionToSelect(coreSelected, initData.coreList, moduleSix);
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="ui_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="ui_customeCore" style="display: none;">点击选择</option>');

    /* 隐藏提示信息 */
    $(".tip_uiLib").hide();
    $(".tip_uiCore").hide();
    
    /* 导入工程操作 */
    if (isInImportProject){
        importUiProject(temImportData);
    }
}



/********************************************** 导入工程 **********************************************/

/* 添加红框提示错误 */
function addTips(tar) {
    tar.css({
        "border": "1px solid #b42525"
    });
}


/* 导入工程 初始化数据管理[空白工程] */
function importSpaceProject(importData) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=space_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=space_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".select_getSpace_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getSpace_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getSpace_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "libPath":
                $("#space_customeLib").text(importData.correctData[key1]);
                break;
            case "corePath":
                $("#space_customeCore").text(importData.correctData[key1]);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                addTips($("input[name=space_project_name]"));
                $("input[name=space_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                addTips($("input[name=space_project_path]"));
                $("input[name=space_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                addTips($(".select_getSpace_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".select_getSpace_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getSpace_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getSpace_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "libPath":
                addTips($(".select_getSpace_LibInfo"));
                $("#space_customeLib").text(importData.errorData[key2]);
                break;
            case "corePath":
                addTips($(".select_getSpace_CoreInfo"));
                $("#space_customeCore").text(importData.errorData[key2]);
                break;
            default:
                break;
        }
    }

    $('.select_getSpace_LibInfo').find("option[id=space_customeLib]").prop("selected", "selected");
    $('.select_getSpace_CoreInfo').find("option[id=space_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=space_project_path]").prop("disabled", true);
    $("input[name=space_project_name]").prop("disabled", true);
    $(".select_getSpace_ModuleInfo").prop("disabled", true);
}


/* 导入工程 初始化数据管理[示例工程] */
function importExampleProject(importData) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=example_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=example_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".select_getExample_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getExample_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getExample_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "example":
                $(".select_getExample_ExampleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "corePath":
                $("#example_customeCore").text(importData.correctData[key1]);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                addTips($("input[name=example_project_name]"));
                $("input[name=example_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                addTips($("input[name=example_project_path]"));
                $("input[name=example_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                addTips($(".select_getExample_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".select_getExample_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getExample_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getExample_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "example":
                addTips($(".select_getExample_ExampleInfo"));
                $(".select_getExample_ExampleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "corePath":
                addTips($(".select_getExample_CoreInfo"));
                $("#example_customeCore").text(importData.errorData[key2]);
                break;
            default:
                break;
        }
    }

    $('.select_getExample_CoreInfo').find("option[id=example_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=example_project_path]").prop("disabled", true);
    $("input[name=example_project_name]").prop("disabled", true);
    $(".select_getExample_ModuleInfo").prop("disabled", true);
}


/* 导入工程 初始化数据管理[NDK工程] */
function importNdkProject(importData) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=ndk_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=ndk_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".select_getNDK_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getNDK_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getNDK_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "example":
                $(".select_getNDK_ExampleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                addTips($("input[name=ndk_project_name]"));
                $("input[name=ndk_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                addTips($("input[name=ndk_project_path]"));
                $("input[name=ndk_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                addTips($(".select_getNDK_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".select_getNDK_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getNDK_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getNDK_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "example":
                addTips($(".select_getNDK_ExampleInfo"));
                $(".select_getNDK_ExampleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            default:
                break;
        }
    }

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=ndk_project_path]").prop("disabled", true);
    $("input[name=ndk_project_name]").prop("disabled", true);
    $(".select_getNDK_ModuleInfo").prop("disabled", true);
}


/* 导入工程 初始化数据管理[UI工程] */
function importUiProject(importData) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=ui_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=ui_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".select_getUi_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getUi_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getUi_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "libPath":
                $("#ui_customeLib").text(importData.correctData[key1]);
                break;
            case "corePath":
                $("#ui_customeCore").text(importData.correctData[key1]);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                addTips($("input[name=ui_project_name]"));
                $("input[name=ui_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                addTips($("input[name=ui_project_path]"));
                $("input[name=ui_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                addTips($(".select_getUi_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".select_getUi_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         autoProduceOption($(".select_getUi_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".select_getUi_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "libPath":
                addTips($(".select_getUi_LibInfo"));
                $("#ui_customeLib").text(importData.errorData[key2]);
                break;
            case "corePath":
                addTips($(".select_getUi_CoreInfo"));
                $("#ui_customeCore").text(importData.errorData[key2]);
                break;
            default:
                break;
        }
    }

    $('.select_getUi_LibInfo').find("option[id=ui_customeLib]").prop("selected", "selected");
    $('.select_getUi_CoreInfo').find("option[id=ui_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=ui_project_path]").prop("disabled", true);
    $("input[name=ui_project_name]").prop("disabled", true);
    $(".select_getUi_ModuleInfo").prop("disabled", true);
}


/* 导入工程界面初始化 */
function importProjectDisplay(whichDsp, projectType, importData) {
    /* 隐藏选择框 */
    $(".navbar").hide();
    if (importData.errorData !== "") {
        $(".tips").show();
    }
    $(allHideStr).hide();
    whichDsp.show();
    temImportData = importData;

    switch (projectType) {
        case "space":
            $(".tip_title").hide();
            /* 获取工程初始化数据 */
            getMessagePerSwitch("pure");
            break;
        case "example":
            /* 获取工程初始化数据 */
            getMessagePerSwitch("example");
            break;
        case "ndk":
            /* 获取工程初始化数据 */
            getMessagePerSwitch("ndk");
            break;
        case "ui":
            /* 获取工程初始化数据 */
            getMessagePerSwitch("ui");
            break;
        default:
            break;
    }
}


/* 导入工程数据提交 */
function getImportProjectData(tar) {
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
                        "projectPath": (projectPath + "\\" + projectName),
                        "libPath": $(".select_getSpace_LibInfo option:selected").text() === "点击选择" ? "" : $(".select_getSpace_LibInfo option:selected").text(),
                        "moduleModel": $(".select_getSpace_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getSpace_CoreInfo option:selected").text() === "点击选择" ? "" : $(".select_getSpace_CoreInfo option:selected").text(),
                        "example": "",
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
                        "projectPath": (projectPath + "\\" + projectName),
                        "moduleModel": $(".select_getExample_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getExample_CoreInfo option:selected").text() === "点击选择" ? "" : $(".select_getExample_CoreInfo option:selected").text(),
                        "example": $(".select_getExample_ExampleInfo option:selected").text(),
                        "libPath": "",
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
                        "projectPath": (projectPath + "\\" + projectName),
                        "moduleModel": $(".select_getNDK_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getNDK_ExampleInfo option:selected").text(),
                        "libPath": "",
                        "example": "",
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
                        "projectPath": (projectPath + "\\" + projectName),
                        "libPath": $(".select_getUi_LibInfo option:selected").text() === "点击选择" ? "" : $(".select_getUi_LibInfo option:selected").text(),
                        "moduleModel": $(".select_getUi_ModuleInfo option:selected").text(),
                        "corePath": $(".select_getUi_CoreInfo option:selected").text() === "点击选择" ? "" : $(".select_getUi_CoreInfo option:selected").text(),
                        "libPath": "",
                        "example": "",
                    }
                }
            });
            break;
        default:
            break;
    }
    vscode.postMessage({
        command: 'cancelProject',
        text: {
            "type": "importProjectWebview",
        }
    });
}
/********************************************** 导入工程 **********************************************/


/* 改变主题颜色 */
function changeThemeColor(theme) {
    if (theme === "light") {
        document.documentElement.style.setProperty("--default-bgColor", 'white');
        document.documentElement.style.setProperty("--default-fontColor", 'black');
        document.documentElement.style.setProperty("--default-border", '1px solid black');
        document.documentElement.style.setProperty("--default-hoverColor", 'black');
        document.documentElement.style.setProperty("--default-active", 'rgb(190, 157, 9)');
        document.documentElement.style.setProperty("--default-inputBgColor", 'white');
    } else {
        document.documentElement.style.setProperty("--default-bgColor", 'rgb(37, 37, 38)');
        document.documentElement.style.setProperty("--default-fontColor", 'white');
        document.documentElement.style.setProperty("--default-border", '1px solid white');
        document.documentElement.style.setProperty("--default-hoverColor", 'white');
        document.documentElement.style.setProperty("--default-active", 'rgb(0, 238, 0)');
        document.documentElement.style.setProperty("--default-inputBgColor", 'rgb(45, 45, 45)');
    }
}


/* 获取vscode端发送的数据 */
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        /* 新建工程初始化数据获取 */
        case "pureProjectInitData":
            temPureProjectData = message.text;
            pureProjectInitDataManagment(message.text);
            break;
        case "exampleProjectInitData":
            temExampleProjectData = message.text;
            exampleProjectInitDataManagment(message.text);
            break;
        case "ndkProjectInitData":
            temNdkProjectData = message.text;
            ndkProjectInitDataManagment(message.text);
            break;
        case "uiProjectInitData":
            temUiProjectData = message.text;
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
        case "importProjectData":
            let targetProject = null;
            isInImportProject = true;
            switch (message.text.type) {
                case "pure":
                    curActiveContent = "space";
                    targetProject = $(".content_space");
                    break;
                case "example":
                    curActiveContent = "example";
                    targetProject = $(".content_example");
                    break;
                case "ndk":
                    curActiveContent = "ndk";
                    targetProject = $(".content_ndk");
                    break;
                case "ui":
                    curActiveContent = "ui";
                    targetProject = $(".content_ui");
                    break;
                default:
                    break;
            }
            importProjectDisplay(targetProject, curActiveContent, message.text);
            break;
        case "switchTheme":
            changeThemeColor(message.text);
            break;
        default:
            break;
    }
});