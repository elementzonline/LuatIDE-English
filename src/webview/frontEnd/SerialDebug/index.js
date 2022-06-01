/* 基础设置 */
let sd_sortSelect = $(".sd-sort-select");
let sd_baudRate = $(".sd-baudRate");
let sd_dataBits = $(".sd-dataBits");
let sd_checkDigit = $(".sd-checkDigit");
let sd_stopBits = $(".sd-stopBits");
let sd_led = $(".sd-led");
let sd_openSort = $(".sd-openSort");
/* 接受区设置 */
let sd_aptClearData = $(".sd-apt-clearData");
let sd_aptStopRoll = $(".sd-apt-stopRoll");
/* 发送区设置 */
let sd_sendTimeSendSwitch = $(".sd-send-timeSendSwitch");
let sd_sendAutoNewline = $(".sd-send-autoNewline");
let sd_sendTimePeriod = $(".sd-send-timePeriod");
let sd_sendClearData = $(".sd-send-clearData");
let sd_sendDataBtn = $(".sd-send-sendDataBtn");
/* 显示区 */
let sd_disOutput = $(".sd-accept-input");
let sd_disInput = $(".sd-send-input");
/* 自定义弹窗 */
let sd_alertWin = $(".alertWindow");
let sd_alertCabcel = $(".sd-alertInput-cancel");
let sd_alertSubmit = $(".sd-alertInput-submit");
let sd_alertInput = $(".sd-alertInput");
let sd_alertLabel = $(".sd-alert-label");

/* 开关串口时的逻辑 */
function sd_openSortOpera(data) {
    vscode.postMessage({
        command: "openSerial",
        text: data.sortIsOpen,
    });
    vscode.postMessage({
        command: "serialNumber",
        text: $(".sd-sort-select option:selected").val(),
    });
    vscode.postMessage({
        command: "baudRate",
        text: $(".sd-baudRate option:selected").val(),
    });
    vscode.postMessage({
        command: "dataBits",
        text: $(".sd-dataBits option:selected").val(),
    });
    vscode.postMessage({
        command: "checkDigit",
        text: $(".sd-checkDigit option:selected").val(),
    });
    vscode.postMessage({
        command: "stopBits",
        text: $(".sd-stopBits option:selected").val(),
    });
}

/* 串口的开关 */
let sd_isOpen = false;
sd_openSort.on("click", function () {
    if (sd_isOpen) {
        sd_isOpen = false;
        $(this).text("打开串口");
        document.documentElement.style.setProperty(
            "--default-baseLed-bgColor",
            "rgb(212, 35, 35)"
        );
        sd_openSortOpera({
            sortIsOpen: false,
        });
    } else {
        sd_isOpen = true;
        $(this).text("关闭串口");
        document.documentElement.style.setProperty(
            "--default-baseLed-bgColor",
            "rgb(74, 218, 18)"
        );
        sd_openSortOpera({
            sortIsOpen: true,
        });
    }
});

/* 清空发送区 */
sd_sendClearData.on("click", function () {
    sd_disInput.val("");
});

/* 清空接受区 */
sd_aptClearData.on("click", function () {
    sd_disOutput.val("");
});

/* 接受区滚动显示切换 */
sd_aptStopRoll.on("click", function () {
    if ($(this).text() == "暂停滚动") {
        $(this).text("开始滚动");
        sd_disOutput.css("overflow-y", "hidden");
    } else {
        $(this).text("暂停滚动");
        sd_disOutput.css("overflow-y", "scroll");
    }
});

/* 发送串口数据 */
sd_sendDataBtn.on("click", function () {
    if (sd_isOpen) {
        let data = sd_disInput.val();
        if (data) {
            if (sd_sendAutoNewline.prop("checked")) {
                data = data + "\r\n";
            }
            vscode.postMessage({
                command: "sentData",
                text: data,
            });
        }
    }
});

/* 自动添加选项 */
function sd_autoAddOption(data, par) {
    for (let i = 0; i < data.length; i++) {
        let option = $("<option>");
        option.text(data[i]);
        option.attr("value", data[i]);
        par.append(option);
    }
}

