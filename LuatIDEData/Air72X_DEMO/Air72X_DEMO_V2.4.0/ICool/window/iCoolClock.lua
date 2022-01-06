---@diagnostic disable: undefined-global, lowercase-global

--Clock界面总容器
clockPage_Cont = nil
--Clock界面的总TabView
clock_TabView = nil
--闹钟界面
clock_AlarmPage = nil
--秒表界面
clock_StopWatchPage = nil
--闹钟界面：显示年月日Label
clock_DisplayYearLabel = nil
--闹钟界面：显示时分秒Label
clock_DisplayHourLabel = nil

--秒表界面：时间记录表
stopWatch_TimeRecordTable = {}
--秒表界面：秒表显示Label
stopWatch_DisplayLabel = nil
--秒表界面：秒表开始/暂停按钮Label
stopWatch_StatBtnLabel = nil
--秒表的点击判断变量
local stopWatch_IsPause = true
local stopWatch_CanRecord = false
--秒表的显示时间变量
local clock_VarTime = 0
local clock_TimeAddMinute = 0
local clock_TimeAddSecond = 0
local clock_TimeAddmSecond = 0
local clock_TimeAddmmSecond = 0
--秒表时间记录List
stopWatch_TimeRecordList = nil
--秒表时间记录的个数
local stopWatch_TimeRecordTimes = 0

clock_OPA0_Style = lvgl.style_t()
clockPage_FontStyle = lvgl.style_t()

--每秒获取时间
function _G.getTimeOneSec()
    local clock_GetTime = misc.getClock()
    lvgl.label_set_text(clock_DisplayHourLabel, string.format("%02d:%02d:%02d", clock_GetTime.hour, clock_GetTime.min, clock_GetTime.sec))
    lvgl.label_set_text(clock_DisplayYearLabel, string.format("%d年%d月%d日", clock_GetTime.year, clock_GetTime.month, clock_GetTime.day))
end

--秒表界面：秒表显示处理
function _G.clock_StopWatchDisplayHandle()
    clock_VarTime = clock_VarTime + 1
    if (clock_VarTime == 5)then
        clock_TimeAddmSecond = clock_TimeAddmSecond +1
        clock_VarTime = 0
    end
    if (clock_TimeAddmSecond == 10)then
        clock_TimeAddSecond = clock_TimeAddSecond + 1
        clock_TimeAddmSecond = 0
    end
    if (clock_TimeAddSecond == 60)then
        clock_TimeAddMinute = clock_TimeAddMinute + 1
        clock_TimeAddSecond = 0
    end

    clock_TimeAddmmSecond = clock_TimeAddmSecond + 3
    if (clock_TimeAddmmSecond > 9)then
        clock_TimeAddmmSecond = 5
    end
    lvgl.label_set_text(stopWatch_DisplayLabel, string.format("%02d:%02d:%01d%01d", clock_TimeAddMinute, clock_TimeAddSecond, clock_TimeAddmSecond, clock_TimeAddmmSecond))
end

