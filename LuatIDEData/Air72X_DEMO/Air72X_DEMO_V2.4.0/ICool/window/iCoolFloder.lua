---@diagnostic disable: lowercase-global, undefined-global

floder_InfoTable = {}
FLODER_BASECONT = nil
--floder界面主List
floder_MainList = nil
--floder界面子List
floder_ListBtn = nil
floder_Number = 0

floder_LabelTable = {"Andriod", "System", "Audio", "sys.txt", "call.mp3"}

--Floder界面函数变量
local floder_BackHandle_Var
local floder_EnterFloder_Var
local floder_floder_FloderDisplay_Var

floderPage_OPA0Style = lvgl.style_t()

local function floder_BackHandle(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[Floder]floder_BackHandle")
        lvgl.list_clean(floder_MainList)
        floder_floder_FloderDisplay_Var()
    end
end

local function floder_EnterFloder()
    
    floder_BackBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_NEW_LINE, "Back")
    lvgl.obj_set_event_cb(floder_BackBtn, floder_BackHandle)

    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_DIRECTORY, "Android")
    
    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_DIRECTORY, "System")

    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_DIRECTORY, "Audio")
    
    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_FILE, "sys.txt")

    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_AUDIO, "Happy Birthday.mp3")

end

local function floder_MainHandle(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        lvgl.list_clean(floder_MainList)
        floder_EnterFloder()
    end
end

local function floder_FloderDisplay()

    --本机内存文件夹
    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_DIRECTORY, "我的手机")
    lvgl.obj_set_event_cb(floder_ListBtn, floder_MainHandle)

    --SD卡内存文件夹
    floder_ListBtn = lvgl.list_add_btn(floder_MainList, lvgl.SYMBOL_DIRECTORY, "SD卡")
    lvgl.obj_set_event_cb(floder_ListBtn, floder_MainHandle)
end

--为floder的函数变量赋值以便于更随意的调用
floder_BackHandle_Var = floder_BackHandle
floder_EnterFloder_Var = floder_EnterFloder
floder_floder_FloderDisplay_Var = floder_FloderDisplay

function floderInit()
    --floder界面透明样式
    lvgl.style_init(floderPage_OPA0Style)
    lvgl.style_set_bg_opa(floderPage_OPA0Style, lvgl.STATE_DEFAULT, lvgl.OPA_0)
    lvgl.style_set_border_opa(floderPage_OPA0Style, lvgl.STATE_DEFAULT, lvgl.OPA_0)

    --Floder界面基容器
    FLODER_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(FLODER_BASECONT, 480, 804)
	lvgl.obj_align(FLODER_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)

    --文件界面主List
    floder_MainList = lvgl.list_create(FLODER_BASECONT, nil)
    lvgl.obj_set_size(floder_MainList, 480, 804)
    lvgl.obj_align(floder_MainList, FLODER_BASECONT, lvgl.ALIGN_CENTER, 0, 0)

    floder_FloderDisplay()
end

