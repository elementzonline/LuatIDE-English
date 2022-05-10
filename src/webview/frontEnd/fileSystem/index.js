/*
    文件 HTML 格式
    <div class="floderBox">
        <div class="perFloder">
            <div class="floderCont">
                <input type="checkbox" id="tt"> <i class="fa fa-folder"></i> <label for="tt">Main</label>
                <div class="floderChildStyle">
                    <input type="checkbox" id="tt1"> <i class="fa fa-folder"></i> <label for="tt1">Main1</label>
                    <div class="floderChildStyle">
                        <input type="checkbox" id="tt2"> <i class="fa fa-folder"></i> <label for="tt2">Main2</label>
                    </div>
                </div>
            <div class="floderCont">
        <div class="perFloder">
    <div class="floderBox">

    文件 json 树格式
    {
        "f1": "ui.lua",
        "UI": {
            "f2": "fir.c",
            "Res": {
                "f3": "year.html",
                "f4": "mon.js",
            }
        }
    }
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* 定义目录树创建时的相关变量 */
let floderIndex = 0,
    fileIndex = 0;
const floderStr = "floder";
const fileStr = "file";
/* 目录树数据状态统计 */
let fileState = {};
let isOpenProject = false;
/* 保存所有的文件夹 特殊处理*/
let allFloder = [];
/* 是否是文件检测弹出的弹框 */
let autoFileCheck = false;


/*添加文件夹 [树形目录结构]
    格式： 
        <div class="floderCont">
            <input type="checkbox" id="tt"> <i class="fa fa-folder"></i> <label for="tt">UI</label>
        </div>
 */
function addFloder(par, text) {
    /* 返回文件夹所处的div对象Class */
    let ret = undefined;
    let temStr = "";

    floderIndex += 1;
    temStr = '<div class="floderCont ' + floderStr + floderIndex + '">';
    ret = floderStr + floderIndex;
    floderIndex += 1;
    temStr += '<input type="checkbox" id="' + floderStr + floderIndex + '">' + ' <i class="fa fa-folder"></i> ';
    temStr += '<label for="' + floderStr + floderIndex + '">' + text + '</label>';
    par.append(temStr);
    return ret;
}


/*添加文件 [树形目录结构]
    格式： 
        <div class="floderChildStyle">
            <input type="checkbox" id="tt2"> <i class="fa fa-file"></i> <label for="tt2">Main2.lua</label>
        </div>
 */
function addFile(par, text) {
    let temStr = "";

    fileIndex += 1;
    temStr = '<div class="floderChildStyle ' + fileStr + fileIndex + '">';
    fileIndex += 1;
    temStr += '<input type="checkbox" id="' + fileStr + fileIndex + '">' + ' <i class="fa fa-file"></i> ';
    temStr += '<label id="' + fileStr + fileIndex + '-label" for="' + fileStr + fileIndex + '">' + text + '</label>';
    par.append(temStr);
}


/* 递归传递目录树数据 [目录树数据更新] */
let recurseFiles = function (par, name, obj) {
    /* 判断是否是文件夹 */
    if (typeof (obj) === "object") {
        let tPar = addFloder(par, name);
        for (let key in obj) {
            recurseFiles($('.' + tPar), key, obj[key]);
        }
    } else {
        addFile(par, obj);
    }
}


/*
    目录树初始化 [目录树初始化]
    @tar:       目录树对象
*/
function fileTreeInit(tar) {
    let root = $(".main");
    for (let key in tar) {
        if (typeof (tar[key]) === "object") {
            recurseFiles(root, key, tar[key]);
        } else {
            addFile(root, tar[key]);
        }
    }
}


/*
    把数组形式显示的文件按照嵌套关系生成相应的对象
    @tar:       数组文件信息
    @return:    返回对象信息
*/
function createDirTree(dirArr) {
    let treeObj = {};
    let index = 0;
    let str;
    dirArr.forEach((e) => {
        if (!e.match(/^(\.luatide|\.vscode|\.git|\.svn|\.\w+)/)) {
            if (e.match(/\.\w+$/)) {
                index += 1;
                str = "f" + index.toString();
                if (e.includes("\\" || e.includes("/"))) {
                    let arr = e.split("\\");
                    let tem = "";
                    for (let i = 0; i < arr.length - 1; i++) {
                        let o = arr[i];
                        tem += "['" + o + "']";
                        eval("treeObj" + tem + " == undefined ? treeObj" + tem + " = {} : {}");
                    }
                    eval("treeObj" + tem + "['" + str + "']='" + arr[arr.length - 1] + "'");
                } else {
                    treeObj[str] = e;
                }
            } else {
                //对文件夹进行特殊操作，此为特殊情况下的处理
                allFloder.push(e);
            }
        }
    });
    return treeObj;
}


/* 双击文件夹：隐藏/显示子级 */
$('.floderBox').on("dblclick", "label", function () {
    let childs = $(this).parent().find("div");
    if ($(childs).css("display") === "block") {
        $(childs).hide();
    } else {
        $(childs).show();
    }
});


