//局部全局变量
let GCName = "";
let GCPath = "";

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

//初始化激活空白工程
$(allHideStr).hide();
$(".content_space").show();
$("#space").addClass("active");

//激活 VsCode 通信
// const vscode = acquireVsCodeApi();

//清楚工程临时数据
function clearTempData(tar1, tar2) {
    for (let i = 0; i < tar1.length; i++) {
        document.getElementsByName(tar1[i])[0].value = null;
    };
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
            getMessagePerSwitch("space");
            curActiveContent = "space";
            $(".content_space").show();
            break;
        case "example":
            clearTempData(exampleData, exampleDynData);
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
    // TODO
});

//按钮完成逻辑
submitBtn.on("click", function () {
    handleSubmit(curActiveContent);
});

// 自定义按钮
$(".exBtn").on("click", function () {
    let signal = $(this).attr("class");
    handelBackstage(signal);
})

/* 为下拉框添加选项 */
function autoProduceOption(par, val) {
    par.append('<option value="' + val + '" selected>' + val + '</option>');
}

/* 具体添加数据 */
// obj          接收 vscode 发送的数据
// tar          需要添加数据的下拉框对象class
function addOptions(obj, tar) {
    for (let key in obj) {
        // 模块型号
        if (key.indexOf("module") > -1 && tar.indexOf("Module") > -1) {
            for (let i = 0; i < obj[key].length; i++) {
                autoProduceOption($("." + tar), obj[key][i]);
            }
        }
        // lib库
        if (key.indexOf("lib") > -1 && tar.indexOf("Lib") > -1) {
            for (let i = 0; i < obj[key].length; i++) {
                autoProduceOption($("." + tar), obj[key][i]);
            }
        }
        // 示例
        if (key.indexOf("example") > -1 && tar.indexOf("Example") > -1) {
            for (let i = 0; i < obj[key].length; i++) {
                autoProduceOption($("." + tar), obj[key][i]);
            }
        }
        // core
        if (key.indexOf("core") > -1 && tar.indexOf("Core") > -1) {
            for (let i = 0; i < obj[key].length; i++) {
                autoProduceOption($("." + tar), obj[key][i]);
            }
        }
    }
}

/********************************************** 导入工程 **********************************************/
function importProjectDisplay(whichDsp) {
    /* 隐藏选择框 */
    $(".navbar").hide();
    $(".tips").show();
    $(allHideStr).hide();
    whichDsp.show()
}

/* 添加红框提示错误 */
function addTips(tar) {
    tar.css({
        "border": "1px solid #b42525"
    });
}

/* 判断那个需要添加提示 */
function whichTips(tar) {
    switch (key) {
        case value:
            
            break;
    
        default:
            break;
    }
}
/********************************************** 导入工程 **********************************************/

/*********************************************** 数据交互↓ ************************************************/

// 每次切换工程发送相应的工程类型
function getMessagePerSwitch(para) {
    // vscode.postMessage({
    //     command: 'projectType',
    //     text: para,
    // })
}

//发送给后台，由后台打开选择文件夹
function handelBackstage(name) {
    vscode.postMessage({
        command: name,
    })
}

//Alert
function Alert(msg) {
    vscode.postMessage({
        command: "Alert",
        text: {
            "msg": msg,
        }
    })
}

//实时获取新建工程名称并导入工程路径
function getCurProjectName(e) {
    GCName = e;
    if (GCPath) {
        document.querySelector('.content .project_path').value = GCPath + GCName;
    }
}

//工程提交
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
            })
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
            })
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
            })
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
            })
            break;

        default:
            break;
    }
    $(".father").hide();
    //关闭 WebView
}


/* 获取vscode端发送的数据 */
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case "pureProjectInitData":
            for (let j = 0; j < spaceDynData.length; j++) {
                addOptions(message.text, spaceDynData[j]);
            }
            break;
        case "exampleProjectInitData":
            for (let j = 0; j < exampleDynData.length; j++) {
                addOptions(message.text, exampleDynData[j]);
            }
            break;
        case "ndkProjectInitData":
            for (let j = 0; j < ndkDynData.length; j++) {
                addOptions(message.text, ndkDynData[j]);
            }
            break;
        case "uiProjectInitData":
            for (let j = 0; j < uiDynData.length; j++) {
                addOptions(message.text, uiDynData[j]);
            }
            break;
            // TODO
        case "导入工程":
            // 判断是哪个工程
            let targetProject = null;
            switch (message.text) {
                case value:
                    targetProject = $(".content_space");
                    /* 添加相应的导入数据 */
                    break;
                case value:
                    targetProject = $(".content_example");
                    break;
                case value:
                    targetProject = $(".content_ndk");
                    break;
                case value:
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
