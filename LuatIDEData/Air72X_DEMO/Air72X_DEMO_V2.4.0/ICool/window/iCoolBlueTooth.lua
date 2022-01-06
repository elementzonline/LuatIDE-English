---@diagnostic disable: lowercase-global, undefined-global

blueTooth_DisplayPage = nil
blueTooth_ScanBtn = nil

local function blueTooth_VariableInit()
    --扫描函数变量
    local blueTooth_ScanVar = nil
    --判断地址是否重复
    local blueTooth_JudgeWhetherDefeatVar = nil
    --自动生成蓝牙信息函数变量
    local blueTooth_DisplayBtInfoVar = nil
    --蓝牙初始化函数变量
    local blueTooth_ScanInitVar = nil
    --蓝牙地址是否重复(默认为重复)
    local blueTooth_RepeatBlueToothAddr = true
    --蓝牙的开启状态(默认关闭)
    blueTooth_InScan = false
    --蓝牙显示表
    _G.blueTooth_DisplayLabelTable = {}
    --蓝牙信息存储表
    blueTooth_BlueToothInfoTable = {}
    for i = 1, 100 do
        blueTooth_BlueToothInfoTable[i] = {}
        for j = 1, 2 do
            blueTooth_BlueToothInfoTable[i][j] = nil
        end
    end
    --当前蓝牙数量
    blueTooth_curInfoNumber = 1
end


