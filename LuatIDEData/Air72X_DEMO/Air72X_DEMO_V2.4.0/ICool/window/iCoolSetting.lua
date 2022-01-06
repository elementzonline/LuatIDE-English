---@diagnostic disable: lowercase-global, undefined-global

local setting_displayContentVar, addReturnBtnVar, setting_BackHandleVar
local setVolumeInitVar, pacReleaseInitVar, aboutiCoolInitVar
local setting_getPacDataVar, setVolumeVar
_G.iCool_inUpdating = false
--设置界面初始化
function iCool_settingInit()
    --设置界面基容器
    SETTING_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(SETTING_BASECONT, 480, 804)
    lvgl.obj_align(SETTING_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(SETTING_BASECONT, lvgl.CONT_PART_MAIN, setting_ContStyle)

    setting_displayContentVar()
end
--设置界面信息初始化
local function setting_displayContent()
    setting_List = lvgl.list_create(SETTING_BASECONT, nil)
    lvgl.obj_set_size(setting_List, 480, 804)
    lvgl.obj_align(setting_List, SETTING_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 20)
    lvgl.obj_add_style(setting_List, lvgl.LIST_PART_BG, setting_ThemeStyle_Bg)
    --设置音量
    setting_volumeBtn = lvgl.list_add_btn(setting_List, lvgl.SYMBOL_DIRECTORY, "音量设置")
    lvgl.obj_set_event_cb(setting_volumeBtn, setVolumeInitVar)
    lvgl.obj_add_style(setting_volumeBtn, lvgl.LIST_PART_BG, setting_MainPageBtnStyle)
    --版本更新
    setting_pacReleaseBtn = lvgl.list_add_btn(setting_List, lvgl.SYMBOL_DIRECTORY, "版本更新")
    lvgl.obj_set_event_cb(setting_pacReleaseBtn, pacReleaseInitVar)
    lvgl.obj_add_style(setting_pacReleaseBtn, lvgl.LIST_PART_BG, setting_MainPageBtnStyle)
    --关于iCool
    setting_aboutiCool = lvgl.list_add_btn(setting_List, lvgl.SYMBOL_DIRECTORY, "关于iCool")
    lvgl.obj_set_event_cb(setting_aboutiCool, aboutiCoolInitVar)
    lvgl.obj_add_style(setting_aboutiCool, lvgl.LIST_PART_BG, setting_MainPageBtnStyle)
end
--返回键初始化
local function addReturnBtn()
    --清空选择界面的内容
    lvgl.obj_del(setting_List)
    --界面进入内容总容器
    set_PageCont = lvgl.cont_create(SETTING_BASECONT, nil)
    lvgl.obj_set_size(set_PageCont, 480, 804)
    lvgl.obj_align(set_PageCont, SETTING_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.obj_add_style(set_PageCont, lvgl.CONT_PART_MAIN, setting_ContStyle)

    setting_BackBtn = lvgl.btn_create(set_PageCont, nil)
    lvgl.obj_set_size(setting_BackBtn, 80, 60)
    lvgl.obj_align(setting_BackBtn, set_PageCont, lvgl.ALIGN_IN_TOP_LEFT, 5, 5)
    lvgl.obj_add_style(setting_BackBtn, lvgl.BTN_PART_MAIN, setting_ThemeStyle_Bg)
    lvgl.obj_set_event_cb(setting_BackBtn, setting_BackHandleVar)

    setting_BackBtnLabel = lvgl.label_create(setting_BackBtn, nil)
    lvgl.label_set_text(setting_BackBtnLabel, "返回")
    lvgl.obj_align(setting_BackBtnLabel, setting_BackBtn, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.obj_add_style(setting_BackBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
end
--返回键响应函数
local function setting_BackHandle(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        lvgl.obj_del(set_PageCont)
        setting_displayContentVar()
    end
end
--设置音量初始化
local function setVolumeInit(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        addReturnBtnVar()
        setting_volumeLabel1 = lvgl.label_create(set_PageCont, nil)
        lvgl.label_set_text(setting_volumeLabel1, "设置音量")
        lvgl.obj_align(setting_volumeLabel1, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 220)
        lvgl.obj_add_style(setting_volumeLabel1, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
        --设置音量滑块
        setting_slider = lvgl.slider_create(set_PageCont, nil)
        lvgl.obj_set_size(setting_slider, 300, 10)
        lvgl.slider_set_range(setting_slider, 0, 7)
        lvgl.slider_set_value(setting_slider, _G.volumeLevel, lvgl.ANIM_ON)
        lvgl.obj_align(setting_slider, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 300)
        setting_slLabel = lvgl.label_create(set_PageCont, nil)
        lvgl.label_set_text(setting_slLabel, tostring(_G.volumeLevel))
        lvgl.obj_align(setting_slLabel, setting_slider, lvgl.ALIGN_OUT_BOTTOM_MID, 0, 45)
        lvgl.obj_add_style(setting_slLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
        lvgl.obj_set_event_cb(setting_slider, setVolumeVar)
    end
end
--设置iCool手机音量
local function setVolume(obj, e)
	if (e == lvgl.EVENT_VALUE_CHANGED)then
        _G.volumeLevel = lvgl.slider_get_value(obj)
        lvgl.label_set_text(setting_slLabel, _G.volumeLevel)
        audio.setVolume(_G.volumeLevel)
	end
end
--版本更新界面初始化
local function pacReleaseInit(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        addReturnBtnVar()
        local pacVersion = rtos.get_version()
        local luaScriptsVersion = "iCool ".._G.VERSION
        --显示当前版本
        setting_pacVersionLabel1 = lvgl.label_create(set_PageCont, nil)
        lvgl.label_set_text(setting_pacVersionLabel1, "当前版本")
        lvgl.obj_align(setting_pacVersionLabel1, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 300)
        lvgl.obj_add_style(setting_pacVersionLabel1, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
        --pac包版本信息
        setting_pacVersionLabel2 = lvgl.label_create(set_PageCont, nil)
        lvgl.label_set_text(setting_pacVersionLabel2, pacVersion)
        lvgl.obj_align(setting_pacVersionLabel2, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 350)
        lvgl.obj_add_style(setting_pacVersionLabel2, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
        --lua脚本信息
        setting_pacVersionLabel3 = lvgl.label_create(set_PageCont, nil)
        lvgl.label_set_text(setting_pacVersionLabel3, luaScriptsVersion)
        lvgl.obj_align(setting_pacVersionLabel3, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 400)
        lvgl.obj_add_style(setting_pacVersionLabel3, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
        --检查更新按钮
        setting_checkReleaseBtn = lvgl.btn_create(set_PageCont, nil)
        lvgl.obj_set_size(setting_checkReleaseBtn, 300, 60)
        lvgl.obj_align(setting_checkReleaseBtn, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 480)
        lvgl.obj_add_style(setting_checkReleaseBtn, lvgl.BTN_PART_MAIN, setting_ReleaseBtnStyle)
        lvgl.obj_set_event_cb(setting_checkReleaseBtn, setting_getPacDataVar)

        setting_checkReleaseBtnLabel = lvgl.label_create(setting_checkReleaseBtn, nil)
        lvgl.label_set_text(setting_checkReleaseBtnLabel, "检查更新")
        lvgl.obj_align(setting_checkReleaseBtnLabel, setting_checkReleaseBtn, lvgl.ALIGN_CENTER, 0, 0)
        lvgl.obj_add_style(setting_checkReleaseBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
    end
end
--升级提示
releaseHint = nil
local function updateLogInfo(ret)
    local label = nil
    lvgl.obj_del(releaseHint)
    if (ret)then
        log.info("updateResult", "升级成功")
        label = "升级成功, 即将重启"
    else
        log.info("updateResult", "升级失败")
        label = "升级失败: "
        label = label..(update.libToiCoolGetUpdateData(2))
    end
    --判断是否升级结束
    _G.iCool_inUpdating = false
    --添加更新提示信息
    local failLabel = lvgl.label_create(set_PageCont, nil)
    lvgl.label_set_text(failLabel, label)
    lvgl.obj_align(failLabel, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 150)
    lvgl.obj_add_style(failLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
    --自动删除更新提示信息
    sys.timerStart(function()
        lvgl.obj_del(failLabel)
        --打开触摸屏
        _G.iCool_DisableTp = false
    end, 1500)
    if (label == "升级成功, 即将重启")then
		sys.timerStart(function()
            rtos.restart()
        end, 5500)
    end
end
--获取更新数据
local function setting_getPacData(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (_G.isInSimulator)then
            local noInternetLabel = lvgl.label_create(set_PageCont, nil)
            lvgl.label_set_text(noInternetLabel, "当前为模拟器无法更新版本")
            lvgl.obj_align(noInternetLabel, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 150)
            lvgl.obj_add_style(noInternetLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
            sys.timerStart(function()
                lvgl.obj_del(noInternetLabel)
            end, 1000)
        else
            local a = sim.getStatus()
            local b = net.getNetMode()
            _G.iCool_DisableTp = true
            if (a and (b > 0))then
                releaseHint = lvgl.label_create(set_PageCont, nil)
                lvgl.label_set_text(releaseHint, "正在升级，请等待.....")
                lvgl.obj_align(releaseHint, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 100)
                lvgl.obj_add_style(releaseHint, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
                _G.iCool_inUpdating = true
                --远程升级
                update.request(updateLogInfo)
            else
                local noInternetLabel = lvgl.label_create(set_PageCont, nil)
                lvgl.label_set_text(noInternetLabel, "请先确认已连接网络后再更新版本")
                lvgl.obj_align(noInternetLabel, set_PageCont, lvgl.ALIGN_IN_TOP_MID, 0, 150)
                lvgl.obj_add_style(noInternetLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
                sys.timerStart(function()
                    lvgl.obj_del(noInternetLabel)
                    _G.iCool_DisableTp = false
                end, 1000)
            end
        end
    end
end
--关于iCool初始化
local function aboutiCoolInit(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        addReturnBtnVar()
    end
end
--界面操控函数变量
setting_displayContentVar = setting_displayContent
addReturnBtnVar = addReturnBtn
setting_BackHandleVar = setting_BackHandle
--界面内容初始化函数变量
setVolumeInitVar = setVolumeInit
pacReleaseInitVar = pacReleaseInit
aboutiCoolInitVar = aboutiCoolInit
--具体的界面内容操作函数变量
setting_getPacDataVar = setting_getPacData
setVolumeVar = setVolume
--音量获取函数(对外部文件使用)
function iCool_settingGetVolumeLevel()
    return _G.volumeLevel
end