//被点击的新建工程选项
let nP_tarActive = $(".nP-menu");
let nP_allContent = $(".nP-content");
let nP_allHideStr = ".nP-content_space, .nP-content_example, .nP-content_ndk, .nP-content_ui";
let nP_cancelBtn = $(".nP-cancel");
let nP_submitBtn = $(".nP-submit");
let nP_curActiveContent = "space";
let nP_temImportData = null;
//工程初始化form
let nP_formArr = $(".nP-form");
//空白工程数据
let nP_sapceData = [
    "nP-space_project_path", "nP-space_project_name"
];
let nP_spaceDynData = [
    "nP-select_getSpace_ModuleInfo", "nP-select_getSpace_LibInfo", "nP-select_getSpace_CoreInfo"
];
//示例工程数据
let nP_exampleData = [
    "nP-example_project_path", "nP-example_project_name"
];
let nP_exampleDynData = [
    "nP-select_getExample_ModuleInfo", "nP-select_getExample_ExampleInfo", "nP-select_getExample_CoreInfo"
];
//NDK数据
let nP_ndkData = [
    "nP-ndk_project_path", "nP-ndk_project_name"
];
let nP_ndkDynData = [
    "nP-select_getNDK_ModuleInfo", "nP-select_getNDK_ExampleInfo"
];
//UI工程数据
let nP_uiData = [
    "nP-ui_project_path", "nP-ui_project_name"
];
let nP_uiDynData = [
    "nP-select_getUi_ModuleInfo", "nP-select_getUi_LibInfo", "nP-select_getUi_CoreInfo"
];
// 判断是否是导入工程
let nP_isInImportProject = false;
// 判断是否是 Air10X 模块型号
let nP_isInAir101 = false;
// 判断是否是 Air72XCX 模块型号
let nP_isInAirCx72 = false;


//激活 VsCode 通信
const vscode = acquireVsCodeApi();


/* 新建工程初始化[全局函数多文件调用] */
function gl_newProjectInit() {
    //初始化激活空白工程
    $(nP_allHideStr).hide();
    $(".nP-content_space").show();
    $("#space").addClass("active");
    nP_clearTempData(nP_sapceData, nP_spaceDynData);
    if (!nP_isInImportProject) {
        nP_getMessagePerSwitch("pure");
    }
}


//清楚工程临时数据
function nP_clearTempData(tar1, tar2) {
    for (let i = 0; i < tar1.length; i++) {
        document.getElementsByName(tar1[i])[0].value = null;
    }
    for (let j = 0; j < tar2.length; j++) {
        $("." + tar2[j]).empty();
    }
}


//不同新建工程切换逻辑
nP_tarActive.on("click", function () {
    nP_tarActive.removeClass("active");
    $(this).addClass("active");
    $(nP_allHideStr).hide();
    switch ($(this).attr("id")) {
        case "space":
            nP_clearTempData(nP_sapceData, nP_spaceDynData);
            /* 添加初始化option */
            nP_getMessagePerSwitch("pure");
            nP_curActiveContent = "space";
            $(".nP-content_space").show();
            break;
        case "example":
            nP_clearTempData(nP_exampleData, nP_exampleDynData);
            /* 添加初始化option */
            nP_getMessagePerSwitch("example");
            nP_curActiveContent = "example";
            $(".nP-content_example").show();
            break;
        case "ndk":
            nP_clearTempData(nP_ndkData, nP_ndkDynData);
            nP_getMessagePerSwitch("ndk");
            nP_curActiveContent = "ndk";
            $(".nP-content_ndk").show();
            break;
        case "ui":
            nP_clearTempData(nP_uiData, nP_uiDynData);
            /* 添加初始化option */
            nP_getMessagePerSwitch("ui");
            nP_curActiveContent = "ui";
            $(".nP-content_ui").show();
            break;
        default:
            break;
    }
});


//按钮取消逻辑
nP_cancelBtn.on("click", function () {
    //关闭新建工程
    gl_hideNewProject();
});


//按钮完成逻辑
nP_submitBtn.on("click", function () {
    if (nP_isInImportProject) {
        // getImportProjectData(nP_curActiveContent);
    } else {
        newProjectHandleSubmit(nP_curActiveContent);
    }
});


