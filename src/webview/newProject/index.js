//被点击的新建工程选项
let tarActive = $(".nP-menu");
let allContent = $(".nP-content");
let allHideStr = ".nP-content_space, .nP-content_example, .nP-content_ndk, .nP-content_ui";
let cancelBtn = $(".nP-cancel");
let submitBtn = $(".nP-submit");
let curActiveContent = "space";
let temImportData = null;
//工程初始化form
let formArr = $(".nP-form");
//空白工程数据
let sapceData = [
    "nP-space_project_path", "nP-space_project_name"
];
let spaceDynData = [
    "nP-select_getSpace_ModuleInfo", "nP-select_getSpace_LibInfo", "nP-select_getSpace_CoreInfo"
];
//示例工程数据
let exampleData = [
    "nP-example_project_path", "nP-example_project_name"
];
let exampleDynData = [
    "nP-select_getExample_ModuleInfo", "nP-select_getExample_ExampleInfo", "nP-select_getExample_CoreInfo"
];
//NDK数据
let ndkData = [
    "nP-ndk_project_path", "nP-ndk_project_name"
];
let ndkDynData = [
    "nP-select_getNDK_ModuleInfo", "nP-select_getNDK_ExampleInfo"
];
//UI工程数据
let uiData = [
    "nP-ui_project_path", "nP-ui_project_name"
];
let uiDynData = [
    "nP-select_getUi_ModuleInfo", "nP-select_getUi_LibInfo", "nP-select_getUi_CoreInfo"
];
// 判断是否是导入工程
let isInImportProject = false;
// 判断是否是 Air10X 模块型号
let isInAir101 = false;
// 判断是否是 Air72XCX 模块型号
let isInAirCx72 = false;


//激活 VsCode 通信
const vscode = acquireVsCodeApi();


/* 新建工程初始化[全局函数多文件调用] */
function gl_newProjectInit() {
    //初始化激活空白工程
    $(allHideStr).hide();
    $(".nP-content_space").show();
    $("#space").addClass("active");
    clearTempData(sapceData, spaceDynData);
    if (!isInImportProject) {
        getMessagePerSwitch("pure");
    }
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
            $(".nP-content_space").show();
            break;
        case "example":
            clearTempData(exampleData, exampleDynData);
            /* 添加初始化option */
            getMessagePerSwitch("example");
            curActiveContent = "example";
            $(".nP-content_example").show();
            break;
        case "ndk":
            clearTempData(ndkData, ndkDynData);
            getMessagePerSwitch("ndk");
            curActiveContent = "ndk";
            $(".nP-content_ndk").show();
            break;
        case "ui":
            clearTempData(uiData, uiDynData);
            /* 添加初始化option */
            getMessagePerSwitch("ui");
            curActiveContent = "ui";
            $(".nP-content_ui").show();
            break;
        default:
            break;
    }
});


//按钮取消逻辑
cancelBtn.on("click", function () {
    //关闭新建工程
    gl_hideNewProject();
});