/* 界面操作更新文件状态 */
function updateFileState(par, checked) {
    par.each(function () {
        let arr = [];
        let temS = "";
        /* 排除主父级以及文件夹父级 */
        if (!($(this).prop("id").includes("floder") || $(this).prop("id").includes("root"))) {
            let temC;
            arr[arr.length] = $("#" + $(this).prop("id") + "-label").text();
            temC = $("#" + $(this).prop("id") + "-label").parent().siblings("label");
            arr[arr.length] = temC.text();
            while (temC.prop("class") !== "mainLabel") {
                temC = temC.parent().siblings("label");
                arr[arr.length] = temC.text();
            }
            for (let i = arr.length - 2; i > -1; i--) {
                if (i === arr.length - 2) {
                    temS += arr[i];
                } else {
                    temS += "\\" + arr[i];
                }
            }
            if (checked) {
                fileState[temS] = true;
            } else {
                fileState[temS] = false;
            }
            temS = "";
        }
    });
}


/* 实现文件的智能选中 */
$('.floderBox').on("change", 'input[type="checkbox"]', function () {
    /* 实现子级跟随父级选中与否 */
    let checked = $(this).prop("checked"),
        container = $(this).parent();
    container.find('input[type="checkbox"]').prop({
        indeterminate: false,
        checked: checked
    });
    /* 更新文件状态 */
    updateFileState(container.find('input[type="checkbox"]'), checked);

    function checkSiblings(el) {
        var parent = el.parent(),
            all = true;
        /* 判断被点击CheckBox的同级的状态 */
        el.siblings("div").each(function () {
            return all = ($(this).children('input[type="checkbox"]').prop("checked") === checked) && all;
        });
        /* 只有当 all 为 true 时, 表示其余同级都为选中状态 */
        if (all && checked) {
            parent.children('input[type="checkbox"]').prop({
                indeterminate: false,
                checked: checked
            });
            /* 更新文件状态 */
            updateFileState(parent.children('input[type="checkbox"]'), checked);
            checkSiblings(parent);
        } else if (all && !checked) {
            parent.children('input[type="checkbox"]').prop("checked", checked);
            parent.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
            checkSiblings(parent);
        } else {
            el.parents("div").children('input[type="checkbox"]').prop({
                indeterminate: true,
                checked: false
            });
        }
    }
    checkSiblings(container);
    console.log(fileState);
});


/*
    初始化配置文件显示状态
    @addArr:        新增文件数组
    @ignore:        忽略文件数组
*/
function fileStateInit(addArr, ignore) {
    let container = $("#root").parent().find('input[type="checkbox"]');
    container.each(function () {
        let arr = [];
        let temS = ""
        if (!($(this).prop("id").includes("floder") || $(this).prop("id").includes("root"))) {
            let temC;
            arr[arr.length] = $("#" + $(this).prop("id") + "-label").text();
            temC = $("#" + $(this).prop("id") + "-label").parent().siblings("label");
            arr[arr.length] = temC.text();
            while (temC.prop("class") !== "mainLabel") {
                temC = temC.parent().siblings("label");
                arr[arr.length] = temC.text();
            }
            for (let i = arr.length - 2; i > -1; i--) {
                if (i === arr.length - 2) {
                    temS += arr[i];
                } else {
                    temS += "\\" + arr[i];
                }
            }
            $(this).click();
            if (addArr.includes(temS)) {
                $(this).parent().css("color", "var(--default-addFile-fontColor)");
            }
            console.log($(this), temS);
            if (ignore.includes(temS)) {
                $(this).click();
                $(this).parent().css("color", "var(--default-ignoreFile-fontColor)");
            }
        }
        temS = "";
    });
}


/* 判断文件是否存在重复 */
function fileIsRepeat(files) {
    let arr = [];
    for (let key in files) {
        if (files[key]) {
            let b = key.match(/\w+\.\w+$/);
            if (b) {
                if (arr.includes(b[0])) {
                    // 存在同名文件
                    return b[0];
                } else {
                    arr[arr.length] = b[0];
                }
            }
        }
    }
    return false;
}

/* 数据提交 */
$(".download").on("click", function () {
    console.log('[LOG - fileState]: ', fileState);

    let ret = fileIsRepeat(fileState);
    if (ret) {
        console.log('[LOG: ret]', ret);
        vscode.postMessage({
            command: "Alert",
            text: {
                "msg": "下载列表中文件: " + ret + "存在同名文件，请修改后重试！",
            }
        });
        return;
    }

    /* 特殊处理 */
    allFloder.forEach((e) => {
        fileState[e] = false;
        for (let key in fileState) {
            if (fileState[key] === true && key.indexOf(e) !== -1) {
                console.log("download", e, key);
                fileState[e] = true;
                return;
            }
        }
        console.log("ignore", e);
        return;
    });

    if (isOpenProject) {
        vscode.postMessage({
            command: "downloadConfigWithOpenProject",
            text: {
                fileState: fileState,
                isOpenProject: isOpenProject
            },
        });
    } else {
        vscode.postMessage({
            command: "downloadConfig",
            text: fileState,
        });
    }
});

