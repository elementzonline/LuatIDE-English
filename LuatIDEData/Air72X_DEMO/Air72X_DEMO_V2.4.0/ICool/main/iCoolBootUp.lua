---@diagnostic disable: lowercase-global, undefined-global

_G.iCool_inBootUpPage = nil
--显示开机画面
local function iCool_DisplayBootUpImg()
	iCool_BootUpCont = lvgl.cont_create(lvgl.scr_act(), nil)
	lvgl.obj_set_size(iCool_BootUpCont, 480, 854)
	lvgl.obj_align(iCool_BootUpCont, nil, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.obj_add_style(iCool_BootUpCont, lvgl.CONT_PART_MAIN, BootUp_ContStyle)

	iCool_BootUpImg = lvgl.img_create(iCool_BootUpCont, nil)
	lvgl.img_set_src(iCool_BootUpImg, "/lua/Luat.png")
	lvgl.obj_align(iCool_BootUpImg, nil, lvgl.ALIGN_CENTER, 0, -200)

	iCool_BootUpFontImg = lvgl.img_create(iCool_BootUpCont, nil)
	lvgl.img_set_src(iCool_BootUpFontImg, "/lua/LuatFont.png")
	lvgl.obj_align(iCool_BootUpFontImg, nil, lvgl.ALIGN_IN_BOTTOM_MID, 0, -20)
end
--关闭开机动画
local function iCool_CloseBootUpTiming()
	log.info("-----你已经关闭开机画面------")
	lvgl.obj_del(iCool_BootUpCont)
	_G.iCool_inBootUpPage = false
	iCool_initInterface()
end
--开始开机动画计时
local function iCool_StartBootUpTiming()
	sys.timerStart(iCool_CloseBootUpTiming, 6000)
end
--开机动画初始化
function iCool_BootUpInit()
	iCool_DisplayBootUpImg()
	backlightopen(true)
	_G.iCool_inBootUpPage = true
	iCool_StartBootUpTiming()
end