function iCoolBlueToothInit()
    --蓝牙界面变量初始化
    blueTooth_VariableInit()
    --蓝牙基容器
    BLUETOOTH_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(BLUETOOTH_BASECONT, 480, 804)
    lvgl.obj_align(BLUETOOTH_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(BLUETOOTH_BASECONT, lvgl.CONT_PART_MAIN, blueTooth_PageStyle)

    blueTooth_DisplayPage = lvgl.page_create(BLUETOOTH_BASECONT, nil)
    lvgl.obj_set_size(blueTooth_DisplayPage, 480, 804)
    lvgl.page_set_scrollbar_mode(blueTooth_DisplayPage, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.obj_align(blueTooth_DisplayPage, BLUETOOTH_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.obj_add_style(blueTooth_DisplayPage, lvgl.PAGE_PART_BG, blueTooth_PageStyle)

    blueTooth_ScanBtn = lvgl.btn_create(blueTooth_DisplayPage, nil)
    lvgl.obj_set_size(blueTooth_ScanBtn, 200, 200)
    lvgl.obj_align(blueTooth_ScanBtn, blueTooth_DisplayPage, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_set_event_cb(blueTooth_ScanBtn, blueTooth_ScanVar)
    lvgl.obj_add_style(blueTooth_ScanBtn, lvgl.BTN_PART_MAIN, blueTooth_ScanBtnStyle)

    blueTooth_ScanBtnLabel = lvgl.label_create(blueTooth_ScanBtn, nil)
    lvgl.label_set_text(blueTooth_ScanBtnLabel, "扫       描")
    lvgl.obj_align(blueTooth_ScanBtnLabel, blueTooth_ScanBtn, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.obj_add_style(blueTooth_ScanBtnLabel, lvgl.LABEL_PART_MAIN, blueTooth_FontStyle)
end

--扫描按钮响应函数
local function blueTooth_Scan(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (blueTooth_InScan)then
            log.info("BlueTooth".."----Scan Closed")
            blueTooth_InScan = false
            lvgl.label_set_text(blueTooth_ScanBtnLabel, "扫       描")
            -- btcore.scan(0)
            -- for i = 1, blueTooth_curInfoNumber do
            --     log.info("名称："..blueTooth_BlueToothInfoTable[i][1].."\n地址："..blueTooth_BlueToothInfoTable[i][2])
            -- end
        else
            log.info("BlueTooth".."----Scan Starting")
            blueTooth_InScan = true
            lvgl.label_set_text(blueTooth_ScanBtnLabel, "扫   描   中")
            -- blueTooth_ScanInitVar()
        end
    end
end


local function init()
    log.info("bt", "init")
    rtos.on(rtos.MSG_BLUETOOTH, function(msg)
        if msg.event == btcore.MSG_OPEN_CNF then
            sys.publish("BT_OPEN", msg.result) --蓝牙打开成功
        elseif msg.event == btcore.MSG_BLE_CONNECT_CNF then
            sys.publish("BT_CONNECT_IND", {["handle"] = msg.handle, ["result"] = msg.result}) --蓝牙连接成功
        elseif msg.event == btcore.MSG_BLE_DISCONNECT_CNF then
            log.info("bt", "ble disconnect") --蓝牙断开连接
        elseif msg.event == btcore.MSG_BLE_DATA_IND then
            sys.publish("BT_DATA_IND", {["data"] = msg.data, ["uuid"] = msg.uuid, ["len"] = msg.len})  --接收到的数据内容
        elseif msg.event == btcore.MSG_BLE_SCAN_CNF then
            sys.publish("BT_SCAN_CNF", msg.result) --打开扫描成功
        elseif msg.event == btcore.MSG_BLE_SCAN_IND then
            sys.publish("BT_SCAN_IND", {["name"] = msg.name, ["addr_type"] = msg.addr_type, ["addr"] = msg.addr, ["manu_data"] = msg.manu_data, 
            ["raw_data"] = msg.raw_data, ["raw_len"] = msg.raw_len, ["rssi"] = msg.rssi})  --接收到扫描广播包数据
        end
    end)
end
local function poweron()
    log.info("bt", "poweron")
    btcore.open(1) --打开蓝牙主模式
    _, result = sys.waitUntil("BT_OPEN", 5000) --等待蓝牙打开成功
end
local function scan()
    log.info("bt", "scan")
    --btcore.setscanparam(1,48,6,0,0)--扫描参数设置（扫描类型,扫描间隔,扫描窗口,扫描过滤测量,本地地址类型）
    btcore.scan(1) --开启扫描
    _, result = sys.waitUntil("BT_SCAN_CNF", 50000) --等待扫描打开成功
    if result ~= 0 then
        return false
    end
    sys.timerStart(
        function()
            sys.publish("BT_SCAN_IND", nil)
        end,
        10000)  
    while true do
        _, bt_device = sys.waitUntil("BT_SCAN_IND") --等待扫描回复数据
        if not bt_device then
            -- 超时结束
            btcore.scan(0) --停止扫描
            return false
        else
            log.info("bt", "scan result")
            log.info("bt.scan_name", bt_device.name)  --蓝牙名称
			log.info("bt.rssi", bt_device.rssi)  --蓝牙信号强度
            log.info("bt.addr_type", bt_device.addr_type) --地址种类
            log.info("bt.scan_addr", bt_device.addr) --蓝牙地址
            blueTooth_JudgeWhetherDefeatVar()
        end
    end
    return true
end

local function blueTooth_ScanInit()
    sys.timerStart(function()
        init()
        poweron()
        scan()
    end, 1000)
end

--检测蓝牙是否重复
local function blueTooth_JudgeWhetherDefeat()
    if (1 == blueTooth_curInfoNumber)then
        if (bt_device.name == "")then
            bt_device.name = "N/A"
        end
        blueTooth_BlueToothInfoTable[blueTooth_curInfoNumber][1] = bt_device.name
        blueTooth_BlueToothInfoTable[blueTooth_curInfoNumber][2] = bt_device.addr
        blueTooth_DisplayBtInfoVar(
            blueTooth_curInfoNumber, bt_device.name, bt_device.addr
        )
        blueTooth_curInfoNumber = blueTooth_curInfoNumber + 1
    else
        for i = 1, (blueTooth_curInfoNumber-1) do
            if (bt_device.addr == blueTooth_BlueToothInfoTable[i][2])then
                return
            end
            blueTooth_RepeatBlueToothAddr = false
        end
        if (not blueTooth_RepeatBlueToothAddr)then
            if (bt_device.name == "")then
                bt_device.name = "N/A"
            end
            blueTooth_BlueToothInfoTable[blueTooth_curInfoNumber][1] = bt_device.name
            blueTooth_BlueToothInfoTable[blueTooth_curInfoNumber][2] = bt_device.addr
            blueTooth_DisplayBtInfoVar(
                blueTooth_curInfoNumber, bt_device.name, bt_device.addr
            )
            blueTooth_curInfoNumber = blueTooth_curInfoNumber + 1
            blueTooth_RepeatBlueToothAddr = true
        end
    end
end

local function blueTooth_DisplayBtInfo(curindex, btName, btAddr)
    blueTooth_InfoLabel = lvgl.label_create(blueTooth_DisplayPage, nil)
    blueTooth_DisplayLabelTable[curindex] = blueTooth_InfoLabel
    lvgl.label_set_text(blueTooth_DisplayLabelTable[curindex], btName.."           "..btAddr)
    lvgl.obj_align(blueTooth_DisplayLabelTable[curindex], blueTooth_DisplayPage, lvgl.ALIGN_IN_TOP_MID, 0, (100 + lvgl.obj_get_height(blueTooth_ScanBtn) + 50 * (curindex-1)))
    lvgl.obj_add_style(blueTooth_DisplayLabelTable[curindex], lvgl.LABEL_PART_MAIN, blueTooth_FontStyle)
end

blueTooth_ScanVar = blueTooth_Scan
blueTooth_ScanInitVar = blueTooth_ScanInit
blueTooth_JudgeWhetherDefeatVar = blueTooth_JudgeWhetherDefeat
blueTooth_DisplayBtInfoVar = blueTooth_DisplayBtInfo