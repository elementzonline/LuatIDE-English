//被点击的导入工程选项
let iP_allContent = $(".iP-content");
let iP_allHideStr = ".iP-content_space, .iP-content_example, .iP-content_ndk, .iP-content_ui";
let iP_cancelBtn = $(".iP-cancel");
let iP_submitBtn = $(".iP-submit");
let iP_curActiveContent = "space";
let iP_temImportData = null;
//工程初始化form
let formArr = $(".iP-form");
//空白工程数据
let iP_sapceData = [
    "iP-space_project_path", "iP-space_project_name"
];
let iP_spaceDynData = [
    "iP-select_getSpace_ModuleInfo", "iP-select_getSpace_LibInfo", "iP-select_getSpace_CoreInfo"
];
//示例工程数据
let iP_exampleData = [
    "iP-example_project_path", "iP-example_project_name"
];
let iP_exampleDynData = [
    "iP-select_getExample_ModuleInfo", "iP-select_getExample_ExampleInfo", "iP-select_getExample_CoreInfo"
];
//NDK数据
let iP_ndkData = [
    "iP-ndk_project_path", "iP-ndk_project_name"
];
let iP_ndkDynData = [
    "iP-select_getNDK_ModuleInfo", "iP-select_getNDK_ExampleInfo", "iP-select_getNDK_LibInfo", "iP-select_getNDK_CoreInfo"
];
//UI工程数据
let iP_uiData = [
    "iP-ui_project_path", "iP-ui_project_name"
];
let iP_uiDynData = [
    "iP-select_getUi_ModuleInfo", "iP-select_getUi_LibInfo", "iP-select_getUi_CoreInfo"
];
// 判断是否是导入工程
let iP_isInImportProject = false;
// 判断是否是 Air10X 模块型号
let iP_isInAir101 = false;
// 判断是否是 Air72XCX 模块型号
let iP_isInAirCx72 = false;
//判断是否导入的是 LuatTools 项目
let isLuatTools = false;
// 当前的模块型号的值
let curSaveModule = "";
// 不同工程的保存数据
let iP_temPureProjectData = null,
    iP_temExampleProjectData = null,
    iP_temNdkProjectData = null,
    iP_temUiProjectData = null;



$(iP_allHideStr).hide()
$(".iP-content_space").show()

//清楚工程临时数据
function iP_clearTempData(tar1, tar2) {
    for (let i = 0; i < tar1.length; i++) {
        document.getElementsByName(tar1[i])[0].value = null;
    }
    for (let j = 0; j < tar2.length; j++) {
        $("." + tar2[j]).empty();
    }
}


//按钮取消逻辑
iP_cancelBtn.on("click", function () {
    $(".openProjectHtml").hide();
    switch (iP_curActiveContent) {
        case "space":
            iP_clearTempData(iP_sapceData, iP_spaceDynData)
            break;
        case "example":
            iP_clearTempData(iP_exampleData, iP_exampleDynData)
            break;
        case "ndk":
            iP_clearTempData(iP_ndkData, iP_ndkDynData)
            break;
        case "ui":
            iP_clearTempData(iP_uiData, iP_uiDynData)
            break;
        default:
            break;
    }
    isDisOpenProjectHtml = false;
});

$(".iP-cancelOpenProject").on("click", function () {
    $(".openProjectHtml").hide();
    switch (iP_curActiveContent) {
        case "space":
            iP_clearTempData(iP_sapceData, iP_spaceDynData)
            break;
        case "example":
            iP_clearTempData(iP_exampleData, iP_exampleDynData)
            break;
        case "ndk":
            iP_clearTempData(iP_ndkData, iP_ndkDynData)
            break;
        case "ui":
            iP_clearTempData(iP_uiData, iP_uiDynData)
            break;
        default:
            break;
    }
    isDisOpenProjectHtml = false;
});

//按钮完成逻辑
iP_submitBtn.on("click", function () {
    if (iP_isInImportProject) {
        iP_sendImportProjectData(iP_curActiveContent);
    } else {
        // handleSubmit(iP_curActiveContent);
    }
    switch (iP_curActiveContent) {
        case "space":
            iP_clearTempData(iP_sapceData, iP_spaceDynData)
            break;
        case "example":
            iP_clearTempData(iP_exampleData, iP_exampleDynData)
            break;
        case "ndk":
            iP_clearTempData(iP_ndkData, iP_ndkDynData)
            break;
        case "ui":
            iP_clearTempData(iP_uiData, iP_uiDynData)
            break;
        default:
            break;
    }
});


/* 为下拉框添加选项 */
function iP_autoProduceOption(par, val) {
    par.append('<option>' + val + '</option>');
}


/*********************************************** 数据交互↓ ************************************************/
/* 为下拉框添加选项 */
function iP_addOptionToSelect(whichSelect, arr, whichModule) {
    for (let i = 0; i < arr[whichModule].length; i++) {
        iP_autoProduceOption(whichSelect, arr[whichModule][i]);
    }
}


/* 获取导入工程初始化数据命令 */
function getImportProjectInitData(para) {
    vscode.postMessage({
        command: 'getImportProjectInitData',
        text: para
    });
}