--秒表界面：记录秒表时间
local function clock_RecordStopWatch(obj ,e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[Clock]clock_RecordStopWatch")
        if (stopWatch_CanRecord)then
            stopWatch_TimeRecordTimes = stopWatch_TimeRecordTimes + 1
            stopWatch_ListBtn = lvgl.list_add_btn(stopWatch_TimeRecordList, lvgl.SYMBOL_BELL, string.format("第%d次时间记录:                    %02d:%02d:%01d%01d", 
                                                    stopWatch_TimeRecordTimes, clock_TimeAddMinute, clock_TimeAddSecond, clock_TimeAddmSecond, clock_TimeAddmmSecond))
        end

    end
end

--秒表界面：复位秒表
local function clock_ResetStopWatch(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[Clock]clock_ResetStopWatch")
        sys.timerStop(_G.clock_StopWatchDisplayHandle, "Clock_StopWatch")
        clock_TimeAddMinute = 0
        clock_TimeAddSecond = 0
        clock_TimeAddmSecond = 0
        clock_TimeAddmmSecond = 0
        lvgl.label_set_text(stopWatch_DisplayLabel, string.format("%02d:%02d:%01d%01d", clock_TimeAddMinute, clock_TimeAddSecond, clock_TimeAddmSecond, clock_TimeAddmmSecond))
        lvgl.label_set_text(stopWatch_StatBtnLabel, "开始")
        stopWatch_IsPause = true
        stopWatch_CanRecord = false

        --清除时间记录
        stopWatch_TimeRecordTimes = 0
        lvgl.list_clean(stopWatch_TimeRecordList)
    end
end

--秒表界面：开始/暂停秒表
function clock_StartStopWatch(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[Clock]clock_StartStopWatch")
        if (stopWatch_IsPause)then
            sys.timerLoopStart(_G.clock_StopWatchDisplayHandle, 20, "Clock_StopWatch")
            stopWatch_IsPause = false
            stopWatch_CanRecord = true
            lvgl.label_set_text(stopWatch_StatBtnLabel, "暂停")
        else
            sys.timerStop(_G.clock_StopWatchDisplayHandle, "Clock_StopWatch")
            stopWatch_IsPause = true
            stopWatch_CanRecord = false
            lvgl.label_set_text(stopWatch_StatBtnLabel, "开始")
        end
    end
end

function iCoolTimeInit()
    stopWatch_IsPause = true
    stopWatch_CanRecord = false
    --Clock界面透明样式
    lvgl.style_init(clock_OPA0_Style)
    lvgl.style_set_bg_opa(clock_OPA0_Style, lvgl.STATE_DEFAULT, lvgl.OPA_0)
    lvgl.style_set_border_opa(clock_OPA0_Style, lvgl.STATE_DEFAULT, lvgl.OPA_0)

    --Clock界面字体样式
    lvgl.style_init(clockPage_FontStyle)
	lvgl.style_set_text_color(clockPage_FontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

    --Clock界面总容器
    clockPage_Cont = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(clockPage_Cont, 480, 804)
	lvgl.obj_align(clockPage_Cont, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)

    clock_TabView = lvgl.tabview_create(clockPage_Cont, nil)
	lvgl.obj_set_size(clock_TabView, 480, 804)
	lvgl.obj_align(clock_TabView, clockPage_Cont, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.tabview_set_anim_time(clock_TabView, 100)

    --Clock界面的4个分界面
    clock_AlarmPage = lvgl.tabview_add_tab(clock_TabView, "时钟")
    lvgl.page_set_scrollbar_mode(clock_AlarmPage, lvgl.SCROLLBAR_MODE_OFF)
    clock_StopWatchPage = lvgl.tabview_add_tab(clock_TabView, "秒表")
    lvgl.page_set_scrollbar_mode(clock_StopWatchPage, lvgl.SCROLLBAR_MODE_OFF)

    --时钟界面
    clock_DisplayHourLabel = lvgl.label_create(clock_AlarmPage, nil)
    lvgl.label_set_text(clock_DisplayHourLabel, "00:00:00")
    lvgl.obj_align(clock_DisplayHourLabel, clock_AlarmPage, lvgl.ALIGN_CENTER, 0, -200)

    clock_DisplayYearLabel = lvgl.label_create(clock_AlarmPage, nil)
    lvgl.label_set_text(clock_DisplayYearLabel, "0000年0月0日")
    lvgl.obj_align(clock_DisplayYearLabel, clock_AlarmPage, lvgl.ALIGN_CENTER, 0, 50)
    sys.timerLoopStart(_G.getTimeOneSec, 1000, "getTime")

    --秒表界面
    stopWatch_DisplayLabel = lvgl.label_create(clock_StopWatchPage, nil)
    lvgl.obj_align(stopWatch_DisplayLabel, clock_StopWatchPage, lvgl.ALIGN_CENTER, -20, -200)
    lvgl.label_set_text(stopWatch_DisplayLabel, string.format("%02d:%02d:%01d%01d", clock_TimeAddMinute, clock_TimeAddSecond, clock_TimeAddmSecond, clock_TimeAddmmSecond))

    stopWatch_Cont = lvgl.cont_create(clock_StopWatchPage, nil)
    lvgl.obj_set_size(stopWatch_Cont, 400, 120)
    lvgl.obj_align(stopWatch_Cont, clock_StopWatchPage, lvgl.ALIGN_IN_BOTTOM_MID, 0, 0)
    lvgl.obj_add_style(stopWatch_Cont, lvgl.CONT_PART_MAIN, clock_OPA0_Style)

    --开始秒表
    stopWatch_StartBtn = lvgl.btn_create(stopWatch_Cont, nil)
    lvgl.obj_set_size(stopWatch_StartBtn, 90, 90)
    lvgl.obj_align(stopWatch_StartBtn, stopWatch_Cont, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.obj_set_event_cb(stopWatch_StartBtn, clock_StartStopWatch)
    stopWatch_StatBtnLabel = lvgl.label_create(stopWatch_StartBtn, nil)
    lvgl.label_set_text(stopWatch_StatBtnLabel, "开始")
    lvgl.obj_align(stopWatch_StatBtnLabel, stopWatch_StartBtn, lvgl.ALIGN_CENTER, 0, 0)

    --复位秒表
    stopWatch_ResetBtn = lvgl.btn_create(stopWatch_Cont, nil)
    lvgl.obj_set_size(stopWatch_ResetBtn, 60, 60)
    lvgl.obj_align(stopWatch_ResetBtn, stopWatch_Cont, lvgl.ALIGN_IN_LEFT_MID, 30, 5)
    lvgl.obj_add_style(stopWatch_ResetBtn, lvgl.BTN_PART_MAIN, clock_OPA0_Style)
    lvgl.obj_set_event_cb(stopWatch_ResetBtn, clock_ResetStopWatch)
    stopWatch_BtnLabel2 = lvgl.label_create(stopWatch_Cont, nil)
    lvgl.label_set_text(stopWatch_BtnLabel2, "复位")
    lvgl.obj_align(stopWatch_BtnLabel2, stopWatch_ResetBtn, lvgl.ALIGN_CENTER, 0, 0)

    --记录秒表
    stopWatch_RecordBtn = lvgl.btn_create(stopWatch_Cont, stopWatch_ResetBtn)
    lvgl.obj_align(stopWatch_RecordBtn, stopWatch_Cont, lvgl.ALIGN_IN_RIGHT_MID, -30, 5)
    lvgl.obj_set_event_cb(stopWatch_RecordBtn, clock_RecordStopWatch)
    stopWatch_BtnLabel3 = lvgl.label_create(stopWatch_Cont, nil)
    lvgl.label_set_text(stopWatch_BtnLabel3, "记录")
    lvgl.obj_align(stopWatch_BtnLabel3, stopWatch_RecordBtn, lvgl.ALIGN_CENTER, 0, 0)

    --秒表界面：时间记录List
    stopWatch_TimeRecordList = lvgl.list_create(clock_StopWatchPage, nil)
    lvgl.obj_set_size(stopWatch_TimeRecordList, 400, 200)
    lvgl.obj_align(stopWatch_TimeRecordList, clock_StopWatchPage, lvgl.ALIGN_CENTER, 0, 50)
    lvgl.obj_add_style(stopWatch_TimeRecordList, lvgl.LIST_PART_BG, clock_OPA0_Style)
end