/*侧边栏点击切换*/
$(".fileShow").on("click", function () {
    activeWindowsClicked("file");
    disPlayWhichWindow("file");
    // vscode.postMessage({
    //     command: "clickGetFiles"
    // });
});

$(".configShow").on("click", function () {
    activeWindowsClicked("config");
    disPlayWhichWindow("config");
});

/* 激活被点击选项的样式 */
function activeWindowsClicked(whichWindow) {
    if (whichWindow === "file") {
        $(".configShow, .fileShow").removeClass("active");
        $(".fileShow").addClass("active");
    } else {
        $(".configShow, .fileShow").removeClass("active");
        $(".configShow").addClass("active");
    }
}

/* 显示界面切换 */
function disPlayWhichWindow(whichWindow) {
    if (whichWindow === "file") {
        $(".fileSystemMain").show();
        $(".projectConfig").hide();
    } else {
        $(".projectConfig").show();
        $(".fileSystemMain").hide();
    }
}

/* 隐藏页面切换 */
function hideWindowChange() {
    $(".leftBar").hide();
}

//激活 VsCode 通信
const vscode = acquireVsCodeApi();

/* 改变主题样式 */
function changeThemeColor(style) {
    if (style === "light") {
        document.documentElement.style.setProperty("--default-bgColor", 'white');
    } else {
        document.documentElement.style.setProperty("--default-bgColor", 'rgb(37, 37, 38)');
    }
}

/**********************************工程配置***********************************/
const selecte = document.getElementById('moduleModel');
const portSelecte = document.getElementById('modulePort');
function cfgInitData(data) {
    document.getElementById('corePathInput').value = data['corePath'];
    document.getElementById('libPathInput').value = data['libPath'];
    // 初始化moduleModel下拉框数据
    selecte.options.length = 0;//清空原有数据
    for (let index = 0; index < data['moduleModelArray'].length; index++) {
        const element = data['moduleModelArray'][index];
        var option = document.createElement("option");
        option.text = element;
        selecte.append(option, null);
        if (data['moduleModel'] === element) {
            option.selected = true;
        }
    }
    // 初始化modulePort下拉框数据
    portSelecte.options.length = 0;
    for (let index = 0; index < data['modulePortArray'].length; index++) {
        const element = data['modulePortArray'][index];
        const reg = /\[(\w*)\]/ig;
        const comPortList = reg.exec(element);
        let comPort;
        if (comPortList === null) {
            comPort = "";
        }
        else {
            comPort = comPortList[1];
        }
        var option = document.createElement("option");
        option.text = element;
        portSelecte.append(option, null);
        if (data['modulePort'] === comPort) {
            option.selected = true;
        }
    }
}
function cfgCorePathHandle(data) {
    document.getElementById('corePathInput').value = data;
}
function cfgLibPathHandle(data) {
    document.getElementById('libPathInput').value = data;
}
function corePathSelect() {
    vscode.postMessage(
        {
            command: "coreConfigPath"
        }
    );
}
function libPathSelect() {
    vscode.postMessage(
        {
            command: "libConfigPath"
        }
    );
}
function moduleModelSelect() {
    const data = document.getElementById('moduleModel').value;
    vscode.postMessage(
        {
            command: "moduleModel",
            text: data
        }
    );
}
function modulePortSelect() {
    const data = document.getElementById('modulePort').value;
    vscode.postMessage(
        {
            command: "modulePort",
            text: data
        }
    );
}
function openConfigJson(data) {
    vscode.postMessage(
        {
            command: 'configJsonSelected',
            text: data
        }
    );
    return false;
}
/**********************************工程配置***********************************/


/* 获取vscode端发送的数据 */
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case "switchTheme":
            changeThemeColor(message.text);
            break;
        //自动获取工程文件目录
        case "filesChange":
            //隐藏侧边栏
            hideWindowChange();
        //手动点击获取工程文件目录
        case "filesChangeInManual":
            $(".fileShow").click();
            isOpenProject = message.text.isOpenProject;
            fileTreeInit(createDirTree(message.text.all));
            fileStateInit(message.text.new, message.text.ignore);
            //console.log("oooooooooooooo\n", message.text);
            break;
        //手动点击获取工程配置信息
        case 'initConfigData':
            $(".configShow").click();
            cfgInitData(message.text);
            console.log('[LOG - ooooo]: ', message.text);
            break;
        case 'coreConfigPath':
            cfgCorePathHandle(message.text);
            break;
        case 'libConfigPath':
            cfgLibPathHandle(message.text);
            break;
        case 'serialPortUpdate':
            this.updateSerialPort(message.text);
            break;
        default:
            break;
    }
});