//发送给后台，由后台打开选择文件夹
function iP_handelBackstage(name, type) {
    vscode.postMessage({
        command: name,
        text: type
    });
}


/* 对 Air10X 和 Air72XCX 模块型号做特殊处理 */
function iP_handelBackstageExtra(name, type) {
    if (iP_isInAir101 && type === "customLibPath") {
        iP_Alert("当前模块型号不支持 lib 配置！");
    } else if (iP_isInAirCx72 && type === "customCorePath") {
        iP_Alert("当前模块型号不支持 core 配置！");
    } else {
        vscode.postMessage({
            command: name,
            text: type
        });
    }
}


//Alert
function iP_Alert(msg) {
    vscode.postMessage({
        command: "Alert",
        text: {
            "msg": msg,
        }
    });
}


/* 导入工程 接受VsCode发送的自定义路径 */
function iP_customPathManagment(whichProject, whichCustom, pathData) {
    switch (whichProject) {
        case "space":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#iP-space_customepath").val(pathData);
                    break;
                case "customLibPath":
                    $("#iP-space_customeLib").text(pathData);
                    $("#iP-space_customeLib").prop("selected", true);
                    $("#iP-space_customeLib").prop("display", "block");
                    break;
                case "customCorePath":
                    $("#iP-space_customeCore").text(pathData);
                    $("#iP-space_customeCore").prop("selected", true);
                    $("#iP-space_customeCore").prop("display", "block");
                    break;
                default:
                    break;
            }
            break;
        case "example":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#iP-example_customepath").val(pathData);
                    break;
                case "customCorePath":
                    $("#iP-example_customeCore").text(pathData);
                    $("#iP-example_customeCore").prop("selected", true);
                    $("#iP-example_customeCore").prop("display", "block");
                    break;
                default:
                    break;
            }
            break;
        case "ndk":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#iP-ndk_customepath").val(pathData);
                    break;
                case "customLibPath":
                    $("#iP-ndk_customeLib").text(pathData);
                    $("#iP-ndk_customeLib").prop("selected", true);
                    $("#iP-ndk_customeLib").prop("display", "block");
                    break;
                case "customCorePath":
                    $("#iP-ndk_customeCore").text(pathData);
                    $("#iP-ndk_customeCore").prop("selected", true);
                    $("#iP-ndk_customeCore").prop("display", "block");
                    break;
                default:
                    break;
            }
            break;
        case "ui":
            switch (whichCustom) {
                case "customProjectPath":
                    $("#iP-ui_customepath").val(pathData);
                    break;
                case "customLibPath":
                    $("#iP-ui_customeLib").text(pathData);
                    $("#iP-ui_customeLib").prop("selected", true);
                    $("#iP-ui_customeLib").prop("display", "block");
                    break;
                case "customCorePath":
                    $("#iP-ui_customeCore").text(pathData);
                    $("#iP-ui_customeCore").prop("selected", true);
                    $("#iP-ui_customeCore").prop("display", "block");
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
const iP_moduleOne = "air72XUX/air82XUX";
const iP_moduleTwo = "air72XCX/air60XCX/air78XCX";
const iP_moduleThree = "simulator";
const iP_moduleFour = "air101";
const iP_moduleFive = "air103";
const iP_moduleSix = "air105";
const iP_moduleSeven = "esp32c3";


let initModuleArr = [iP_moduleOne, iP_moduleTwo, iP_moduleThree, iP_moduleFour, iP_moduleFive, iP_moduleSix, iP_moduleSeven];


/* 判断模块型号是否符合规范 */
function iP_isCorrectModule(tar) {
    switch (tar) {
        case iP_moduleOne:
            return tar;
        case iP_moduleTwo:
            return tar;
        case iP_moduleThree:
            return tar;
        case iP_moduleFour:
            return tar;
        case iP_moduleFive:
            return tar;
        case iP_moduleSix:
            return tar;
        case iP_moduleSeven:
            return tar;
        default:
            return false;
    }
}


/*************************************************空白工程************************************************/
/* 对组件选择做特殊处理[空白工程] */
$(".iP-select_getSpace_LibInfo").on("change", function () {
    if ($('.iP-select_getSpace_LibInfo option:selected').attr("class") === 'iP_space_customeLibOption') {
        $('.iP-select_getSpace_LibInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customLibPathOpenProject');
    } else {
        $("#iP-space_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[空白工程] */
$(".iP-select_getSpace_CoreInfo").on("change", function () {
    if ($('.iP-select_getSpace_CoreInfo option:selected').attr("class") === 'iP_space_customeCoreOption') {
        $('.iP-select_getSpace_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customCorePathOpenProject');
    } else {
        $("#iP-space_customeCore").prop("display", "none");
    }
});


/* 导入工程初始化数据管理[空白工程] */
function iP_pureProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getSpace_ModuleInfo");
    let libSelected = $(".iP-select_getSpace_LibInfo");
    let coreSelected = $(".iP-select_getSpace_CoreInfo");

    /* 添加初始化模块型号 */
    for (let i = 0; i < initModuleArr.length; i++) {
        iP_autoProduceOption(moduleSelected, initModuleArr[i]);
    }

    /* 添加模块型号显示选项 */
    moduleSelected.append('<option value="default" id="iP-space_customeModule" style="display: none;">点击选择</option>');

    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="iP-space_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="iP-space_customeCore" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
    coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');

    /* 隐藏提示信息 */
    $(".tip_spaceLib").hide();
    $(".tip_spaceCore").hide();

    /* 导入数据操作 */
    importSpaceProject(iP_temImportData, initData);
}


/* 导入工程 模块型号select添加刷新数据[空白工程] */
$(".iP-select_getSpace_ModuleInfo").on("change", function () {
    let moduleSelected = $(".iP-select_getSpace_ModuleInfo option:selected");
    let libSelected = $(".iP-select_getSpace_LibInfo");
    let coreSelected = $(".iP-select_getSpace_CoreInfo");

    libSelected.empty();
    coreSelected.empty();

    switch (moduleSelected.text()) {
        case iP_moduleOne:
            iP_isInAir101 = false;
            iP_isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleOne);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        case iP_moduleTwo:
            /* 目前 Air72CXC 没有 Core */
            iP_isInAir101 = false;
            iP_isInAirCx72 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleTwo);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleTwo);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        case iP_moduleThree:
            iP_isInAir101 = false;
            iP_isInAirCx72 = true;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", true);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleThree);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleThree);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        case iP_moduleFour:
            /* 目前 Air10X 没有 lib */
            iP_isInAir101 = true;
            iP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleFour);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleFour);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        case iP_moduleFive:
            /* 目前 Air10X 没有 lib */
            iP_isInAir101 = true;
            iP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleFive);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleFive);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        case iP_moduleSix:
            /* 目前 Air10X 没有 lib */
            iP_isInAir101 = true;
            iP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleSix);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleSix);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        case iP_moduleSeven:
            /* 目前 Air10X 没有 lib */
            iP_isInAir101 = true;
            iP_isInAirCx72 = false;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temPureProjectData.libList, iP_moduleSeven);
            iP_addOptionToSelect(coreSelected, iP_temPureProjectData.coreList, iP_moduleSeven);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="space_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="space_customeCore" style="display: none;">点击选择</option>');
});


