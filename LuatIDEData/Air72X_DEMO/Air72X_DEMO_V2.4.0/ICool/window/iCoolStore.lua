---@diagnostic disable: lowercase-global, undefined-global

--Define a macro for development and debugging
local iCool_storeDebugSignal = true

_G.inAppDling = -1
--判断app下载定时器ID
local appInDlingTimer = nil
local appIndex = 0
---------------------------函数变量----------------------------
--app自动生成函数变量
local iCool_storeAppAutoInitVar = nil
--app下载初始化函数变量
local store_appDlBeginVar = nil
--获取app状态函数变量
local getAppStateVar = nil
--app状态检查函数变量
local checkAppStateVar = nil
--删除app数据函数变量
local unInsAppVar = nil
--判断app函数变量
local judegAppVar = nil
--判断是否处于app下载中
local checkInDlingVar = nil
--------------------------------------------------------------
--当前商店里的app数量
local iCool_storeCurAppNumber
-------------------1. app的创建控件表----------------------
--商店app容器Cont表
local iCool_storeAppTable = {}
--商店app图标Image表
local iCool_storeAppImgTable = {}
--商店app名称Label表
local iCool_storeAppNameTable = {}
--商店app介绍Label表
local iCool_storeAppIntTable = {}
--商店app内存Label表
local iCool_storeAppRamTable = {}
--商店app下载Btn表
local iCool_storeAppDlTable = {}
--商店app状态显示Label表
local iCool_storeAppStateDisTable = {}
--------------------------------------------------------
--------------------2. app的具体内容表----------------------
--包含app的下载链接、app的状态、app的进入函数
--------------------------------------------------------
--商城app状态记录表
--记录app的状态:
--1. 未下载 2. 已下载 3. 需要更新
local iCool_storeAppStateTable = {}

--------------------------------------------
local iCool_storeAppinfoTable = {}
--商店app的信息存储表  
------------------------------
--@参数1        对应的app图标地址  
--@参数2        对应的app名称  
--@参数3        对应的app介绍信息  
--@参数4        对应的app下载所需流量  
--@参数5        对应的app进入函数  
--@参数6        对应的app的安装状态  
iCool_storeAppinfoTable = 
{
    {"/lua/Widgets.bin", "PacMan", "Pac-Man在1980年代风靡全球，被认为是最经典的街机游戏之一", "1.2 MB", nil, nil},--支持单人、多人参与。通过手机网络发送语音、图片、视频和文字
    -- {"/lua/Clock.bin", "QQ", "是一款基于互联网的即时通信软件", "135 MB", nil, nil},
    -- {"/lua/Audio.bin", "王者荣耀", "《王者荣耀》是腾讯天美工作室", "195.6 MB", nil, nil},--推出的英雄竞技手游，不是一个人的王者，而是团队的荣耀
    -- {"/lua/Floder.bin", "飞书", "字节跳动旗下企业协作与管理平台", "195.6 MB", nil, nil},--，不仅一站式整合及时沟通、智能日历、音视频会议、飞书文档、云盘等办公协作套件
    -- {"/lua/Widgets.bin", "Tim", "QQ办公简洁版", "111.5 MB", nil, nil},--，是一款专注于团队办公协作的跨平台沟通工具
    -- {"/lua/Clock.bin", "腾讯会议", "基于腾讯20多年音视频通讯经验", "150.8 MB", nil, nil},--，腾讯会议提供一站式音视频会议解决方案，让您能随时随地体验高清流畅的会议以及会议协作
    -- {"/lua/Audio.bin", "钉钉", "钉钉是中国领先的智能移动办公平台", "136.6 MB", nil, nil},--，由阿里巴巴集团开发，免费提供给所有中国企业，用于商务沟通和工作协同
    -- {"/lua/Floder.bin", "Google", "Search the world's information", "80.6 MB", nil, nil},--, including webpages, images, videos and more
}
---------------------------------------------
--app添加函数
-----------------------------
--@appInfoTable         app信息配置表
function iCool_appInfoConf(appInfoTable)
    local appLen = #iCool_storeAppinfoTable + 1
    iCool_storeAppinfoTable[appLen] = {}
    iCool_storeAppinfoTable[appLen][1] = appInfoTable[1]--app图标
    iCool_storeAppinfoTable[appLen][2] = appInfoTable[2]--app名称
    iCool_storeAppinfoTable[appLen][3] = appInfoTable[3]--app介绍
    iCool_storeAppinfoTable[appLen][4] = appInfoTable[4]--app下载流量
    iCool_storeAppinfoTable[appLen][5] = appInfoTable[5]--app进入函数
