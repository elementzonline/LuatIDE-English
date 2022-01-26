//被点击的新建工程选项
let tarActive = $(".menu");
let allContent = $(".iP-content");
let allHideStr = ".iP-content_space, .iP-content_example, .iP-content_ndk, .iP-content_ui";
let cancelBtn = $(".iP-cancel");
let submitBtn = $(".iP-submit");
let curActiveContent = "space";
let temImportData = null;
//工程初始化form
let formArr = $(".iP-form");
//空白工程数据
let sapceData = [
    "iP-space_project_path", "iP-space_project_name"
];
let spaceDynData = [
    "iP-select_getSpace_ModuleInfo", "iP-select_getSpace_LibInfo", "iP-select_getSpace_CoreInfo"
];
//示例工程数据
let exampleData = [
    "iP-example_project_path", "iP-example_project_name"
];
let exampleDynData = [
    "iP-select_getExample_ModuleInfo", "iP-select_getExample_ExampleInfo", "iP-select_getExample_CoreInfo"
];
//NDK数据
let ndkData = [
    "iP-ndk_project_path", "iP-ndk_project_name"
];
let ndkDynData = [
    "iP-select_getNDK_ModuleInfo", "iP-select_getNDK_ExampleInfo"
];
//UI工程数据
let uiData = [
    "iP-ui_project_path", "iP-ui_project_name"
];
let uiDynData = [
    "iP-select_getUi_ModuleInfo", "iP-select_getUi_LibInfo", "iP-select_getUi_CoreInfo"
];
// 判断是否是导入工程
let isInImportProject = false;
// 判断是否是 Air10X 模块型号
let isInAir101 = false;
// 判断是否是 Air72XCX 模块型号
let isInAirCx72 = false;


//激活 VsCode 通信
// const vscode = acquireVsCodeApi();


$(allHideStr).hide()
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
cancelBtn.on("click", function () {
    gl_hideOpenProject();
    switch (curActiveContent) {
        case "pure":
            iP_clearTempData(sapceData, spaceDynData)
            break;
        case "example":
            iP_clearTempData(exampleData, exampleDynData)
            break;
        case "ndk":
            iP_clearTempData(ndkData, ndkDynData)
            break;
        case "ui":
            iP_clearTempData(uiData, uiDynData)
            break;
        default:
            break;
    }
});