/*************************************************示例工程************************************************/
/* 对组件选择做特殊处理[示例工程] */
$(".iP-select_getExample_CoreInfo").on("change", function () {
    if ($('.iP-select_getExample_CoreInfo option:selected').attr("class") === 'iP_example_customeCoreOption') {
        $('.iP-select_getExample_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customCorePathOpenProject');
    } else {
        $("#iP-example_customeCore").prop("display", "none");
    }
});


/* 导入工程初始化数据管理[示例工程] */
function iP_exampleProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getExample_ModuleInfo");
    let exampleSelected = $(".iP-select_getExample_ExampleInfo");
    let coreSelected = $(".iP-select_getExample_CoreInfo");
    
    /* 添加初始化模块型号 */
    for (let i = 0; i < initModuleArr.length; i++) {
        iP_autoProduceOption(moduleSelected, initModuleArr[i]);
    }

    /* 添加模块型号显示选项 */
    moduleSelected.append('<option value="default" id="iP-example_customeModule" style="display: none;">点击选择</option>');

    /* 添加初始化option用来承载自定义选项 */
    exampleSelected.append('<option value="default" id="iP-example_customeExample" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="iP-example_customeCore" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');

    /* 隐藏提示信息 */
    $(".tip_exampleCore").hide();

    /* 导入数据操作 */
    importExampleProject(iP_temImportData, initData);
}


/* 导入工程 模块型号select添加刷新数据[示例工程] */
$(".iP-select_getExample_ModuleInfo").on("change", function () {
    let moduleSelected = $(".iP-select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".iP-select_getExample_ExampleInfo");
    let coreSelected = $(".iP-select_getExample_CoreInfo");

    exampleSelected.empty();
    coreSelected.empty();

    switch (moduleSelected.text()) {
        case iP_moduleOne:
            iP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleOne);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleOne);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        case iP_moduleTwo:
            iP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleTwo);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleTwo);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        case iP_moduleThree:
            iP_isInAirCx72 = true;
            coreSelected.prop("disabled", true);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleThree);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleThree);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        case iP_moduleFour:
            iP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleFour);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleFour);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        case iP_moduleFive:
            iP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleFive);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleFive);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        case iP_moduleSix:
            iP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleSix);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleSix);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        case iP_moduleSeven:
            iP_isInAirCx72 = false;
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(exampleSelected, iP_temExampleProjectData.exampleList, iP_moduleSeven);
            iP_addOptionToSelect(coreSelected, iP_temExampleProjectData.coreList, iP_moduleSeven);
            coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    coreSelected.append('<option value="default" id="iP-example_customeCore" style="display: none;">点击选择</option>');
});


