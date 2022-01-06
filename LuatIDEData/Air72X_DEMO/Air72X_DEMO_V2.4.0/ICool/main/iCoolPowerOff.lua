---@diagnostic disable: lowercase-global, undefined-global

--关机函数变量
local iCool_ResetiCoolVar = nil
local iCool_ConfirmPowerOffVar = nil
local iCool_CancelPowerOffVar = nil

iCool_inPowerOffPage = false
--关机弹窗初始化
function iCool_PowerOffPopUpInit()
	--判断是否处于关机界面中
	iCool_inPowerOffPage = true
	iCool_PowerOffPopUpCont = lvgl.cont_create(lvgl.scr_act(), nil)
	lvgl.obj_set_size(iCool_PowerOffPopUpCont, 480, 854)
	lvgl.obj_align(iCool_PowerOffPopUpCont, nil, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.obj_add_style(iCool_PowerOffPopUpCont, lvgl.CONT_PART_MAIN, PowerOff_ContStyle)

	local iCool_iConImg = lvgl.img_create(iCool_PowerOffPopUpCont, nil)
	lvgl.img_set_src(iCool_iConImg, "/lua/Luat.png")
	lvgl.obj_align(iCool_iConImg, iCool_PowerOffPopUpCont, lvgl.ALIGN_CENTER, 0, -200)

	--重启
	local iCool_ResetBtn = lvgl.btn_create(iCool_PowerOffPopUpCont, nil)
	lvgl.obj_set_size(iCool_ResetBtn, 100, 80)
	lvgl.obj_align(iCool_ResetBtn, iCool_PowerOffPopUpCont, lvgl.ALIGN_CENTER, -120, 150)
	lvgl.obj_set_event_cb(iCool_ResetBtn, iCool_ResetiCoolVar)
	lvgl.obj_add_style(iCool_ResetBtn, lvgl.BTN_PART_MAIN, PowerOff_BtnStyle)
	
	local iCoolResetLabel = lvgl.label_create(iCool_ResetBtn, nil)
	lvgl.label_set_text(iCoolResetLabel, "重启")
	lvgl.obj_align(iCoolResetLabel, iCool_ResetBtn, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.obj_add_style(iCoolResetLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)

	--关机
	local iCool_PowerOffBtn = lvgl.btn_create(iCool_PowerOffPopUpCont, nil)
	lvgl.obj_set_size(iCool_PowerOffBtn, 100, 80)
	lvgl.obj_align(iCool_PowerOffBtn, iCool_PowerOffPopUpCont, lvgl.ALIGN_CENTER, 120, 150)
	lvgl.obj_set_event_cb(iCool_PowerOffBtn, iCool_ConfirmPowerOffVar)
	lvgl.obj_add_style(iCool_PowerOffBtn, lvgl.BTN_PART_MAIN, PowerOff_BtnStyle)
	
	local iCoolPowerOffLabel = lvgl.label_create(iCool_PowerOffBtn, nil)
	lvgl.label_set_text(iCoolPowerOffLabel, "关机")
	lvgl.obj_align(iCoolPowerOffLabel, iCool_PowerOffBtn, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.obj_add_style(iCoolPowerOffLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
	
	--取消关机
	-- local iCool_CancelBtn = lvgl.btn_create(iCool_PowerOffPopUpCont, nil)
	-- lvgl.obj_set_size(iCool_CancelBtn, 100, 80)
	-- lvgl.obj_align(iCool_CancelBtn, iCool_PowerOffPopUpCont, lvgl.ALIGN_CENTER, 0, 300)
	-- lvgl.obj_set_event_cb(iCool_CancelBtn, iCool_CancelPowerOffVar)
	-- lvgl.obj_add_style(iCool_CancelBtn, lvgl.BTN_PART_MAIN, PowerOff_BtnStyle)

	-- local iCoolCancelLabel = lvgl.label_create(iCool_CancelBtn, nil)
	-- lvgl.label_set_text(iCoolCancelLabel, "取消")
	-- lvgl.obj_align(iCoolCancelLabel, iCool_CancelBtn, lvgl.ALIGN_CENTER, 0, 0)
	-- lvgl.obj_add_style(iCoolCancelLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_White)
end

local function iCool_ResetiCool(obj, e)
	if (e == lvgl.EVENT_CLICKED)then
		log.info("---正在重启---")
		rtos.restart()
	end
end

local function iCool_ConfirmPowerOff(obj, e)
	if (e == lvgl.EVENT_CLICKED)then
		log.info("---你已经关机了---")
		rtos.poweroff()
	end
end

-- local function iCool_CancelPowerOff(obj, e)
-- 	if (e == lvgl.EVENT_CLICKED)then
-- 		log.info("---取消关机---")
-- 		print("iCoolll", iCool_PowerOffPopUpCont)
-- 		lvgl.obj_del(iCool_PowerOffPopUpCont)
-- 	end
-- end

iCool_ResetiCoolVar = iCool_ResetiCool
iCool_ConfirmPowerOffVar = iCool_ConfirmPowerOff
iCool_CancelPowerOffVar = iCool_CancelPowerOff