/* 为下拉框添加选项 */
function nP_autoProduceOption(par, val) {
    par.append('<option>' + val + '</option>');
}


/*********************************************** 数据交互↓ ************************************************/
/* 为下拉框添加选项 */
function nP_addOptionToSelect(whichSelect, arr, whichModule) {
    for (let i = 0; i < arr[whichModule].length; i++) {
        nP_autoProduceOption(whichSelect, arr[whichModule][i]);
    }
}


/* 获取新建工程初始化数据命令(每次切换工程发送相应的工程类型) */
function nP_getMessagePerSwitch(para) {
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
    if (nP_isInAir101 && type === "customLibPath") {
        nP_Alert("当前模块型号不支持 lib 配置！");
    } else if (nP_isInAirCx72 && type === "customCorePath") {
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
const nP_moduleOne = "air72XUX/air82XUX";
const nP_moduleTwo = "air72XCX";
const nP_moduleThree = "simulator";
const nP_moduleFour = "air101";
const nP_moduleFive = "air103";
const nP_moduleSix = "air105";
const nP_moduleSeven = "esp32c3";

/* 新建工程 暂存VsCode发送的工程数据 */
let nP_temPureProjectData = null;
let nP_temExampleProjectData = null;
let nP_temNdkProjectData = null;
let nP_temUiProjectData = null;


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
        case nP_moduleOne:
            nP_isInAir101 = false;
            nP_isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temPureProjectData.libList, nP_moduleOne);
            nP_addOptionToSelect(coreSelected, nP_temPureProjectData.coreList, nP_moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            break;
        case nP_moduleTwo:
            /* 目前 Air72CXC 没有 Core */
            nP_isInAir101 = false;
            nP_isInAirCx72 = true;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", true);
            nP_addOptionToSelect(libSelected, nP_temPureProjectData.libList, nP_moduleTwo);
            nP_addOptionToSelect(coreSelected, nP_temPureProjectData.coreList, nP_moduleTwo);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceCore").show();
            break;
        case nP_moduleThree:
            nP_isInAir101 = false;
            nP_isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temPureProjectData.libList, nP_moduleThree);
            nP_addOptionToSelect(coreSelected, nP_temPureProjectData.coreList, nP_moduleThree);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            /* 目前 Air10X 没有 lib */
            nP_isInAir101 = true;
            nP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temPureProjectData.libList, nP_moduleFour);
            nP_addOptionToSelect(coreSelected, nP_temPureProjectData.coreList, nP_moduleFour);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceLib").show();
            break;
        case nP_moduleFive:
            /* 目前 Air10X 没有 lib */
            nP_isInAir101 = true;
            nP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temPureProjectData.libList, nP_moduleFive);
            nP_addOptionToSelect(coreSelected, nP_temPureProjectData.coreList, nP_moduleFive);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            $(".tip_spaceLib").show();
            break;
        case nP_moduleSix:
            /* 目前 Air10X 没有 lib */
            nP_isInAir101 = true;
            nP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temPureProjectData.libList, nP_moduleSix);
            nP_addOptionToSelect(coreSelected, nP_temPureProjectData.coreList, nP_moduleSix);
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
        nP_autoProduceOption($(".nP-select_getSpace_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".nP-select_getSpace_LibInfo");
    let coreSelected = $(".nP-select_getSpace_CoreInfo");

    switch (moduleSelected.text()) {
        case nP_moduleOne:
            nP_isInAir101 = false;
            nP_isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleOne);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="space_customeCoreOption">自定义</option>');
            break;
        case nP_moduleTwo:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleTwo);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleTwo);
            break;
        case nP_moduleThree:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleThree);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleThree);
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleFour);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleFour);
            break;
        case nP_moduleFive:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleFive);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleFive);
            break;
        case nP_moduleSix:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleSix);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleSix);
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
    if (nP_isInImportProject) {
        importSpaceProject(nP_temImportData);
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
        case nP_moduleOne:
            nP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(exampleSelected, nP_temExampleProjectData.exampleList, nP_moduleOne);
            nP_addOptionToSelect(coreSelected, nP_temExampleProjectData.coreList, nP_moduleOne);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case nP_moduleTwo:
            nP_isInAirCx72 = true;
            coreSelected.prop("disabled", true);
            nP_addOptionToSelect(exampleSelected, nP_temExampleProjectData.exampleList, nP_moduleTwo);
            nP_addOptionToSelect(coreSelected, nP_temExampleProjectData.coreList, nP_moduleTwo);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            $(".tip_exampleCore").show();
            break;
        case nP_moduleThree:
            nP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(exampleSelected, nP_temExampleProjectData.exampleList, nP_moduleThree);
            nP_addOptionToSelect(coreSelected, nP_temExampleProjectData.coreList, nP_moduleThree);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(exampleSelected, nP_temExampleProjectData.exampleList, nP_moduleFour);
            nP_addOptionToSelect(coreSelected, nP_temExampleProjectData.coreList, nP_moduleFour);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case nP_moduleFive:
            nP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(exampleSelected, nP_temExampleProjectData.exampleList, nP_moduleFive);
            nP_addOptionToSelect(coreSelected, nP_temExampleProjectData.coreList, nP_moduleFive);
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case nP_moduleSix:
            nP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(exampleSelected, nP_temExampleProjectData.exampleList, nP_moduleSix);
            nP_addOptionToSelect(coreSelected, nP_temExampleProjectData.coreList, nP_moduleSix);
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
        nP_autoProduceOption($(".nP-select_getExample_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getExample_ExampleInfo");
    let coreSelected = $(".nP-select_getExample_CoreInfo");

    switch (moduleSelected.text()) {
        case nP_moduleOne:
            nP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleOne);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleOne);
            /* 添加自定义选项 */
            coreSelected.append('<option class="example_customeCoreOption">自定义</option>');
            break;
        case nP_moduleTwo:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleTwo);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleTwo);
            break;
        case nP_moduleThree:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleThree);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleThree);
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleFour);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleFour);
            break;
        case nP_moduleFive:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleFive);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleFive);
            break;
        case nP_moduleSix:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleSix);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleSix);
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    coreSelected.append('<option value="default" id="example_customeCore" style="display: none;">点击选择</option>');

    /* 隐藏提示信息 */
    $(".tip_exampleCore").hide();

    /* 导入工程操作 */
    if (nP_isInImportProject) {
        importExampleProject(nP_temImportData);
    }
}