/*************************************************NDK工程************************************************/
/* 对组件选择做特殊处理[NDK工程] */
$(".iP-select_getNDK_LibInfo").on("change", function () {
    if ($('.iP-select_getNDK_LibInfo option:selected').attr("class") === 'iP_ndk_customeLibOption') {
        $('.iP-select_getNDK_LibInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customLibPathOpenProject');
    } else {
        $("#iP-ndk_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[NDK工程] */
$(".iP-select_getNDK_CoreInfo").on("change", function () {
    if ($('.iP-select_getNDK_CoreInfo option:selected').attr("class") === 'iP_ndk_customeCoreOption') {
        $('.iP-select_getNDK_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customCorePathOpenProject');
    } else {
        $("#iP-ndk_customeCore").prop("display", "none");
    }
});


/* 导入工程初始化数据管理[NDK工程] */
function iP_ndkProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getNDK_ModuleInfo");
    let libSelected = $(".iP-select_getNDK_LibInfo");
    let coreSelected = $(".iP-select_getNDK_CoreInfo");
    let exampleSelected = $(".iP-select_getNDK_ExampleInfo");

    /* 添加初始化模块型号 */
    // for (let i = 0; i < initModuleArr.length; i++) {
    //     iP_autoProduceOption(moduleSelected, initModuleArr[i]);
    // }
    iP_autoProduceOption(moduleSelected, iP_moduleOne);

    /* 添加模块型号显示选项, 把导入的模块型号填入其中 */
    moduleSelected.append('<option value="default" id="iP-ndk_customeModule" style="display: none;">点击选择</option>');

    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="iP-ndk_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="iP-ndk_customeCore" style="display: none;">点击选择</option>');
    exampleSelected.append('<option value="default" id="iP-ndk_customeExample" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    libSelected.append('<option class="iP_ndk_customeLibOption">自定义</option>');
    coreSelected.append('<option class="iP_ndk_customeCoreOption">自定义</option>');

    /* 导入工程数据 */
    importNdkProject(iP_temImportData, initData);
}


/* 导入工程 模块型号select添加刷新数据[NDK工程] */
$(".iP-select_getNDK_ModuleInfo").on("change", function () {
    let moduleSelected = $(".iP-select_getNDK_ModuleInfo option:selected");
    let libSelected = $(".iP-select_getNDK_LibInfo");
    let coreSelected = $(".iP-select_getNDK_CoreInfo");
    let exampleSelected = $(".iP-select_getNDK_ExampleInfo");

    libSelected.empty();
    coreSelected.empty();
    exampleSelected.empty();

    switch (moduleSelected.text()) {
        case iP_moduleOne:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleOne);
            break;
        case iP_moduleTwo:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleTwo);
            break;
        case iP_moduleThree:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleThree);
            break;
        case iP_moduleFour:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleFour);
            break;
        case iP_moduleFive:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleFive);
            break;
        case iP_moduleSix:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleSix);
            break;
        case iP_moduleSeven:
            iP_addOptionToSelect(exampleSelected, iP_temNdkProjectData.exampleList, iP_moduleSeven);
            break;
        default:
            break;
    }
});


/*************************************************UI工程************************************************/
/* 对组件选择做特殊处理[UI工程] */
$(".iP-select_getUi_LibInfo").on("change", function () {
    if ($('.iP-select_getUi_LibInfo option:selected').attr("class") === 'iP_ui_customeLibOption') {
        $('.iP-select_getUi_LibInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customLibPathOpenProject');
    } else {
        $("#iP-ui_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[UI工程] */
$(".iP-select_getUi_CoreInfo").on("change", function () {
    if ($('.iP-select_getUi_CoreInfo option:selected').attr("class") === 'iP_ui_customeCoreOption') {
        $('.iP-select_getUi_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSourceOpenProject', 'customCorePathOpenProject');
    } else {
        $("#iP-ui_customeCore").prop("display", "none");
    }
});


/* 导入工程初始化数据管理[UI工程] */
function iP_uiProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getUi_ModuleInfo");
    let libSelected = $(".iP-select_getUi_LibInfo");
    let coreSelected = $(".iP-select_getUi_CoreInfo");

    /* 添加初始化模块型号 */
    for (let i = 0; i < initModuleArr.length; i++) {
        iP_autoProduceOption(moduleSelected, initModuleArr[i]);
    }

    /* 添加模块型号显示选项 */
    moduleSelected.append('<option value="default" id="iP-ui_customeModule" style="display: none;">点击选择</option>');

    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="iP-ui_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="iP-ui_customeCore" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
    coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');

    importUiProject(iP_temImportData, initData);
}


/* 导入工程 模块型号select添加刷新数据[UI工程] */
$(".iP-select_getUi_ModuleInfo").on("change", function () {
    let moduleSelected = $(".iP-select_getUi_ModuleInfo option:selected");
    let libSelected = $(".iP-select_getUi_LibInfo");
    let coreSelected = $(".iP-select_getUi_CoreInfo");

    libSelected.empty();
    coreSelected.empty();

    switch (moduleSelected.text()) {
        case iP_moduleOne:
            iP_isInAirCx72 = false;
            iP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleOne);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleOne);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            break;
        case iP_moduleTwo:
            iP_isInAirCx72 = false;
            iP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleTwo);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleTwo);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            // $(".tip_uiCore").show();
            break;
        case iP_moduleThree:
            iP_isInAirCx72 = true;
            iP_isInAir101 = false;
            libSelected.prop("disabled", false);
            coreSelected.prop("disabled", true);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleThree);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleThree);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            break;
        case iP_moduleFour:
            iP_isInAirCx72 = false;
            iP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleFour);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleFour);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case iP_moduleFive:
            iP_isInAirCx72 = false;
            iP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleFive);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleFive);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case iP_moduleSix:
            iP_isInAirCx72 = false;
            iP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleSix);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleSix);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        case iP_moduleSeven:
            iP_isInAirCx72 = false;
            iP_isInAir101 = true;
            libSelected.prop("disabled", true);
            coreSelected.prop("disabled", false);
            iP_addOptionToSelect(libSelected, iP_temUiProjectData.libList, iP_moduleSeven);
            iP_addOptionToSelect(coreSelected, iP_temUiProjectData.coreList, iP_moduleSeven);
            /* 添加自定义选项 */
            libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
            coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');
            $(".tip_uiLib").show();
            break;
        default:
            break;
    }
    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="ui_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="ui_customeCore" style="display: none;">点击选择</option>');
});