//按钮完成逻辑
submitBtn.on("click", function () {
    if (isInImportProject) {
        // getImportProjectData(curActiveContent);
    } else {
        newProjectHandleSubmit(curActiveContent);
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
function nP_handelBackstage(name, type) {
    vscode.postMessage({
        command: name,
        text: type
    });
}


/* 对 Air10X 和 Air72XCX 模块型号做特殊处理 */
function nP_handelBackstageExtra(name, type) {
    if (isInAir101 && type === "customLibPath") {
        nP_Alert("当前模块型号不支持 lib 配置！");
    } else if (isInAirCx72 && type === "customCorePath") {
        nP_Alert("当前模块型号不支持 core 配置！");
    } else {
        vscode.postMessage({
            command: name,
            text: type
        });
    }
}


//Alert
function nP_Alert(msg) {
    vscode.postMessage({
        command: "Alert",
        text: {
            "msg": msg,
        }
    });
}


/* 新建工程提交 */
function newProjectHandleSubmit(tar) {
    let projectPath = $("input[name=nP-" + tar + "_project_path]").val();
    let projectName = $("input[name=nP-" + tar + "_project_name]").val();
    if (!projectName.trim() || !projectPath) {
        nP_Alert('名称或路径不能为空！');
        return false;
    } else {
        //验证上传文件的文件名是否合法
        var reg = new RegExp('[\\\\/:*?\"<>|]');
        if (reg.test(projectName) || reg.length > 255) {
            nP_Alert('工程名称不能包含【\/:*?"<>|】这些非法字符,且长度不超过255个字符,请修改后重新上传!')
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
                    "libPath": $(".nP-select_getSpace_LibInfo option:selected").text() === "点击选择" ? "" : $(".nP-select_getSpace_LibInfo option:selected").text(),
                    "moduleModel": $(".nP-select_getSpace_ModuleInfo option:selected").text(),
                    "corePath": $(".nP-select_getSpace_CoreInfo option:selected").text() === "点击选择" ? "" : $(".nP-select_getSpace_CoreInfo option:selected").text(),
                }
            });
            break;
        case "example":
            vscode.postMessage({
                command: "exampleProject",
                text: {
                    "projectName": projectName,
                    "projectPath": (projectPath + "\\" + projectName),
                    "moduleModel": $(".nP-select_getExample_ModuleInfo option:selected").text(),
                    "corePath": $(".nP-select_getExample_CoreInfo option:selected").text() === "点击选择" ? "" : $(".nP-select_getExample_CoreInfo option:selected").text(),
                    "example": $(".nP-select_getExample_ExampleInfo option:selected").text(),
                }
            });
            break;
        case "ndk":
            vscode.postMessage({
                command: "ndkProject",
                text: {
                    "projectName": projectName,
                    "projectPath": (projectPath + "\\" + projectName),
                    "moduleModel": $(".nP-select_getNDK_ModuleInfo option:selected").text(),
                    "corePath": $(".nP-select_getNDK_ExampleInfo option:selected").text(),
                }
            });
            break;
        case "ui":
            vscode.postMessage({
                command: "uiProject",
                text: {
                    "projectName": projectName,
                    "projectPath": (projectPath + "\\" + projectName),
                    "libPath": $(".nP-select_getUi_LibInfo option:selected").text() === "点击选择" ? "" : $(".nP-select_getUi_LibInfo option:selected").text(),
                    "moduleModel": $(".nP-select_getUi_ModuleInfo option:selected").text(),
                    "corePath": $(".nP-select_getUi_CoreInfo option:selected").text() === "点击选择" ? "" : $(".nP-select_getUi_CoreInfo option:selected").text(),
                }
            });
            break;
        default:
            break;
    }
    $(".nP-father").hide();
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
                    $("#nP-space_customepath").val(pathData);
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
                    $("#nP-example_customepath").val(pathData);
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
                    $("#nP-ndk_customepath").val(pathData);
                    break;
                default:
                    break;
            }
            break;
        case "ui":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#nP-ui_customepath").val(pathData);
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
const moduleSeven = "esp32c3";

/* 新建工程 暂存VsCode发送的工程数据 */
let temPureProjectData = null;
let temExampleProjectData = null;
let temNdkProjectData = null;
let temUiProjectData = null;


/* 对组件选择做特殊处理[空白工程] */
$(".nP-select_getSpace_LibInfo").on("change", function () {
    if ($('.nP-select_getSpace_LibInfo option:selected').attr("class") === 'space_customeLibOption') {
        $('.nP-select_getSpace_LibInfo option:first').prop("selected", "selected");
        nP_handelBackstageExtra('openSource', 'customLibPath');
    } else {
        $("#space_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[空白工程] */
$(".nP-select_getSpace_CoreInfo").on("change", function () {
    if ($('.nP-select_getSpace_CoreInfo option:selected').attr("class") === 'space_customeCoreOption') {
        $('.nP-select_getSpace_CoreInfo option:first').prop("selected", "selected");
        nP_handelBackstageExtra('openSource', 'customCorePath');
    } else {
        $("#space_customeCore").prop("display", "none");
    }
});


/* 新建工程 模块型号select添加刷新数据[空白工程] */
$(".nP-select_getSpace_ModuleInfo").on("change", function () {
    let moduleSelected = $(".nP-select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".nP-select_getSpace_LibInfo");
    let coreSelected = $(".nP-select_getSpace_CoreInfo");

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
        case moduleSeven:
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
        autoProduceOption($(".nP-select_getSpace_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".nP-select_getSpace_LibInfo");
    let coreSelected = $(".nP-select_getSpace_CoreInfo");

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
        case moduleSeven:
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
    if (isInImportProject) {
        importSpaceProject(temImportData);
    }
}


/* 对组件选择做特殊处理[示例工程] */
$(".nP-select_getExample_CoreInfo").on("change", function () {
    if ($('.nP-select_getExample_CoreInfo option:selected').attr("class") === 'example_customeCoreOption') {
        $('.nP-select_getExample_CoreInfo option:first').prop("selected", "selected");
        nP_handelBackstageExtra('openSource', 'customCorePath');
    } else {
        $("#example_customeCore").prop("display", "none");
    }
});


/* 新建工程 模块型号select添加刷新数据[示例工程] */
$(".nP-select_getExample_ModuleInfo").on("change", function () {
    let moduleSelected = $(".nP-select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getExample_ExampleInfo");
    let coreSelected = $(".nP-select_getExample_CoreInfo");

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
        case moduleSeven:
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
        autoProduceOption($(".nP-select_getExample_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getExample_ExampleInfo");
    let coreSelected = $(".nP-select_getExample_CoreInfo");

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
        case moduleSeven:
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
    if (isInImportProject) {
        importExampleProject(temImportData);
    }
}


/* 新建工程 模块型号select添加刷新数据[NDK工程] */
$(".nP-select_getNDK_ModuleInfo").on("change", function () {
    let moduleSelected = $(".nP-select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getNDK_ExampleInfo");

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
        case moduleSeven:
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
        autoProduceOption($(".nP-select_getNDK_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getNDK_ExampleInfo");

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
        case moduleSeven:
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
    if (isInImportProject) {
        importNdkProject(temImportData);
    }
}


/* 对组件选择做特殊处理[UI工程] */
$(".nP-select_getUi_LibInfo").on("change", function () {
    if ($('.nP-select_getUi_LibInfo option:selected').attr("class") === 'ui_customeLibOption') {
        $('.nP-select_getUi_LibInfo option:first').prop("selected", "selected");
        nP_handelBackstageExtra('openSource', 'customLibPath');
    } else {
        $("#ui_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[UI工程] */
$(".nP-select_getUi_CoreInfo").on("change", function () {
    if ($('.nP-select_getUi_CoreInfo option:selected').attr("class") === 'ui_customeCoreOption') {
        $('.nP-select_getUi_CoreInfo option:first').prop("selected", "selected");
        nP_handelBackstageExtra('openSource', 'customCorePath');
    } else {
        $("#ui_customeCore").prop("display", "none");
    }
});


/* 新建工程 模块型号select添加刷新数据[UI工程] */
$(".nP-select_getUi_ModuleInfo").on("change", function () {
    let moduleSelected = $(".nP-select_getUi_ModuleInfo option:selected");
    let libSelected = $(".nP-select_getUi_LibInfo");
    let coreSelected = $(".nP-select_getUi_CoreInfo");

    libSelected.empty();
    coreSelected.empty();

    /* 隐藏提示信息 */
    $(".tip_uiLib").hide();
    // $(".tip_uiCore").hide();

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
            // $(".tip_uiCore").show();
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
        case moduleSeven:
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
        autoProduceOption($(".nP-select_getUi_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getUi_ModuleInfo option:selected");
    let libSelected = $(".nP-select_getUi_LibInfo");
    let coreSelected = $(".nP-select_getUi_CoreInfo");

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
        case moduleSeven:
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
    // $(".tip_uiCore").hide();

    /* 导入工程操作 */
    if (isInImportProject) {
        importUiProject(temImportData);
    }
}


/* 改变主题颜色 */
function changeThemeColor11(theme) {
    if (theme === "light") {
        document.documentElement.style.setProperty("--nP-default-bgColor", 'white');
        document.documentElement.style.setProperty("--nP-default-fontColor", 'black');
        document.documentElement.style.setProperty("--nP-default-border", '1px solid rgb(0, 0, 0, 0.3)');
        document.documentElement.style.setProperty("--nP-default-hoverColor", 'black');
        document.documentElement.style.setProperty("--nP-default-active", 'rgb(190, 157, 9)');
        document.documentElement.style.setProperty("--nP-default-inputBgColor", 'white');
    } else {
        document.documentElement.style.setProperty("--nP-default-bgColor", 'rgb(37, 37, 38)');
        document.documentElement.style.setProperty("--nP-default-fontColor", 'white');
        document.documentElement.style.setProperty("--nP-default-border", '1px solid white');
        document.documentElement.style.setProperty("--nP-default-hoverColor", 'white');
        document.documentElement.style.setProperty("--nP-default-active", 'rgb(0, 238, 0)');
        document.documentElement.style.setProperty("--nP-default-inputBgColor", 'rgb(45, 45, 45)');
    }
}


/* 改变主题样式 */
function changeThemeColor(style) {
    if (style === "light") {
        document.documentElement.style.setProperty("--default-bgColor", 'white');
        document.documentElement.style.setProperty("--default-fontColor", 'black');
        document.documentElement.style.setProperty("--default-segLineColor", 'rgba(0, 0, 0, 0.6)');
        document.documentElement.style.setProperty("--default-borderColor", '2px solid black');
        document.documentElement.style.setProperty("--default-hoverColor", 'rgb(8, 60, 201)');
        document.documentElement.style.setProperty("--default-modalBgColor", 'rgb(255, 255, 255, 0.8)');
        document.documentElement.style.setProperty("--default-popBgColor", 'rgb(255, 255, 255, 0.7)');
        document.documentElement.style.setProperty("--default-loginImgStyle", 'none');
        document.documentElement.style.setProperty("--default-loginPopImgStyle", 'invert(0%) sepia(0%) saturate(600%) hue-rotate(277deg) brightness(10%) contrast(100%)');

        // 新建工程
        document.documentElement.style.setProperty("--nP-default-bgColor", 'white');
        document.documentElement.style.setProperty("--nP-default-fontColor", 'black');
        document.documentElement.style.setProperty("--nP-default-border", '1px solid rgb(0, 0, 0, 0.3)');
        document.documentElement.style.setProperty("--nP-default-hoverColor", 'black');
        document.documentElement.style.setProperty("--nP-default-active", 'rgb(190, 157, 9)');
        document.documentElement.style.setProperty("--nP-default-inputBgColor", 'white');

        //导入工程
        document.documentElement.style.setProperty("--iP-default-bgColor", 'white');
        document.documentElement.style.setProperty("--iP-default-fontColor", 'black');
        document.documentElement.style.setProperty("--iP-default-border", '1px solid rgb(0, 0, 0, 0.3)');
        document.documentElement.style.setProperty("--iP-default-hoverColor", 'black');
        document.documentElement.style.setProperty("--iP-default-active", 'rgb(190, 157, 9)');
        document.documentElement.style.setProperty("--iP-default-inputBgColor", 'white');
    } else {
        document.documentElement.style.setProperty("--default-bgColor", 'rgb(37, 37, 38)');
        document.documentElement.style.setProperty("--default-fontColor", 'rgba(255, 255, 255, 0.851)');
        document.documentElement.style.setProperty("--default-segLineColor", 'rgba(255, 255, 255, 0.4)');
        document.documentElement.style.setProperty("--default-borderColor", '2px solid rgba(255, 255, 255, 0.6)');
        document.documentElement.style.setProperty("--default-hoverColor", 'rgb(15, 204, 109)');
        document.documentElement.style.setProperty("--default-modalBgColor", 'rgb(0, 0, 0, 0.5)');
        document.documentElement.style.setProperty("--default-popBgColor", 'rgba(46, 44, 44, 0.3)');
        document.documentElement.style.setProperty("--default-loginImgStyle", 'invert(100%) sepia(0%) saturate(7500%) hue-rotate(56deg) brightness(102%) contrast(101%)');
        document.documentElement.style.setProperty("--default-loginPopImgStyle", 'none');

        // 新建工程
        document.documentElement.style.setProperty("--nP-default-bgColor", 'rgb(37, 37, 38)');
        document.documentElement.style.setProperty("--nP-default-fontColor", 'white');
        document.documentElement.style.setProperty("--nP-default-border", '1px solid white');
        document.documentElement.style.setProperty("--nP-default-hoverColor", 'white');
        document.documentElement.style.setProperty("--nP-default-active", 'rgb(0, 238, 0)');
        document.documentElement.style.setProperty("--nP-default-inputBgColor", 'rgb(45, 45, 45)');
        
        //导入工程
        document.documentElement.style.setProperty("--iP-default-bgColor", 'rgb(37, 37, 38)');
        document.documentElement.style.setProperty("--iP-default-fontColor", 'white');
        document.documentElement.style.setProperty("--iP-default-border", '1px solid white');
        document.documentElement.style.setProperty("--iP-default-hoverColor", 'white');
        document.documentElement.style.setProperty("--iP-default-active", 'rgb(0, 238, 0)');
        document.documentElement.style.setProperty("--iP-default-inputBgColor", 'rgb(45, 45, 45)');
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
        case "switchTheme":
            changeThemeColor(message.text);
            break;
        case "loadNewProjectModelBox":
            $(".newProjectHtml").show();
            gl_newProjectInit();
            break;
        case "loadOpenProjectModelBox":
            $(".openProjectHtml").show();
            break;
        default:
            break;
    }
});