/* 定时发送设置 */
sd_sendTimeSendSwitch.on("change", function () {
    let isChecked = $(this).prop("checked");
    vscode.postMessage({
        command: "timingTransmission",
        text: {
            state: isChecked,
            data: sd_disInput.val()
        },
    });
});

/* 实时检测变化 */
$(function () {
    /* 定时发送周期 */
    sd_sendTimePeriod.bind("input propertychange", function () {
        let period = $(this).val();
        vscode.postMessage({
            command: "timingPeriod",
            text: period,
        });
    });
});

let isInWhichCus = "baudRate"
/* 自定义基础属性 */
function sd_cusBaseValue(tag) {
    sd_alertWin.show();
    sd_alertInput.val("");
    switch (tag) {
        case "baudRate":
            isInWhichCus = "baudRate";
            sd_alertLabel.text("请输入自定义波特率");
            break;
        case "dataBits":
            isInWhichCus = "dataBits";
            sd_alertLabel.text("请输入自定义数据位");
            break;
        case "checkDigit":
            isInWhichCus = "checkDigit";
            sd_alertLabel.text("请输入自定义校验位");
            break;
        case "stopBits":
            isInWhichCus = "stopBits";
            sd_alertLabel.text("请输入自定义停止位");
            break;
        default:
            break;
    }
}

sd_alertCabcel.on("click", function () {
    sd_alertWin.hide();
});

sd_alertSubmit.on("click", function () {
    sd_alertWin.hide();
    switch (isInWhichCus) {
        case "baudRate":
            sd_baudRate.find("option[value='def']").text(sd_alertInput.val());
            break;
        case "dataBits":
            sd_dataBits.find("option[value='def']").text(sd_alertInput.val());
            break;
        case "checkDigit":
            sd_checkDigit.find("option[value='def']").text(sd_alertInput.val());
            break;
        case "stopBits":
            sd_stopBits.find("option[value='def']").text(sd_alertInput.val());
            break;
        default:
            break;
    }
});

/* 串口调试初始化第一步 */
function serialInit() {
    sd_sortSelect.empty();
    sd_baudRate.empty();
    sd_dataBits.empty();
    sd_checkDigit.empty();
    sd_stopBits.empty();
}

/* 串口调试初始化第二步 */
function serialInitAddHide(){
    let option2 = $("<option class='sd-baudRate-hide' style='display: none' value='def'>");
    let option3 = $("<option class='sd-dataBits-hide' style='display: none' value='def'>");
    let option4 = $("<option class='sd-checkDigit-hide' style='display: none' value='def'>");
    let option5 = $("<option class='sd-stopBits-hide' style='display: none' value='def'>");

    sd_baudRate.append(option2);
    sd_dataBits.append(option3);
    sd_checkDigit.append(option4);
    sd_stopBits.append(option5);
}

//激活 VsCode 通信
const vscode = acquireVsCodeApi();

/* 发送界面已准备完毕给vscode */
vscode.postMessage({
    command: "homePageReady",
});

/* 获取vscode端发送的数据 */
window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
        case "switchTheme":
            changeThemeColor(message.text);
            break;
        //获取初始化数据
        case "serialInitData":
            serialInit();
            sd_autoAddOption(message.text.serialNumberList, sd_sortSelect);
            sd_autoAddOption(message.text.baudRateList, sd_baudRate);
            sd_autoAddOption(message.text.dataBitsList, sd_dataBits);
            sd_autoAddOption(message.text.checkDigitList, sd_checkDigit);
            sd_autoAddOption(message.text.stopBits, sd_stopBits);
            serialInitAddHide();
            break;
        //串口异常的处理
        case "serialPortException":
            sd_isOpen = false;
            $(this).text("打开串口");
            document.documentElement.style.setProperty(
                "--default-baseLed-bgColor",
                "rgb(212, 35, 35)"
            );
            break;
        case "receiveData":
            let oldData = sd_disOutput.val();
            sd_disOutput.val(oldData  + message.text);
            break;
        default:
            break;
    }
});