/********************************************** 导入工程[用户原始数据] **********************************************/

/* 添加红框提示错误 */
function iP_addTips(tar) {
    tar.css({
        "border": "1px solid #b42525"
    });
}


/* 导入工程 初始化数据管理[空白工程] */
function importSpaceProject(importData, moduleWhichSelected) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=iP-space_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=iP-space_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                curSaveModule = importData.correctData[key1];
                $("#iP-space_customeModule").text(importData.correctData[key1]);
                $("#iP-space_customeModule").prop("selected", true);
                if(importData.correctData[key1]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key1]==='air101' || importData.correctData[key1]==='air103' || importData.correctData[key1]==='air105' || importData.correctData[key1]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "libPath":
                $("#iP-space_customeLib").text(importData.correctData[key1]);
                break;
            case "corePath":
                $("#iP-space_customeCore").text(importData.correctData[key1]);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                // iP_addTips($("input[name=iP-space_project_name]"));
                $("input[name=iP-space_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                // iP_addTips($("input[name=iP-space_project_path]"));
                $("input[name=iP-space_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                curSaveModule = importData.errorData[key2];
                // iP_addTips($(".iP-select_getSpace_ModuleInfo"));
                $("#iP-space_customeModule").text(importData.errorData[key2]);
                $("#iP-space_customeModule").prop("selected", true);
                if(importData.correctData[key2]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key2]==='air101' || importData.correctData[key2]==='air103' || importData.correctData[key2]==='air105' || importData.correctData[key2]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "libPath":
                iP_addTips($(".iP-select_getSpace_LibInfo"));
                $("#iP-space_customeLib").text(importData.errorData[key2]);
                $(".iP-tips-lib").show();
                break;
            case "corePath":
                iP_addTips($(".iP-select_getSpace_CoreInfo"));
                $("#iP-space_customeCore").text(importData.errorData[key2]);
                $(".iP-tips-core").show();
                break;
            default:
                break;
        }
    }

    $('.iP-select_getSpace_LibInfo').find("option[id=iP-space_customeLib]").prop("selected", "selected");
    $('.iP-select_getSpace_CoreInfo').find("option[id=iP-space_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称的修改(当工程不为 LuatTools 项目时) */
    if (isLuatTools) {
        $("input[name=iP-space_project_path]").prop("disabled", false);
        $("input[name=iP-space_project_name]").prop("disabled", false);
        document.documentElement.style.setProperty("--default-cursorForLuatTools", 'default');
    } else {
        $("input[name=iP-space_project_path]").prop("disabled", true);
        $("input[name=iP-space_project_name]").prop("disabled", false);
        /* 设置导入空白工程时的鼠标样式 */
        document.documentElement.style.setProperty("--default-cursorForLuatTools", 'not-allowed');
    }

    /* 添加工程初始化数据 */
    for (let key in moduleWhichSelected) {
        if (key === "libList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getSpace_LibInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getSpace_CoreInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
    }
}


/* 导入工程 初始化数据管理[示例工程] */
function importExampleProject(importData, moduleWhichSelected) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=iP-example_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=iP-example_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                curSaveModule = importData.correctData[key1];
                $("#iP-example_customeModule").text(importData.correctData[key1]);
                $("#iP-example_customeModule").prop("selected", true);
                if(importData.correctData[key1]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key1]==='air101' || importData.correctData[key1]==='air103' || importData.correctData[key1]==='air105' || importData.correctData[key1]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "example":
                $("#iP-example_customeExample").text(importData.correctData[key1]);
                $("#iP-example_customeExample").prop("selected", true);
                break;
            case "corePath":
                $("#iP-example_customeCore").text(importData.correctData[key1]);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                // iP_addTips($("input[name=iP-example_project_name]"));
                $("input[name=iP-example_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                // iP_addTips($("input[name=iP-example_project_path]"));
                $("input[name=iP-example_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                curSaveModule = importData.errorData[key2];
                $("#iP-example_customeModule").text(importData.errorData[key2]);
                $("#iP-example_customeModule").prop("selected", true);
                if(importData.correctData[key2]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key2]==='air101' || importData.correctData[key2]==='air103' || importData.correctData[key2]==='air105' || importData.correctData[key2]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "example":
                // iP_addTips($(".iP-select_getExample_ExampleInfo"));
                $("#iP-example_customeExample").text(importData.errorData[key2]);
                $("#iP-example_customeExample").prop("selected", true);
                break;
            case "corePath":
                iP_addTips($(".iP-select_getExample_CoreInfo"));
                $("#iP-example_customeCore").text(importData.errorData[key2]);
                $(".iP-tips-core").show();
                break;
            default:
                break;
        }
    }

    $('.iP-select_getExample_CoreInfo').find("option[id=iP-example_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称的修改 */
    $("input[name=iP-example_project_path]").prop("disabled", true);
    $("input[name=iP-example_project_name]").prop("disabled", false);
    
    /* 添加工程初始化数据 */
    for (let key in moduleWhichSelected) {
        if (key === "exampleList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getExample_ExampleInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getExample_CoreInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
    }
}


/* 导入工程 初始化数据管理[NDK工程] */
function importNdkProject(importData, moduleWhichSelected) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=iP-ndk_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=iP-ndk_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                curSaveModule = importData.correctData[key1];
                $("#iP-ndk_customeModule").text(importData.correctData[key1]);
                $("#iP-ndk_customeModule").prop("selected", true);
                if(importData.correctData[key1]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key1]==='air101' || importData.correctData[key1]==='air103' || importData.correctData[key1]==='air105' || importData.correctData[key1]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "libPath":
                $("#iP-ndk_customeLib").text(importData.correctData[key1]);
                $("#iP-ndk_customeLib").prop("selected", true);
                break;
            case "corePath":
                $("#iP-ndk_customeCore").text(importData.correctData[key1]);
                $("#iP-ndk_customeCore").prop("selected", true);
                break;
            case "example":
                $("#iP-ndk_customeExample").text(importData.correctData[key1]);
                $("#iP-ndk_customeExample").prop("selected", true);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                // iP_addTips($("input[name=iP-ndk_project_name]"));
                $("input[name=iP-ndk_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                // iP_addTips($("input[name=iP-ndk_project_path]"));
                $("input[name=iP-ndk_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                curSaveModule = importData.errorData[key2];
                $("#iP-ndk_customeModule").text(importData.errorData[key2]);
                $("#iP-ndk_customeModule").prop("selected", true);
                if(importData.correctData[key2]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key2]==='air101' || importData.correctData[key2]==='air103' || importData.correctData[key2]==='air105' || importData.correctData[key2]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "libPath":
                iP_addTips($(".iP-select_getNDK_LibInfo"));
                $("#iP-ndk_customeLib").text(importData.errorData[key2]);
                $("#iP-ndk_customeLib").prop("selected", true);
                $(".iP-tips-lib").show();
                break;
            case "corePath":
                iP_addTips($(".iP-select_getNDK_CoreInfo"));
                $("#iP-ndk_customeCore").text(importData.errorData[key2]);
                $("#iP-ndk_customeCore").prop("selected", true);
                $(".iP-tips-core").show();
                break;
            case "example":
                // iP_addTips($(".iP-select_getNDK_ExampleInfo"));
                $("#iP-ndk_customeExample").text(importData.errorData[key2]);
                $("#iP-ndk_customeExample").prop("selected", true);
                break;
            default:
                break;
        }
    }

    /* 禁用工程路径, 工程名称的修改 */
    $("input[name=iP-ndk_project_path]").prop("disabled", true);
    $("input[name=iP-ndk_project_name]").prop("disabled", false);
    
    /* 添加工程初始化数据 */
    for (let key in moduleWhichSelected) {
        if (key === "libList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getNDK_LibInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getNDK_CoreInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
        if (key === "exampleList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getNDK_ExampleInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
    }
}


/* 导入工程 初始化数据管理[UI工程] */
function importUiProject(importData, moduleWhichSelected) {
    /* 正确数据 */
    for (let key1 in importData.correctData) {
        switch (key1) {
            case "projectName":
                $("input[name=iP-ui_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=iP-ui_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                curSaveModule = importData.correctData[key1];
                $("#iP-ui_customeModule").text(importData.correctData[key1]);
                $("#iP-ui_customeModule").prop("selected", true);
                if(importData.correctData[key1]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key1]==='air101' || importData.correctData[key1]==='air103' || importData.correctData[key1]==='air105' || importData.correctData[key1]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "libPath":
                $("#iP-ui_customeLib").text(importData.correctData[key1]);
                break;
            case "corePath":
                $("#iP-ui_customeCore").text(importData.correctData[key1]);
                break;
            case "deviceResolution": 
                $("input[name=iP-ui_project_scrCfgWidth]").val(importData.correctData[key1]["width"]);
                $("input[name=iP-ui_project_scrCfgHeight]").val(importData.correctData[key1]["height"]);
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                // iP_addTips($("input[name=iP-ui_project_name]"));
                $("input[name=iP-ui_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                // iP_addTips($("input[name=iP-ui_project_path]"));
                $("input[name=iP-ui_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                curSaveModule = importData.errorData[key2];
                $("#iP-ui_customeModule").text(importData.errorData[key2]);
                $("#iP-ui_customeModule").prop("selected", true);
                if(importData.correctData[key2]==='simulator'){
                    $(".iP-select_getSpace_CoreInfo").prop("disabled", true);
                }
                else if (importData.correctData[key2]==='air101' || importData.correctData[key2]==='air103' || importData.correctData[key2]==='air105' || importData.correctData[key2]==='esp32c3') {
                    $(".iP-select_getSpace_LibInfo").prop("disabled", true);
                }
                break;
            case "libPath":
                iP_addTips($(".iP-select_getUi_LibInfo"));
                $("#iP-ui_customeLib").text(importData.errorData[key2]);
                $(".iP-tips-lib").show();
                break;
            case "corePath":
                iP_addTips($(".iP-select_getUi_CoreInfo"));
                $("#iP-ui_customeCore").text(importData.errorData[key2]);
                $(".iP-tips-core").show();
                break;
            default:
                break;
        }
    }

    $('.iP-select_getUi_LibInfo').find("option[id=iP-ui_customeLib]").prop("selected", "selected");
    $('.iP-select_getUi_CoreInfo').find("option[id=iP-ui_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称以及屏幕分辨率的修改 */
    $("input[name=iP-ui_project_path]").prop("disabled", true);
    $("input[name=iP-ui_project_name]").prop("disabled", false);
    $("input[name=iP-ui_project_scrCfgWidth]").prop("disabled", true);
    $("input[name=iP-ui_project_scrCfgHeight]").prop("disabled", true);
    
    /* 添加工程初始化数据 */
    for (let key in moduleWhichSelected) {
        if (key === "libList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getUi_LibInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < moduleWhichSelected[key][curSaveModule].length; i++) {
                iP_autoProduceOption($(".iP-select_getUi_CoreInfo"), moduleWhichSelected[key][curSaveModule][i]);
            }
        }
    }
}


/* 导入工程界面初始化 */
function importProjectDisplay(whichDsp, projectType, importData) {
    /* 隐藏选择框 */
    $(".iP-tip_title").hide();
    $(".iP-tips-lib").hide();
    $(".iP-tips-core").hide();
    $(iP_allHideStr).hide();
    whichDsp.show();
    iP_temImportData = importData;

    switch (projectType) {
        /* 获取工程初始化数据 */
        case "space":
            getImportProjectInitData("pure");
            break;
        case "example":
            getImportProjectInitData("example");
            break;
        case "ndk":
            getImportProjectInitData("ndk");
            break;
        case "ui":
            getImportProjectInitData("ui");
            break;
        default:
            break;
    }
}


/* 导入工程数据提交 */
function iP_sendImportProjectData(tar) {
    let projectPath = $("input[name=iP-" + tar + "_project_path]").val();
    let projectName = $("input[name=iP-" + tar + "_project_name]").val();
    if (!projectName || !projectPath) {
        iP_Alert('名称或路径不能为空！');
        return false;
    } else {
        //验证上传文件的文件名是否合法
        var reg = new RegExp('[\\\\/:*?\"<>|]');
        if (reg.test(projectName) || reg.length > 255) {
            iP_Alert('工程名称不能包含【\/:*?"<>|】这些非法字符,且长度不超过255个字符,请修改后重新上传!')
            return false;
        }
    }
    switch (tar) {
        case "space":
            let temType = "pure";
            //当导入的工程为 LuatTools 的项目时，修改其中的类型
            if (isLuatTools) {
                temType = "luatTools"
            }
            vscode.postMessage({
                command: "importProject",
                text: {
                    "type": temType,
                    "data": {
                        "projectName": projectName,
                        "projectPath": (projectPath + "\\" + projectName),
                        "libPath": $(".iP-select_getSpace_LibInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getSpace_LibInfo option:selected").text(),
                        "moduleModel": $(".iP-select_getSpace_ModuleInfo option:selected").text(),
                        "corePath": $(".iP-select_getSpace_CoreInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getSpace_CoreInfo option:selected").text(),
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
                        "moduleModel": $(".iP-select_getExample_ModuleInfo option:selected").text(),
                        "corePath": $(".iP-select_getExample_CoreInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getExample_CoreInfo option:selected").text(),
                        "example": $(".iP-select_getExample_ExampleInfo option:selected").text(),
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
                        "moduleModel": $(".iP-select_getNDK_ModuleInfo option:selected").text(),
                        "corePath": $(".iP-select_getNDK_ExampleInfo option:selected").text(),
                        "libPath": $(".iP-select_getNDK_LibInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getNDK_LibInfo option:selected").text(),
                        "example": $(".iP-select_getNDK_ExampleInfo option:selected").text(),
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
                        "libPath": $(".iP-select_getUi_LibInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getUi_LibInfo option:selected").text(),
                        "moduleModel": $(".iP-select_getUi_ModuleInfo option:selected").text(),
                        "corePath": $(".iP-select_getUi_CoreInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getUi_CoreInfo option:selected").text(),
                        "libPath": "",
                        "example": "",
                        "deviceResolution": {
                            "width" : $("input[name=iP-ui_project_scrCfgWidth]").val(),
                            "height": $("input[name=iP-ui_project_scrCfgHeight]").val()
                        }
                    }
                }
            });
            break;
        default:
            break;
    }
    iP_isInImportProject = false;
    $(".openProjectHtml").hide();
}

//#region 
/********************************************** 导入工程[用户原始数据] **********************************************/
// /* 获取vscode端发送的数据 */
// window.addEventListener('message', event => {
//     const message = event.data;
//     switch (message.command) {
//         /* 导入工程初始化数据获取 */
//         case "importProjectInitData":
//             importProjectInitData = message.text.data;
//             switch (message.text.projectType) {
//                 case "pure":
//                     iP_pureProjectInitDataManagment(message.text.data);
//                     break;
//                 case "example":
//                     iP_exampleProjectInitDataManagment(message.text.data);
//                     break;
//                 case "ndk":
//                     iP_ndkProjectInitDataManagment(message.text.data);
//                     break;
//                 case "ui":
//                     iP_uiProjectInitDataManagment(message.text.data);
//                     break;
//                 default:
//                     break;
//             }
//             break;
//             /* 自定义工程路径, lib库, core文件 */
//         case "customProjectPathOpenProject":
//             iP_customPathManagment(iP_curActiveContent, "customProjectPath", message.text);
//             break;
//         case "customLibPathOpenProject":
//             iP_customPathManagment(iP_curActiveContent, "customLibPath", message.text);
//             break;
//         case "customCorePathOpenProject":
//             iP_customPathManagment(iP_curActiveContent, "customCorePath", message.text);
//             break;
//             /* 获取导入工程数据[用户] */
//         case "importProjectData":
//             let targetProject = null;
//             iP_isInImportProject = true;
//             switch (message.text.type) {
//                 case "pure":
//                     iP_curActiveContent = "space";
//                     targetProject = $(".iP-content_space");
//                     break;
//                 case "example":
//                     iP_curActiveContent = "example";
//                     targetProject = $(".iP-content_example");
//                     break;
//                 case "ndk":
//                     iP_curActiveContent = "ndk";
//                     targetProject = $(".iP-content_ndk");
//                     break;
//                 case "ui":
//                     iP_curActiveContent = "ui";
//                     targetProject = $(".iP-content_ui");
//                     break;
//                 default:
//                     break;
//             }
//             importProjectDisplay(targetProject, iP_curActiveContent, message.text);
//             break;
//         default:
//             break;
//     }
// });
//#endregion

/*********************************************外部全局函数***************************************************/

/* 导入工程初始化数据获取 */
function gl_importProjectInitData(type, data) {
    console.log("[[[[init]]]]\n", type);
    console.log("[[[[init]]]]\n", data);
    importProjectInitData = data;
    switch (type) {
        //添加导入 LuatTools 项目的功能
        case "luatTools":
            isLuatTools = true;
            iP_temPureProjectData = data;
            iP_pureProjectInitDataManagment(data);
            break;
        case "pure":
            isLuatTools = false;
            iP_temPureProjectData = data;
            iP_pureProjectInitDataManagment(data);
            break;
        case "example":
            iP_temExampleProjectData = data;
            iP_exampleProjectInitDataManagment(data);
            break;
        case "ndk":
            iP_temNdkProjectData = data;
            iP_ndkProjectInitDataManagment(data);
            break;
        case "ui":
            iP_temUiProjectData = data;
            iP_uiProjectInitDataManagment(data);
            break;
        default:
            break;
    }
}

/* 自定义工程路径, lib库, core文件 */
// data 数据
// type 具体自定义类型
// 1 customProjectPath
// 2 customLibPath
// 3 customCorePath
function gl_iP_customPathManagment(type, data) {
    iP_customPathManagment(iP_curActiveContent, type, data);
}

/* 获取导入工程数据[用户] */
function gl_importProjectData(type, data) {
    console.log("[[[[importData]]]]\n", type);
    console.log("[[[[importData]]]]\n", data);
    let targetProject = null;
    iP_isInImportProject = true;
    switch (type) {
        //添加导入 LuatTools 项目的功能
        case "luatTools":
        case "pure":
            iP_curActiveContent = "space";
            targetProject = $(".iP-content_space");
            break;
        case "example":
            iP_curActiveContent = "example";
            targetProject = $(".iP-content_example");
            break;
        case "ndk":
            iP_curActiveContent = "ndk";
            targetProject = $(".iP-content_ndk");
            break;
        case "ui":
            iP_curActiveContent = "ui";
            targetProject = $(".iP-content_ui");
            break;
        default:
            break;
    }
    importProjectDisplay(targetProject, iP_curActiveContent, data);
}