module(...,package.seeall)
--定义一个兼容变量(禁止改动)
--[[
	此处的变量为了兼容LuatIDE中模拟器调试，当你在luatIDE中调试模拟器
	则需要把此变量置为 true 来对代码进行兼容处理
]]
_G.isInSimulator = false
local core = rtos.get_version()
if (core == "LuatOS-Air_V0001_SIMULATOR")then
	print("It's in Simulator", core)
	_G.isInSimulator = true
else
	print("It's not in Simulator", core)
	_G.isInSimulator = false
end
---------------------------------------------Lib库文件----------------------------------------------
require "pmd"
require "LCD" --加载LCD
require "tp" --加载tp
require "lvsym"
require "ntp"
require "misc"
require "audio"
require "common"
require "pm"
require "net"
require "http"
require "update"
---------------------------------------------iCool代码----------------------------------------------
require "iCoolBootUp"
require "iCoolPowerOff"
require "iCoolStyle"
require "iCoolSystem"
require "iCoolIdle"
require "iCoolMulti_Widgets"
require "iCoolClock"
require "iCoolFloder"
require "iCoolAudio"
require "iCoolCalendar"
require "iCoolQrCode"
require "iCoolCalculator"
require "iCoolBlueTooth"
require "iCoolWeather"
require "iCoolSetting"
require "iCoolAppManage"
require "iCoolDataHandle"
require "iCoolStore"
require "iCoolInterfaceManager"
require "iCoolTouchManager"

local data = {type = lvgl.INDEV_TYPE_POINTER}
local function input()
	if (_G.isInSimulator) then
		if lvgl.indev_get_emu_touch ~= nil then
			function keycb()
				menu, home, back = lvgl.indev_get_emu_key()
				if menu > 0 then
					iCool_touchKeyInit(1, 1)
					return
				end
				if home > 0 then
					iCool_touchKeyInit(4, 1)
					return
				end
				if back > 0 then
					iCool_touchKeyInit(2, 1)
					return
				end
			end
			keycb()
			return lvgl.indev_get_emu_touch()
		end
	end
	local ret,ispress,px,py = tp.get()
	if ret then
		if lastispress == ispress and lastpx == px and lastpy == py then
			return data
		end
		lastispress = ispress
		lastpx = px
		lastpy = py
		if ispress then
			tpstate = lvgl.INDEV_STATE_PR
		else
			tpstate = lvgl.INDEV_STATE_REL
		end
	else
		return data
	end
	local topoint = {x = px,y = py}
	data.state = tpstate
	data.point = topoint
	return data
end

function iCoolInit()
	iCoolLvglFreshScr()
	--显示开机动画
	iCool_BootUpInit()
end

local function init()
	lvgl.init(iCoolInit, input)
	pmd.ldoset(7,pmd.LDO_VIBR)
end

--iCool手机初始化
init()
