---@diagnostic disable: undefined-global, lowercase-global
--定义用于开发和调试的宏
local iCool_idleDebugSignal = false

local iCool_AppInitVar = nil
--主界面容器
SCREEN_MAIN = nil
--主界面
mainPageTableView = nil
--主界面的第一个页面
main_FirstPage = nil
--主界面的第二个页面
main_SecondPage = nil
--界面表
--此表储存的是主界面的界面，类似于手机的窗口
local pagesTable = {}
--状态栏:时间
mainPage_Bar_Clock = nil
--apps_Widgets
mainPage_appBtn_widgets = nil

local iCoolMainPageBarIsExist = false
--是否添加屏幕
local isAddScreen = false

--主界面状态栏初始化函数变量
local Idle_StatusBarInitVar = nil
--检测是否插卡
local iCool_SearchSimCardVar = nil
--检测电池
local iCoolCheckBatteryVar = nil
--同步时间
local iCool_SynTimevar = nil
--实时电量检测
local iCool_displayChargeBatteryVar = nil
----------------------------------------------------------------------------------------
local function table_leng(t)
    local leng=0
    for k, v in pairs(t) do
        leng=leng+1
    end
    return leng;
end

local function appHandle_Setting(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Setting")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Setting, "")
    end
end

local function appHandle_BlueTooth(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]BlueTooth")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_BlueTooth, "")
    end
end

local function appHandle_Audio(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Audio")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Audio, "")
    end
end

local function appHandle_QRcode(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]QRcode")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_QrCode, "")
    end
end

local function appHandle_Calendar(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Calendar")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Calendar, "")
    end
end

local function appHandle_Store(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Store")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Store, "")
    end
end

local function appHandle_Floder(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Floder")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Floder, "")
    end
end

local function appHandle_Calculator(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Calculator")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Calculator, "")
    end
end

local function appHandle_Weather(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Weather")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Weather, "")
    end
end

local function appHandle_Clock(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Clock")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Clock, "")
    end
end

local function appHandle_Widgets(btn, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[APP Start]Widgets")
        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_Widgets, "")
    end
end
--apps信息储存表  
--@string 第一个参数是app的显示名称  
--@number 第二个参数是app的显示长度(默认为62)  
--@number 第三个参数是app的显示宽度(默认为62)  
--@string 第四个参数是app的图标地址(格式为 "/lua/图标名称的bin文件" 也可以是png和jpg格式)  
--@number 第五个参数是app在界面上的位置(相对于TabView中页面的水平距离)  
--@number 第六个参数是app在界面上的位置(相对于TabView中页面的垂直距离)  
--@nil 第七个参数保存的是app的image对象  
--@nil 第八个参数保存的是app名称的Label对象  
--@nil 第九个参数保存的是app事件响应的button对象  
--@function 第十个参数是app事件响应的响应函数  
--@string 第十一个参数是提醒app处于哪个界面
-----------------------------------------------------
--提示：若要增加自定义参数，可添加在表的后续位置  
--app之间横坐标为:32/150/268/386        (相隔118)  
--app之间纵坐标为:110/228/346/464       (相隔118)  
local appsTable =
{
    {"控件", 62, 62, "/lua/Widgets.bin", 32, 110, nil, nil, nil, appHandle_Widgets, "page_1"},
    {"时钟", 62, 62, "/lua/Clock.bin", 150, 110, nil, nil, nil, appHandle_Clock, "page_1"},
    {"天气", 62, 62, "/lua/Weather.bin", 268, 110, nil, nil, nil, appHandle_Weather, "page_1"},
    {"计算器", 62, 62, "/lua/Calculator.bin", 386, 110, nil, nil, nil, appHandle_Calculator, "page_1"},
    {"文件", 62, 62, "/lua/Floder.bin", 32, 228, nil, nil, nil, appHandle_Floder, "page_1"},
    {"音频", 62, 62, "/lua/Audio.bin", 150, 228, nil, nil, nil, appHandle_Audio, "page_1"},
    {"日历", 62, 62, "/lua/Calendar.bin", 268, 228, nil, nil, nil, appHandle_Calendar, "page_1"},
    {"二维码", 62, 62, "/lua/QrCode.bin", 386, 228, nil, nil, nil, appHandle_QRcode, "page_1"},
    {"蓝牙", 62, 62, "/lua/BlueTooth.bin", 32, 346, nil, nil, nil, appHandle_BlueTooth, "page_1"},
    {"设置", 62, 62, "/lua/Setting.bin", 150, 346, nil, nil, nil, appHandle_Setting, "page_1"},
    {"商店", 62, 62, "/lua/Store.bin", 32, 110, nil, nil, nil, appHandle_Store, "page_2"},
}

--apps自动布局函数  
-------------------------------------------------------
--此函数通过读取sd卡中的数据来自动设置下一个app的位置以及要显示在那个界面,  
--如果没有sd或其中没有数据则通过默认的app来设置app的相应的属性  
--@无参数  
--@return       
--nextApp_X           下一个app的水平坐标X  
--nextApp_Y           下一个app的垂直坐标Y  
--scrIndex            下一个app在哪个界面  
--nil                 表示没有app配置表，则app信息不会保存  
function appsAutoLayout()
    --获取商城app文件中的app的数量
    local isExsit = io.exists("/iCool/config.json")
    --判断是否存在app配置文件
    if (isExsit)then
        --下个app的 X 和 Y 坐标
        local scrIndex = "page_1"
        local nextApp_X, nextApp_Y = 0, 0
        local prePox_X, prePox_Y = 0, 0
        --读取app配置文件中的数据
        local appData = io.readFile("/iCool/config.json")
        local a = json.decode(appData)
        if (#a == 0)then
            --文件中不存在app配置信息
            --则和默认app进行排序
            prePox_X = appsTable[#appsTable][5]
            prePox_Y = appsTable[#appsTable][6]
            scrIndex = appsTable[#appsTable][11]
        else
            prePox_X = a[#a][3]
            prePox_Y = a[#a][4]
            scrIndex = a[#a][5]
        end
        --设定一个屏幕最多可以显示16个app
        if (prePox_X == 386 and prePox_Y == 464)then
            nextApp_X = 32
            nextApp_Y = 110
            scrIndex = string.sub(scrIndex, 1, -2)..(string.sub(scrIndex, -1) + 1)
        elseif (prePox_X == 386 and prePox_Y ~= 464) then
            nextApp_X = 32
            nextApp_Y = prePox_Y + 118
        else
            nextApp_X = prePox_X + 118
            nextApp_Y = prePox_Y
        end
        return nextApp_X, nextApp_Y, scrIndex
    else
        --不存在app配置表则返回nil,信息不保存
        return nil, nil, nil
    end
end
--apps自动生成函数  
-----------------------------------------------
--@inputAppTable    要生成的app的信息存储表  
local function appsAutoProduce(inputAppTable)
    local curPage = nil
    local tableLen = #inputAppTable[1]
    --循环运行生成app
    for i = 1, #inputAppTable do
        --判断app显示在哪个界面
        local pageIndex = nil
        if (tableLen > 8)then
            --表示为默认手机app
            --获取默认app的显示界面
            pageIndex = tonumber(string.sub(inputAppTable[i][11], -1))
        else
            --获取商城app的显示界面
            --app信息表格式为{appName, appPngDir, appPox_X, appPox_Y, appScr, "storeApp", "appFlName"}
            pageIndex = tonumber(string.sub(inputAppTable[i][5], -1))
            local temTable = {inputAppTable[i][1], 62, 62, inputAppTable[i][2], inputAppTable[i][3], inputAppTable[i][4], 
                                nil, nil, nil, inputAppTable[i][6], inputAppTable[i][5], inputAppTable[i][7]}
            inputAppTable[i] = temTable
        end
        --判断 APP 文件是否完整
        if (io.exists(inputAppTable[i][4]))then
            --把当前界面替换
            curPage = pagesTable[pageIndex]
            --主界面app显示图标
            mainPage_app = lvgl.img_create(curPage, nil)
            inputAppTable[i][7] = mainPage_app
            lvgl.img_set_src(inputAppTable[i][7], inputAppTable[i][4])
            lvgl.obj_set_size(inputAppTable[i][7], inputAppTable[i][2], inputAppTable[i][3])
            lvgl.obj_align(inputAppTable[i][7], curPage, lvgl.ALIGN_IN_TOP_LEFT, inputAppTable[i][5], inputAppTable[i][6])
            lvgl.obj_add_style(inputAppTable[i][7], lvgl.IMG_PART_MAIN, absTransStyle)
            --主界面app的名称
            mainPage_appLabel = lvgl.label_create(curPage, nil)
            inputAppTable[i][8] = mainPage_appLabel
            lvgl.label_set_text(inputAppTable[i][8], inputAppTable[i][1])
            lvgl.obj_align(inputAppTable[i][8], inputAppTable[i][7], lvgl.ALIGN_OUT_BOTTOM_MID, 0, 8)
            lvgl.obj_add_style(inputAppTable[i][8], lvgl.LABEL_PART_MAIN, mainPage_IconFontStyle)
            --主界面app的响应事件按钮
            mainPage_appBtn = lvgl.btn_create(inputAppTable[i][7], nil)
            inputAppTable[i][9] = mainPage_appBtn
            lvgl.obj_set_size(inputAppTable[i][9], inputAppTable[i][2], inputAppTable[i][3])
            lvgl.obj_align(inputAppTable[i][9], curPage, lvgl.ALIGN_IN_TOP_LEFT, inputAppTable[i][5], inputAppTable[i][6])
            --判断是否是商城app
            if (inputAppTable[i][10] == "storeApp")then
                --商城app需要添加相应的回调函数
                print("商城app函数")
                local cb = function(obj, e)
                    if (e == lvgl.EVENT_CLICKED)then
                        print("你进入商城了")
                        print("APP_Floder's name is: ", inputAppTable[i][12])
                        local otem = string.sub(inputAppTable[i][4], 1, 6)
                        iCool_enterApp(iCool_interfaceIndexTable.interfaceIndex_ExterApp, {tostring(inputAppTable[i][12]), otem})
                    end
                end
                lvgl.obj_set_event_cb(inputAppTable[i][9], cb)
            else
                lvgl.obj_set_event_cb(inputAppTable[i][9], inputAppTable[i][10])
            end
            lvgl.obj_add_style(inputAppTable[i][9], lvgl.BTN_PART_MAIN, mainPage_IconStyle)
        end
    end
end

function iCool_IdleInit()
    --总界面容器
    SCREEN_MAIN = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(SCREEN_MAIN, 480, 804)
    lvgl.obj_align(SCREEN_MAIN, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(SCREEN_MAIN, lvgl.CONT_PART_MAIN, absTransStyle)

    --手机背景
    mainBackGround1 = lvgl.img_create(SCREEN_MAIN, nil)
    lvgl.img_set_src(mainBackGround1, "/lua/wallpaper021.jpg")
    lvgl.obj_set_size(mainBackGround1, 480, 268)
    lvgl.obj_align(mainBackGround1, SCREEN_MAIN, lvgl.ALIGN_IN_TOP_MID, 0, 0)

    mainBackGround2 = lvgl.img_create(SCREEN_MAIN, nil)
    lvgl.img_set_src(mainBackGround2, "/lua/wallpaper022.jpg")
    lvgl.obj_set_size(mainBackGround2, 480, 268)
    lvgl.obj_align(mainBackGround2, SCREEN_MAIN, lvgl.ALIGN_IN_TOP_MID, 0, 268)

    mainBackGround3 = lvgl.img_create(SCREEN_MAIN, nil)
    lvgl.img_set_src(mainBackGround3, "/lua/wallpaper023.jpg")
    lvgl.obj_set_size(mainBackGround3, 480, 268)
    lvgl.obj_align(mainBackGround3, SCREEN_MAIN, lvgl.ALIGN_IN_TOP_MID, 0, 536)

    --主界面首次生成状态栏(有且仅有一次生成)
    if (not iCoolMainPageBarIsExist)then
        Idle_StatusBarInitVar()
        iCoolMainPageBarIsExist = true
        log.info("iCool", "PageBar Init Success")
    end
    --加载主界面的内容
    iCool_AppInitVar()
end

---------------------------------------------
--优化滑屏
local iCoolPageTranslateVar = nil
---------------------------------------------

--加载app
local function iCool_AppInit()
    --主界面
    mainPageTableView = lvgl.tabview_create(SCREEN_MAIN, nil)
    lvgl.tabview_set_anim_time(mainPageTableView, 10)
    lvgl.obj_set_size(mainPageTableView, 480, 804)
    lvgl.obj_align(mainPageTableView, SCREEN_MAIN, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.obj_add_style(mainPageTableView, lvgl.TABVIEW_PART_BG, absTransStyle)
    lvgl.obj_add_style(mainPageTableView, lvgl.TABVIEW_PART_TAB_BG, absTransStyle)
    lvgl.obj_add_style(mainPageTableView, lvgl.TABVIEW_PART_INDIC, absTransStyle)
    
    --主界面添加俩个滑动屏幕
    main_FirstPage = lvgl.tabview_add_tab(mainPageTableView, "")
    main_SecondPage = lvgl.tabview_add_tab(mainPageTableView, "")

    --增加滑屏优化
    -----------------------------------------
    lvgl.obj_set_event_cb(main_FirstPage, iCoolPageTranslateVar)
    lvgl.obj_set_event_cb(main_SecondPage, iCoolPageTranslateVar)
    -----------------------------------------

    lvgl.obj_add_style(main_FirstPage, lvgl.PAGE_PART_SCROLLBAR, absTransStyle)
    lvgl.obj_add_style(main_SecondPage, lvgl.PAGE_PART_SCROLLBAR, absTransStyle)
    pagesTable[1] = main_FirstPage
    pagesTable[2] = main_SecondPage
    --自动生成默认app
    appsAutoProduce(appsTable)
    --获取商城app配置信息
    local storeAppTable = appTableDataInit("")
    --判断app配置文件是否存在
    --只有当输出为表时才进行如下操作
    if (type(storeAppTable) == "table")then
        --判断商城app配置信息是否有数据,没数据就是一个空表{}
        print("appTable is: ", storeAppTable)
        local appLen = table_leng(storeAppTable)
        print("app table len is: ", appLen)
        if (appLen > 0)then
            --获取总共的界面数量
            local lastPageIndex = tonumber(string.sub(storeAppTable[appLen][5], -1))
            --判断是否要添加界面
            while lastPageIndex > #pagesTable do
                mainAddPage = lvgl.tabview_add_tab(mainPageTableView, "")
                pagesTable[#pagesTable+1] = mainAddPage
                lvgl.obj_set_event_cb(pagesTable[#pagesTable], iCoolPageTranslateVar)
                lvgl.obj_add_style(pagesTable[#pagesTable], lvgl.PAGE_PART_SCROLLBAR, absTransStyle)
            end
            --自动生成商城app
            appsAutoProduce(storeAppTable)
            --清除生成的界面，防止再次生成界面时出现错误
            if (#pagesTable > 2)then
                for i = 3, #pagesTable do
                    pagesTable[i] = nil
                end
            end
        end
    end
end
--滑屏优化处理
-------------------------------------------
local function iCoolPageTranslate(obj, e)
    iCoolTouchScreenOptimization(e, 10, mainPageTableView)
end
iCoolPageTranslateVar = iCoolPageTranslate
--------------------------------------------

--主界面状态栏初始化
local function Idle_StatusBarInit()
    --主界面状态栏容器
    mainPage_StatusBarCont = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(mainPage_StatusBarCont, 480, 50)
    lvgl.obj_align(mainPage_StatusBarCont, nil, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.obj_add_style(mainPage_StatusBarCont, lvgl.CONT_PART_MAIN, absTransStyle)

    mainPage_StatusBarImg = lvgl.img_create(mainPage_StatusBarCont, nil)
    lvgl.img_set_src(mainPage_StatusBarImg, "/lua/StatusBar.jpg")
    lvgl.obj_set_size(mainPage_StatusBarImg, 480, 50)
    lvgl.obj_align(mainPage_StatusBarImg, mainPage_StatusBarCont, lvgl.ALIGN_IN_TOP_MID, 0, 0)

    --状态:时间
    mainPage_Bar_Clock = lvgl.label_create(mainPage_StatusBarCont, nil)
    lvgl.label_set_text(mainPage_Bar_Clock, "00:00")
    lvgl.obj_align(mainPage_Bar_Clock, mainPage_StatusBarImg, lvgl.ALIGN_IN_TOP_MID, 0, 8)
    lvgl.obj_add_style(mainPage_Bar_Clock, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
    --同步时间
    sys.timerLoopStart(iCool_SynTimevar, 1000)

    --状态:信号
    mainPage_Bar_Internet = lvgl.label_create(mainPage_StatusBarImg, nil)
    lvgl.label_set_text(mainPage_Bar_Internet, "")
    lvgl.obj_align(mainPage_Bar_Internet, mainPage_StatusBarImg, lvgl.ALIGN_IN_LEFT_MID, 10, -10)
    lvgl.obj_add_style(mainPage_Bar_Internet, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
    --查询sim卡
    iCool_SearchSimCardVar()

    --查询电量
    local iCoolBattery = iCoolCheckBatteryVar()
    --状态:电量
    statusBar_Battery = lvgl.bar_create(mainPage_StatusBarImg, nil)
    lvgl.obj_set_size(statusBar_Battery, 50, 18)
    lvgl.obj_align(statusBar_Battery, mainPage_StatusBarImg, lvgl.ALIGN_IN_RIGHT_MID, -5, -10)
    lvgl.bar_set_anim_time(statusBar_Battery, 2500)
    lvgl.bar_set_range(statusBar_Battery, 0, 100)
    lvgl.bar_set_value(statusBar_Battery, iCoolBattery, lvgl.ANIM_ON)
    lvgl.obj_add_style(statusBar_Battery, lvgl.BAR_PART_BG, statusBar_BatteryBgStyle)
    lvgl.obj_add_style(statusBar_Battery, lvgl.BAR_PART_INDIC, statusBar_BatteryIndicStyle)

    statusBatteryLabel = lvgl.label_create(mainPage_StatusBarImg, nil)
    lvgl.label_set_text(statusBatteryLabel, iCoolBattery.."%")
    lvgl.obj_align(statusBatteryLabel, statusBar_Battery, lvgl.ALIGN_OUT_LEFT_MID, -4, 0)
    lvgl.obj_add_style(statusBatteryLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)

    if (not _G.isInSimulator)then
        sys.timerLoopStart(iCool_displayChargeBatteryVar, 3000)
    end
end

--检测是否插卡
local function iCool_SearchSimCard()
    local iCoolSimExist = sim.getStatus()
    if (iCoolSimExist)then
        print("Sim卡已插入")
        local netModel = net.getNetMode()
        --无网络
        if (netModel == 0)then
            lvgl.label_set_text(mainPage_Bar_Internet, "No Signal")
        --2G GSM网络
        elseif (netModel == 1) then
            lvgl.label_set_text(mainPage_Bar_Internet, "2G")
        --2.5G EDGE数据网络
        elseif (netModel == 2) then
            lvgl.label_set_text(mainPage_Bar_Internet, "2.5G")
        --3G TD网络
        elseif (netModel == 3) then
            lvgl.label_set_text(mainPage_Bar_Internet, "3G")
        --4G LTE网络
        elseif (netModel == 4) then
            lvgl.label_set_text(mainPage_Bar_Internet, "4G")
        --3G WCDMA网络
        elseif (netModel == 5) then
            lvgl.label_set_text(mainPage_Bar_Internet, "3G")
        end
    else
        lvgl.label_set_text(mainPage_Bar_Internet, "No Sim卡")
        print("未检测到Sim")
    end
end
local a, b, c, d, e = 0, 0, 0, 0, 0
--检测是否充电
--电压范围是3.3V-4.1V
local function iCoolCheckBattery()
    a, b, c, d, e= pmd.param_get()
    if (iCool_idleDebugSignal)then
        log.info("电池电压", b, "是否存在电池", a)
    end
    if (_G.isInSimulator)then
        c = 100
    else
        --默认充电
        c = math.modf(((b-3200)/10))
    end

    if c < 1 then
        rtos.poweroff()
    elseif c > 100 then
        --电已充满
        c = 100
    end
    return c
end
--是否连接USB
local isOnUSB = false
--添加充电显示
local function iCool_displayChargeBattery()
    local iCoolBattery = iCoolCheckBatteryVar()
    if (iCoolBattery == 100)then
        lvgl.bar_set_value(statusBar_Battery, iCoolBattery, lvgl.ANIM_ON)
        lvgl.label_set_text(statusBatteryLabel, iCoolBattery.."%")
    else
        if (isOnUSB)then
            lvgl.bar_set_value(statusBar_Battery, 0, lvgl.ANIM_OFF)
            -------------------------------------------------------------
            --充电是从0-100显示
            lvgl.bar_set_value(statusBar_Battery, 100, lvgl.ANIM_ON)
            -------------------------------------------------------------
            --充电是从0-当前电量显示
            -- lvgl.bar_set_value(statusBar_Battery, iCoolBattery, lvgl.ANIM_ON)
            -------------------------------------------------------------
            lvgl.label_set_text(statusBatteryLabel, iCoolBattery.."%")
        else
            lvgl.bar_set_value(statusBar_Battery, iCoolBattery, lvgl.ANIM_ON)
            lvgl.label_set_text(statusBatteryLabel, iCoolBattery.."%")
        end
    end
end
--同步时间回调函数
local iCool_InSyncTime = true
local function iCool_SynTime()
	local iCool_getTime = misc.getClock()
    if(iCool_InSyncTime and (sim.getStatus()))then
        print("[SyncTime]", "Sync Time Success")
        ntp.timeSync()
        iCool_InSyncTime = false
    end
    lvgl.label_set_text(mainPage_Bar_Clock, string.format("%02d:%02d", iCool_getTime.hour, iCool_getTime.min))
end
--USB插拔检测
local function iCoolOnUSB(msg)
    if msg then
        if (msg.charger)then
            isOnUSB = true
            pins.setup(pio.P0_8, function() end, pio.PULLDOWN)
        else
            isOnUSB = false
            pins.setup(pio.P0_8, function() end, pio.PULLUP)
        end
        if msg.level==255 then return end
    end
end

rtos.on(rtos.MSG_PMD, iCoolOnUSB)
pmd.init({})
------------------------------------函数变量-----------------------------------------
iCool_SearchSimCardVar = iCool_SearchSimCard
iCool_AppInitVar = iCool_AppInit
Idle_StatusBarInitVar = Idle_StatusBarInit
iCoolCheckBatteryVar = iCoolCheckBattery
iCool_SynTimevar = iCool_SynTime
iCool_displayChargeBatteryVar = iCool_displayChargeBattery
----------------------------------------------------------------------------------