/* 新建工程 模块型号select添加刷新数据[NDK工程] */
$(".nP-select_getNDK_ModuleInfo").on("change", function () {
    let moduleSelected = $(".nP-select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getNDK_ExampleInfo");

    exampleSelected.empty();

    switch (moduleSelected.text()) {
        case nP_moduleOne:
            nP_addOptionToSelect(exampleSelected, nP_temNdkProjectData.exampleList, nP_moduleOne);
            break;
        case nP_moduleTwo:
            nP_addOptionToSelect(exampleSelected, nP_temNdkProjectData.exampleList, nP_moduleTwo);
            break;
        case nP_moduleThree:
            nP_addOptionToSelect(exampleSelected, nP_temNdkProjectData.exampleList, nP_moduleThree);
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_addOptionToSelect(exampleSelected, nP_temNdkProjectData.exampleList, nP_moduleFour);
            break;
        case nP_moduleFive:
            nP_addOptionToSelect(exampleSelected, nP_temNdkProjectData.exampleList, nP_moduleFive);
            break;
        case nP_moduleSix:
            nP_addOptionToSelect(exampleSelected, nP_temNdkProjectData.exampleList, nP_moduleSix);
            break;
        default:
            break;
    }
});


/* 新建工程初始化数据管理[NDK工程] */
function ndkProjectInitDataManagment(initData) {
    /* 添加初始化模块型号 */
    for (let i = 0; i < initData.moduleList.length; i++) {
        nP_autoProduceOption($(".nP-select_getNDK_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".nP-select_getNDK_ExampleInfo");

    switch (moduleSelected.text()) {
        case nP_moduleOne:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleOne);
            break;
        case nP_moduleTwo:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleTwo);
            break;
        case nP_moduleThree:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleThree);
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleFour);
            break;
        case nP_moduleFive:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleFive);
            break;
        case nP_moduleSix:
            nP_addOptionToSelect(exampleSelected, initData.exampleList, nP_moduleSix);
            break;
        default:
            break;
    }

    /* 导入工程操作 */
    if (nP_isInImportProject) {
        importNdkProject(nP_temImportData);
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
        case nP_moduleOne:
            nP_isInAirCx72 = false;
            nP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temUiProjectData.libList, nP_moduleOne);
            nP_addOptionToSelect(coreSelected, nP_temUiProjectData.coreList, nP_moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            break;
        case nP_moduleTwo:
            nP_isInAirCx72 = true;
            nP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", true);
            nP_addOptionToSelect(libSelected, nP_temUiProjectData.libList, nP_moduleTwo);
            nP_addOptionToSelect(coreSelected, nP_temUiProjectData.coreList, nP_moduleTwo);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            // $(".tip_uiCore").show();
            break;
        case nP_moduleThree:
            nP_isInAirCx72 = false;
            nP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temUiProjectData.libList, nP_moduleThree);
            nP_addOptionToSelect(coreSelected, nP_temUiProjectData.coreList, nP_moduleThree);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_isInAirCx72 = false;
            nP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temUiProjectData.libList, nP_moduleFour);
            nP_addOptionToSelect(coreSelected, nP_temUiProjectData.coreList, nP_moduleFour);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case nP_moduleFive:
            nP_isInAirCx72 = false;
            nP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temUiProjectData.libList, nP_moduleFive);
            nP_addOptionToSelect(coreSelected, nP_temUiProjectData.coreList, nP_moduleFive);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case nP_moduleSix:
            nP_isInAirCx72 = false;
            nP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, nP_temUiProjectData.libList, nP_moduleSix);
            nP_addOptionToSelect(coreSelected, nP_temUiProjectData.coreList, nP_moduleSix);
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
        nP_autoProduceOption($(".nP-select_getUi_ModuleInfo"), initData.moduleList[i]);
    }

    let moduleSelected = $(".nP-select_getUi_ModuleInfo option:selected");
    let libSelected = $(".nP-select_getUi_LibInfo");
    let coreSelected = $(".nP-select_getUi_CoreInfo");

    switch (moduleSelected.text()) {
        case nP_moduleOne:
            nP_isInAirCx72 = false;
            nP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleOne);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="ui_customeCoreOption">自定义</option>');
            break;
        case nP_moduleTwo:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleTwo);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleTwo);
            break;
        case nP_moduleThree:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleThree);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleThree);
            break;
        case nP_moduleFour:
        case nP_moduleSeven:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleFour);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleFour);
            break;
        case nP_moduleFive:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleFive);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleFive);
            break;
        case nP_moduleSix:
            nP_addOptionToSelect(libSelected, initData.libList, nP_moduleSix);
            nP_addOptionToSelect(coreSelected, initData.coreList, nP_moduleSix);
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
    if (nP_isInImportProject) {
        importUiProject(nP_temImportData);
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
            nP_temPureProjectData = message.text;
            pureProjectInitDataManagment(message.text);
            break;
        case "exampleProjectInitData":
            nP_temExampleProjectData = message.text;
            exampleProjectInitDataManagment(message.text);
            break;
        case "ndkProjectInitData":
            nP_temNdkProjectData = message.text;
            ndkProjectInitDataManagment(message.text);
            break;
        case "uiProjectInitData":
            nP_temUiProjectData = message.text;
            uiProjectInitDataManagment(message.text);
            break;
            /* 自定义工程路径, lib库, core文件 */
        case "customProjectPath":
            customPathManagment(nP_curActiveContent, "customProjectPath", message.text);
            break;
        case "customLibPath":
            customPathManagment(nP_curActiveContent, "customLibPath", message.text);
            break;
        case "customCorePath":
            customPathManagment(nP_curActiveContent, "customCorePath", message.text);
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
        /* 导入工程命令 ↓*/
        case "importProjectInitData":
            gl_importProjectInitData(message.text.projectType, message.text.data);
            break;
        case "customProjectPathOpenProject":
            gl_iP_customPathManagment("customProjectPath", message.text);
            break;
        case "customLibPathOpenProject":
            gl_iP_customPathManagment("customLibPath", message.text);
            break;
        case "customCorePathOpenProject":
            gl_iP_customPathManagment("customCorePath", message.text);
            break;
        case "importProjectData":
            gl_importProjectData(message.text.type, message.text);
            break;
        /* 导入工程命令 上*/
        default:
            break;
    }
});