//按钮完成逻辑
submitBtn.on("click", function () {
    if (isInImportProject) {
        iP_sendImportProjectData(curActiveContent);
    } else {
        // handleSubmit(curActiveContent);
    }
    switch (curActiveContent) {
        case "pure":
            iP_clearTempData(sapceData, spaceDynData)
            break;
        case "example":
            iP_clearTempData(exampleData, exampleDynData)
            break;
        case "ndk":
            iP_clearTempData(ndkData, ndkDynData)
            break;
        case "ui":
            iP_clearTempData(uiData, uiDynData)
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
    if (isInAir101 && type === "customLibPath") {
        iP_Alert("当前模块型号不支持 lib 配置！");
    } else if (isInAirCx72 && type === "customCorePath") {
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
                    $("#iP-example_customepath").val(pathData);
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
                    $("#iP-ndk_customepath").val(pathData);
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


/* 对组件选择做特殊处理[空白工程] */
$(".iP-select_getSpace_LibInfo").on("change", function () {
    if ($('.iP-select_getSpace_LibInfo option:selected').attr("class") === 'iP_space_customeLibOption') {
        $('.iP-select_getSpace_LibInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSource', 'customLibPath');
    } else {
        $("#space_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[空白工程] */
$(".iP-select_getSpace_CoreInfo").on("change", function () {
    if ($('.iP-select_getSpace_CoreInfo option:selected').attr("class") === 'iP_space_customeCoreOption') {
        $('.iP-select_getSpace_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSource', 'customCorePath');
    } else {
        $("#space_customeCore").prop("display", "none");
    }
});


/* 新建工程初始化数据管理[空白工程] */
function iP_pureProjectInitDataManagment(initData) {
    let libSelected = $(".iP-select_getSpace_LibInfo");
    let coreSelected = $(".iP-select_getSpace_CoreInfo");

    /* 添加工程初始化数据 */
    for (let key in initData) {
        if (key === "libList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(libSelected, initData[key][i])
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(coreSelected, initData[key][i])
            }
        }
    }

    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="space_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="space_customeCore" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    libSelected.append('<option class="iP_space_customeLibOption">自定义</option>');
    coreSelected.append('<option class="iP_space_customeCoreOption">自定义</option>');

    /* 隐藏提示信息 */
    $(".tip_spaceLib").hide();
    $(".tip_spaceCore").hide();

    /* 导入数据操作 */
    importSpaceProject(temImportData);
}


/* 对组件选择做特殊处理[示例工程] */
$(".iP-select_getExample_CoreInfo").on("change", function () {
    if ($('.iP-select_getExample_CoreInfo option:selected').attr("class") === 'iP_example_customeCoreOption') {
        $('.iP-select_getExample_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSource', 'customCorePath');
    } else {
        $("#example_customeCore").prop("display", "none");
    }
});


/* 新建工程初始化数据管理[示例工程] */
function iP_exampleProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getExample_ModuleInfo option:selected");
    let exampleSelected = $(".iP-select_getExample_ExampleInfo");
    let coreSelected = $(".iP-select_getExample_CoreInfo");

    /* 添加工程初始化数据 */
    for (let key in initData) {
        if (key === "exampleList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(exampleSelected, initData[key][i])
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(coreSelected, initData[key][i])
            }
        }
    }

    /* 添加初始化option用来承载自定义选项 */
    coreSelected.append('<option value="default" id="example_customeCore" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    coreSelected.append('<option class="iP_example_customeCoreOption">自定义</option>');

    /* 隐藏提示信息 */
    $(".tip_exampleCore").hide();

    /* 导入数据操作 */
    importExampleProject(temImportData);
}


/* 新建工程初始化数据管理[NDK工程] */
function iP_ndkProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getNDK_ModuleInfo option:selected");
    let exampleSelected = $(".iP-select_getNDK_ExampleInfo");

    /* 添加工程初始化数据 */
    for (let key in initData) {
        if (key === "exampleList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(exampleSelected, initData[key][i])
            }
        }
    }

    /* 导入工程数据 */
    importNdkProject(temImportData);
}


/* 对组件选择做特殊处理[UI工程] */
$(".iP-select_getUi_LibInfo").on("change", function () {
    if ($('.iP-select_getUi_LibInfo option:selected').attr("class") === 'iP_ui_customeLibOption') {
        $('.iP-select_getUi_LibInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSource', 'customLibPath');
    } else {
        $("#ui_customeLib").prop("display", "none");
    }
});
/* 对Core选择做特殊处理[UI工程] */
$(".iP-select_getUi_CoreInfo").on("change", function () {
    if ($('.iP-select_getUi_CoreInfo option:selected').attr("class") === 'iP_ui_customeCoreOption') {
        $('.iP-select_getUi_CoreInfo option:first').prop("selected", "selected");
        iP_handelBackstageExtra('openSource', 'customCorePath');
    } else {
        $("#ui_customeCore").prop("display", "none");
    }
});


/* 新建工程初始化数据管理[UI工程] */
function iP_uiProjectInitDataManagment(initData) {
    let moduleSelected = $(".iP-select_getUi_ModuleInfo option:selected");
    let libSelected = $(".iP-select_getUi_LibInfo");
    let coreSelected = $(".iP-select_getUi_CoreInfo");

    /* 添加工程初始化数据 */
    for (let key in initData) {
        if (key === "libList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(libSelected, initData[key][i])
            }
        }
        if (key === "coreList") {
            for (let i = 0; i < initData[key].length; i++) {
                iP_autoProduceOption(coreSelected, initData[key][i])
            }
        }
    }

    /* 添加初始化option用来承载自定义选项 */
    libSelected.append('<option value="default" id="ui_customeLib" style="display: none;">点击选择</option>');
    coreSelected.append('<option value="default" id="ui_customeCore" style="display: none;">点击选择</option>');

    /* 添加自定义选项 */
    libSelected.append('<option class="iP_ui_customeLibOption">自定义</option>');
    coreSelected.append('<option class="iP_ui_customeCoreOption">自定义</option>');

    /* 隐藏提示信息 */
    // $(".tip_uiLib").hide();
    // $(".tip_uiCore").hide();

    importUiProject(temImportData);
}


/********************************************** 导入工程[用户原始数据] **********************************************/

/* 添加红框提示错误 */
function iP_addTips(tar) {
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
                $("input[name=iP-space_project_name]").val(importData.correctData[key1]);
                break;
            case "projectPath":
                $("input[name=iP-space_project_path]").val(importData.correctData[key1]);
                break;
            case "moduleModel":
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".iP-select_getSpace_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getSpace_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getSpace_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
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
                iP_addTips($("input[name=iP-space_project_name]"));
                $("input[name=iP-space_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                iP_addTips($("input[name=iP-space_project_path]"));
                $("input[name=iP-space_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                iP_addTips($(".iP-select_getSpace_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".iP-select_getSpace_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getSpace_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getSpace_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "libPath":
                iP_addTips($(".iP-select_getSpace_LibInfo"));
                $("#space_customeLib").text(importData.errorData[key2]);
                break;
            case "corePath":
                iP_addTips($(".iP-select_getSpace_CoreInfo"));
                $("#space_customeCore").text(importData.errorData[key2]);
                break;
            default:
                break;
        }
    }

    $('.iP-select_getSpace_LibInfo').find("option[id=space_customeLib]").prop("selected", "selected");
    $('.iP-select_getSpace_CoreInfo').find("option[id=space_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=iP-space_project_path]").prop("disabled", true);
    $("input[name=iP-space_project_name]").prop("disabled", true);
    $(".iP-select_getSpace_ModuleInfo").prop("disabled", true);
}


/* 导入工程 初始化数据管理[示例工程] */
function importExampleProject(importData) {
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
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".iP-select_getExample_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getExample_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getExample_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "example":
                $(".iP-select_getExample_ExampleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
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
                iP_addTips($("input[name=iP-example_project_name]"));
                $("input[name=iP-example_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                iP_addTips($("input[name=iP-example_project_path]"));
                $("input[name=iP-example_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                iP_addTips($(".iP-select_getExample_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".iP-select_getExample_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getExample_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getExample_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "example":
                iP_addTips($(".iP-select_getExample_ExampleInfo"));
                $(".iP-select_getExample_ExampleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "corePath":
                iP_addTips($(".iP-select_getExample_CoreInfo"));
                $("#example_customeCore").text(importData.errorData[key2]);
                break;
            default:
                break;
        }
    }

    $('.iP-select_getExample_CoreInfo').find("option[id=example_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=iP-example_project_path]").prop("disabled", true);
    $("input[name=iP-example_project_name]").prop("disabled", true);
    $(".iP-select_getExample_ModuleInfo").prop("disabled", true);
}


/* 导入工程 初始化数据管理[NDK工程] */
function importNdkProject(importData) {
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
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".iP-select_getNDK_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getNDK_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getNDK_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            case "example":
                $(".iP-select_getNDK_ExampleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                break;
            default:
                break;
        }
    }

    /* 错误数据 */
    for (let key2 in importData.errorData) {
        switch (key2) {
            case "projectName":
                iP_addTips($("input[name=iP-ndk_project_name]"));
                $("input[name=iP-ndk_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                iP_addTips($("input[name=iP-ndk_project_path]"));
                $("input[name=iP-ndk_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                iP_addTips($(".iP-select_getNDK_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".iP-select_getNDK_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getNDK_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getNDK_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "example":
                iP_addTips($(".iP-select_getNDK_ExampleInfo"));
                $(".iP-select_getNDK_ExampleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            default:
                break;
        }
    }

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=iP-ndk_project_path]").prop("disabled", true);
    $("input[name=iP-ndk_project_name]").prop("disabled", true);
    $(".iP-select_getNDK_ModuleInfo").prop("disabled", true);
}


/* 导入工程 初始化数据管理[UI工程] */
function importUiProject(importData) {
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
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.correctData[key1] === temModule[i]) {
                //         $(".iP-select_getUi_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getUi_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getUi_ModuleInfo").append('<option selected>' + importData.correctData[key1] + '</option>');
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
                iP_addTips($("input[name=iP-ui_project_name]"));
                $("input[name=iP-ui_project_name]").val(importData.errorData[key2]);
                break;
            case "projectPath":
                iP_addTips($("input[name=iP-ui_project_path]"));
                $("input[name=iP-ui_project_path]").val(importData.errorData[key2]);
                break;
            case "moduleModel":
                iP_addTips($(".iP-select_getUi_ModuleInfo"));
                // let temModule = [moduleOne, moduleTwo, moduleThree, moduleFour, moduleFive, moduleSix];
                // for (let i = 0; i < temModule.length; i++) {
                //     if (importData.errorData[key2] === temModule[i]) {
                //         $(".iP-select_getUi_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                //     } else {
                //         iP_autoProduceOption($(".iP-select_getUi_ModuleInfo"), temModule[i]);
                //     }
                // }
                $(".iP-select_getUi_ModuleInfo").append('<option selected>' + importData.errorData[key2] + '</option>');
                break;
            case "libPath":
                iP_addTips($(".iP-select_getUi_LibInfo"));
                $("#ui_customeLib").text(importData.errorData[key2]);
                break;
            case "corePath":
                iP_addTips($(".iP-select_getUi_CoreInfo"));
                $("#ui_customeCore").text(importData.errorData[key2]);
                break;
            default:
                break;
        }
    }

    $('.iP-select_getUi_LibInfo').find("option[id=ui_customeLib]").prop("selected", "selected");
    $('.iP-select_getUi_CoreInfo').find("option[id=ui_customeCore]").prop("selected", "selected");

    /* 禁用工程路径, 工程名称, 模块信号的修改 */
    $("input[name=iP-ui_project_path]").prop("disabled", true);
    $("input[name=iP-ui_project_name]").prop("disabled", true);
    $(".iP-select_getUi_ModuleInfo").prop("disabled", true);
}


/* 导入工程界面初始化 */
function importProjectDisplay(whichDsp, projectType, importData) {
    /* 隐藏选择框 */
    $(".iP-tip_title").hide();
    if (importData.errorData !== "") {
        $(".iP-tips").show();
    }
    $(allHideStr).hide();
    whichDsp.show();
    temImportData = importData;

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
    let projectPath = $("input[name=" + tar + "_project_path]").val();
    let projectName = $("input[name=" + tar + "_project_name]").val();
    if (!projectName.trim() || !projectPath) {
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
            vscode.postMessage({
                command: "importProject",
                text: {
                    "type": "pure",
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
                        "libPath": $(".iP-select_getUi_LibInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getUi_LibInfo option:selected").text(),
                        "moduleModel": $(".iP-select_getUi_ModuleInfo option:selected").text(),
                        "corePath": $(".iP-select_getUi_CoreInfo option:selected").text() === "点击选择" ? "" : $(".iP-select_getUi_CoreInfo option:selected").text(),
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
/********************************************** 导入工程[用户原始数据] **********************************************/


/* 获取vscode端发送的数据 */
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        /* 导入工程初始化数据获取 */
        case "importProjectInitData":
            importProjectInitData = message.text.data;
            switch (message.text.projectType) {
                case "pure":
                    iP_pureProjectInitDataManagment(message.text.data);
                    break;
                case "example":
                    iP_exampleProjectInitDataManagment(message.text.data);
                    break;
                case "ndk":
                    iP_ndkProjectInitDataManagment(message.text.data);
                    break;
                case "ui":
                    iP_uiProjectInitDataManagment(message.text.data);
                    break;
                default:
                    break;
            }
            break;
            /* 自定义工程路径, lib库, core文件 */
        case "customProjectPathOpenProject":
            iP_customPathManagment(curActiveContent, "customProjectPath", message.text);
            break;
        case "customLibPathOpenProject":
            iP_customPathManagment(curActiveContent, "customLibPath", message.text);
            break;
        case "customCorePathOpenProject":
            iP_customPathManagment(curActiveContent, "customCorePath", message.text);
            break;
            /* 获取导入工程数据[用户] */
        case "importProjectData":
            let targetProject = null;
            isInImportProject = true;
            switch (message.text.type) {
                case "pure":
                    curActiveContent = "space";
                    targetProject = $(".iP-content_space");
                    break;
                case "example":
                    curActiveContent = "example";
                    targetProject = $(".iP-content_example");
                    break;
                case "ndk":
                    curActiveContent = "ndk";
                    targetProject = $(".iP-content_ndk");
                    break;
                case "ui":
                    curActiveContent = "ui";
                    targetProject = $(".iP-content_ui");
                    break;
                default:
                    break;
            }
            importProjectDisplay(targetProject, curActiveContent, message.text);
            break;
        default:
            break;
    }
});