end

--商店初始化
function iCool_storeInit()
    --商店界面基容器
    STORE_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(STORE_BASECONT, 480, 804)
    lvgl.obj_align(STORE_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(STORE_BASECONT, lvgl.CONT_PART_MAIN, store_scrollPageStyle)
    
    store_mainPage = lvgl.page_create(STORE_BASECONT, nil)
    lvgl.obj_set_size(store_mainPage, lvgl.obj_get_width(STORE_BASECONT), lvgl.obj_get_height(STORE_BASECONT))
    lvgl.obj_align(store_mainPage, STORE_BASECONT, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.page_set_scrollbar_mode(store_mainPage, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.page_set_anim_time(store_mainPage, 50)
    lvgl.obj_add_style(store_mainPage, lvgl.PAGE_PART_BG, store_scrollPageStyle)

    --提取出app的名称组成一个表
    local appNameTable = {}
    for i = 1, #iCool_storeAppinfoTable do
        appNameTable[i] = iCool_storeAppinfoTable[i][2]
    end
    --检查app的安装状态
    checkAppStateVar(appNameTable)

    --初始化app数量
    iCool_storeCurAppNumber = 0
    for i = 1, #iCool_storeAppinfoTable do
        iCool_storeAppAutoInitVar(iCool_storeAppinfoTable[i][1], iCool_storeAppinfoTable[i][2], iCool_storeAppinfoTable[i][3], iCool_storeAppinfoTable[i][4])
    end
end

--商店页面app自动生成函数  
--@appicon              app的图标路径  
--@appName              app的名称  
--@appInt               app的介绍  
--@appRam               app下载所需的流量  
--@appDlBegin           app下载函数  
local function iCool_storeAppAutoInit(appicon, appName, appInt, appRam)
    iCool_storeCurAppNumber = iCool_storeCurAppNumber + 1
    --App展示容器
    store_appCont = lvgl.cont_create(store_mainPage, nil)
    iCool_storeAppTable[iCool_storeCurAppNumber] = store_appCont
    lvgl.obj_set_size(iCool_storeAppTable[iCool_storeCurAppNumber], 460, 100)
    --判断商城app列表是否没有展示任何app
    --若没有则第一个展示app和展示框对齐
    if (iCool_storeCurAppNumber < 2)then
        lvgl.obj_align(iCool_storeAppTable[iCool_storeCurAppNumber], store_mainPage, lvgl.ALIGN_IN_TOP_MID, 0, 8)
    else
        --若存在则和上一个展示的app对齐
        local cur = iCool_storeCurAppNumber - 1
        lvgl.obj_align(iCool_storeAppTable[iCool_storeCurAppNumber], iCool_storeAppTable[cur], lvgl.ALIGN_OUT_BOTTOM_MID, 0, 8)
    end
    lvgl.obj_set_state(iCool_storeAppTable[iCool_storeCurAppNumber], lvgl.STATE_DISABLED)
    lvgl.obj_add_style(iCool_storeAppTable[iCool_storeCurAppNumber], lvgl.CONT_PART_MAIN, store_appContStyle)
    --app图标
    store_appimg = lvgl.img_create(iCool_storeAppTable[iCool_storeCurAppNumber], nil)
    iCool_storeAppImgTable[iCool_storeCurAppNumber] = store_appimg
    lvgl.img_set_src(iCool_storeAppImgTable[iCool_storeCurAppNumber], appicon)
    lvgl.obj_align(iCool_storeAppImgTable[iCool_storeCurAppNumber], iCool_storeAppTable[iCool_storeCurAppNumber], lvgl.ALIGN_IN_LEFT_MID, 25, 0)
    --app名称
    store_appName = lvgl.label_create(iCool_storeAppTable[iCool_storeCurAppNumber], nil)
    iCool_storeAppNameTable[iCool_storeCurAppNumber] = store_appName
    lvgl.label_set_text(iCool_storeAppNameTable[iCool_storeCurAppNumber], appName)
    lvgl.obj_align(iCool_storeAppNameTable[iCool_storeCurAppNumber], iCool_storeAppImgTable[iCool_storeCurAppNumber], lvgl.ALIGN_OUT_RIGHT_MID, 30, -20)
    --app介绍
    store_appInt = lvgl.label_create(iCool_storeAppTable[iCool_storeCurAppNumber], nil)
    iCool_storeAppIntTable[iCool_storeCurAppNumber] = store_appInt
    lvgl.label_set_text(iCool_storeAppIntTable[iCool_storeCurAppNumber], appInt)
    lvgl.label_set_long_mode(iCool_storeAppIntTable[iCool_storeCurAppNumber], lvgl.LABEL_LONG_SROLL_CIRC)
    lvgl.obj_set_width(iCool_storeAppIntTable[iCool_storeCurAppNumber], 200)
    lvgl.obj_align(iCool_storeAppIntTable[iCool_storeCurAppNumber], iCool_storeAppImgTable[iCool_storeCurAppNumber], lvgl.ALIGN_OUT_RIGHT_MID, 30, 25)
    --app下载按钮
    store_appDl = lvgl.btn_create(iCool_storeAppTable[iCool_storeCurAppNumber], nil)
    iCool_storeAppDlTable[iCool_storeCurAppNumber] = store_appDl
    lvgl.obj_set_size(iCool_storeAppDlTable[iCool_storeCurAppNumber], 70, 40)
    lvgl.obj_align(iCool_storeAppDlTable[iCool_storeCurAppNumber], iCool_storeAppTable[iCool_storeCurAppNumber], lvgl.ALIGN_IN_RIGHT_MID, -30, -10)
    lvgl.obj_add_style(iCool_storeAppDlTable[iCool_storeCurAppNumber], lvgl.BTN_PART_MAIN, store_appDlStyle)
    --为不同的app添加不同的下载函数
    local downLoadCb = function(obj, e)
        if (e == lvgl.EVENT_CLICKED)then
            --获取被点击的app的index值
            appIndex = judegAppVar(obj)
            --防止重复点击下载按钮
            local isSignalExsit = false
            if (iCool_storeDebugSignal)then
                print("appIndex", appIndex)
                print("iCool_storeAppinfoTable[appIndex][6]", iCool_storeAppinfoTable[appIndex][6])
            end
            --判断SD卡是否初始化成功
            if (_G.fsInitSuccessed)then
                --判断app是否已安装
                if (not iCool_storeAppinfoTable[appIndex][6])then
                    --判断是否网络
                    if (net.getNetMode() > 0)then
                        --下载app所需的文件数据(其中传入的参数是你要定义的app的英文名称)
                        local name = iCool_storeAppinfoTable[appIndex][2]
                        if (type(name) == "string")then
                            --开启下载进度条
                            appInDlingTimer = sys.timerLoopStart(checkInDlingVar, 10)
                            local o = misc.getClock()
                            --获取下载app时的时间，以此当作临时的压缩包文件名
                            local appFlName = o.year..o.month..o.day..o.hour..o.min..o.sec
                            appDataRecieve(appFlName)
                        end
                    else
                        --只有当提示消失后才可以再次出现提示
                        if (not isSignalExsit)then
                            isSignalExsit = true
                            local noNetCont = lvgl.cont_create(lvgl.scr_act(), nil)
                            lvgl.obj_set_size(noNetCont, 400, 80)
                            lvgl.obj_align(noNetCont, nil, lvgl.ALIGN_IN_TOP_MID, 0, 10)
                            lvgl.obj_add_style(noNetCont, lvgl.CONT_PART_MAIN, store_nCSigContStyle)
                            lvgl.obj_set_state(noNetCont, lvgl.STATE_DISABLED)
                            local noNetSignal = lvgl.label_create(noNetCont, nil)
                            lvgl.label_set_text(noNetSignal, "请确认网络已连接")
                            lvgl.obj_align(noNetSignal, noNetCont, lvgl.ALIGN_CENTER, 0, 0)
                            lvgl.obj_add_style(noNetSignal, lvgl.LABEL_PART_MAIN, store_nCSigFontStyle)
                            lvgl.obj_set_state(noNetSignal, lvgl.STATE_DISABLED)
                            sys.timerStart(function()
                                isSignalExsit = false
                                lvgl.obj_del(noNetCont)
                            end, 1000)
                        end
                    end
                else
                    --卸载app并删除app数据
                    local ret = unInsAppVar(iCool_storeAppinfoTable[appIndex][2])
                    --判断是否app删除成功
                    if (ret)then
                        lvgl.label_set_text(iCool_storeAppStateDisTable[appIndex], "安装")
                        iCool_storeAppinfoTable[appIndex][6] = false
                    end
                end
            else
                --只有当提示消失后才可以再次出现提示
                if (not isSignalExsit)then
                    isSignalExsit = true
                    local noNetCont1 = lvgl.cont_create(lvgl.scr_act(), nil)
                    lvgl.obj_set_size(noNetCont1, 400, 80)
                    lvgl.obj_align(noNetCont1, nil, lvgl.ALIGN_IN_TOP_MID, 0, 10)
                    lvgl.obj_add_style(noNetCont1, lvgl.CONT_PART_MAIN, store_nCSigContStyle)
                    lvgl.obj_set_state(noNetCont1, lvgl.STATE_DISABLED)
                    local noNetSignal1 = lvgl.label_create(noNetCont1, nil)
                    lvgl.label_set_text(noNetSignal1, "请确认系统已初始化成功")
                    lvgl.obj_align(noNetSignal1, noNetCont1, lvgl.ALIGN_CENTER, 0, 0)
                    lvgl.obj_add_style(noNetSignal1, lvgl.LABEL_PART_MAIN, store_nCSigFontStyle)
                    lvgl.obj_set_state(noNetSignal1, lvgl.STATE_DISABLED)
                    sys.timerStart(function()
                        isSignalExsit = false
                        lvgl.obj_del(noNetCont1)
                    end, 1000)
                end
            end
        end
    end
    lvgl.obj_set_event_cb(iCool_storeAppDlTable[iCool_storeCurAppNumber], downLoadCb)
    --app下载按钮文字
    store_appDlLabel = lvgl.label_create(iCool_storeAppDlTable[iCool_storeCurAppNumber], nil)
    iCool_storeAppStateDisTable[iCool_storeCurAppNumber] = store_appDlLabel
    --判断app是否已安装
    if (iCool_storeAppinfoTable[iCool_storeCurAppNumber][6])then
        lvgl.label_set_text(iCool_storeAppStateDisTable[iCool_storeCurAppNumber], "卸载")
    else
        lvgl.label_set_text(iCool_storeAppStateDisTable[iCool_storeCurAppNumber], "安装")
    end
    lvgl.obj_align(iCool_storeAppStateDisTable[iCool_storeCurAppNumber], iCool_storeAppDlTable[iCool_storeCurAppNumber], lvgl.ALIGN_CENTER, 0, 0)
    --app所占内存大小
    store_appRam = lvgl.label_create(iCool_storeAppTable[iCool_storeCurAppNumber], nil)
    iCool_storeAppRamTable[iCool_storeCurAppNumber] = store_appRam
    lvgl.label_set_text(iCool_storeAppRamTable[iCool_storeCurAppNumber], appRam)
    lvgl.obj_align(iCool_storeAppRamTable[iCool_storeCurAppNumber], iCool_storeAppDlTable[iCool_storeCurAppNumber], lvgl.ALIGN_OUT_BOTTOM_MID, 0, 20)
end

------------------------------------------------
--记录app的状态值
--通过扫描app配置表来获取已存在app
--1. 未下载 2. 已下载 3. 需要更新
--@return   
-- table:               app配置表有数据,返回已有app的表  
-- 0:                   app配置表没数据  
-- -1:                  app配置表不存在  
------------------------------------------------
local function getAppState()
    local isExsit = io.exists("/iCool/config.json")
    --判断app配置文件是否存在
    if (isExsit)then
        local read = io.readFile("/iCool/config.json")
        local data = json.decode(read)
        --判断app配置文件是否有数据
        if (#data > 0)then
            for i = 1, #data do
                --把存在的app存储到app状态表中
                iCool_storeAppStateTable[i] = data[i][1]
            end
            print("已获取安装app")
            return iCool_storeAppStateTable
        end
        return 0
    end
    return -1
end

------------------------------------------------
--检查app的安装状态
--通过已存在app和商店app进行比较，得知app是否已下载
--@cttState         app对照状态表，要检查的app的名称表
------------------------------------------------
local function checkAppState(cttState)
    --获取已下载app
    local stateTbl = getAppState()
    if (type(stateTbl) == "table")then
        for i = 1, #stateTbl do
            for j = 1, #cttState do
                --判断app是否已存在
                if (stateTbl[i] == cttState[j])then
                    --把app的安装状态置为true
                    iCool_storeAppinfoTable[j][6] = true
                    break
                end
            end
        end
    end
end
--------------------------------------------------
--删除app数据
--通过输入的app名称来进行app数据的删除
--@return       
--0:                表示删除成功  
--nil:              表示删除失败  
--------------------------------------------------
local function unInsApp(appName)
    local isExsit = io.exists("/iCool/config.json")
    --判断app配置文件是否存在
    if (isExsit)then
        local read = io.readFile("/iCool/config.json")
        local data = json.decode(read)
        --判断app配置文件是否有数据
        if (#data > 0)then
            for i = 1, #data do
                if (data[i][1] == appName)then
                    table.remove(data, i)
                    break
                end
            end
            --把信息转为json格式
            local jsonData = json.encode(data)
            --打开app信息文件写入删除指定app数据后的数据
            local appfd = io.open("/iCool/config.json", "w")
            appfd:write(jsonData)
            appfd:close()
            return 1
        end
    else
        return nil
    end
end
----------------------------------------------------
--判断是哪个app被点击  
--@obj              被点击的app的Btn对象  
--@return  
--appIndex          返回app在app信息记录表中所对应的index值  
----------------------------------------------------
local function judegApp(obj)
    for i = 1, #iCool_storeAppDlTable do
        if (lvgl.obj_get_id(iCool_storeAppDlTable[i]) == lvgl.obj_get_id(obj))then
            return i
        end
    end
end
------------------------------------------------------
--判断是否处于下载中
--_G.inAppDling
-- -1:                  还未下载
-- 0:                   下载中
-- 1:                   下载已完成
------------------------------------------------------
local bar = nil
local function checkInDling()
    if (_G.inAppDling  == -1) then
        _G.inAppDling = 0
        bar = lvgl.bar_create(iCool_storeAppTable[appIndex], nil)
        lvgl.obj_set_size(bar, 70, 5)
        lvgl.obj_align(bar, iCool_storeAppDlTable[appIndex], lvgl.ALIGN_OUT_BOTTOM_MID, 0, 10)
        lvgl.bar_set_anim_time(bar, 4000)
        lvgl.bar_set_range(bar, 0, 10)
        lvgl.bar_set_value(bar, 10, lvgl.ANIM_ON)
        lvgl.obj_set_state(bar, lvgl.STATE_DISABLED)
    elseif (_G.inAppDling  == 1) then
        sys.timerStop(appInDlingTimer)
        _G.inAppDling = -1
        appInDlingTimer = nil
        lvgl.bar_set_value(bar, 10, lvgl.ANIM_OFF)
        sys.timerStart(function()
            lvgl.obj_del(bar)
            bar = nil
        end, 500)
        lvgl.label_set_text(iCool_storeAppStateDisTable[appIndex], "卸载")
        iCool_storeAppinfoTable[appIndex][6] = true
        print("app安装成功")
    elseif (_G.inAppDling  == 2) then
        sys.timerStop(appInDlingTimer)
        _G.inAppDling = -1
        appInDlingTimer = nil
        lvgl.bar_set_value(bar, 10, lvgl.ANIM_OFF)
        sys.timerStart(function()
            lvgl.obj_del(bar)
            bar = nil
        end, 500)
    end
end
-------------------自动app生成函数-------------------
iCool_storeAppAutoInitVar = iCool_storeAppAutoInit
-------------------app状态相关函数------------------
getAppStateVar = getAppState
checkAppStateVar = checkAppState
unInsAppVar = unInsApp
judegAppVar = judegApp
checkInDlingVar = checkInDling
