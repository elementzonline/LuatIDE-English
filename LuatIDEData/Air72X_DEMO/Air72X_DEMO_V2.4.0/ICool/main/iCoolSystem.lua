---@diagnostic disable: unused-function, undefined-global, lowercase-global, undefined-field
-------------------------------------------------------------------------------------------------------
--1. This file is about the system setting of iCool
--2. Try not to change this file if it is not necessary
-------------------------------------------------------------------------------------------------------

--lvgl 刷屏定时器ID
freshByHand = nil
--iCool是否禁用触摸屏
_G.iCool_DisableTp = false
--音量等级(0-7,其中0为静音，7最大)
_G.volumeLevel = 1

--定义长按关机键的时间变量
local iCool_PowerOffmmSecond = 0
local iCool_PowerOffmSecond = 0
local iCool_PowerOffSecond = 0

--定义是否处于熄屏状态(默认为false)
local iCool_OnSleepScreen = false

--待机熄屏定时器的TimeId
local standByTimeIdOne = nil
local standByTimeIdTwo = nil
--是否是待机熄屏定时器1在启动
local isInStandByTimeOne = true

---------------------------------------------
local appTableInfoStoreDir = "/lua/iCoolAppConfig.json"
---------------------------------------------

-------------------SD卡----------------------
local iCoolSDCardRoot = "/sdcard0"
local slash = "/"
local floderiCool = "iCool"
local floderApl = "applications"
local floderTap = "temStorage"
---------------------------------------------
--LVGL手动刷屏
function iCoolLvglFreshScr()
	if (not freshByHand)then
		local o = lvgl.cont_create(lvgl.scr_act(), nil)
		lvgl.obj_set_size(o, 1, 1)
		freshByHand = sys.timerLoopStart(function() lvgl.refr_now(lvgl.obj_get_disp(o)) end, 2)
	end
end

-- 声音键(点击音量下键进入Boot下载模式)
local function VolumeUp(msg)
    log.info("音乐键 上", msg)
	--判断音量上键是否弹起
	--只有当音量键弹起才会触发
	if (msg == 1)then
		if (not _G.iCool_inBootUpPage)then
			_G.volumeLevel = _G.volumeLevel + 1
			if (_G.volumeLevel > 7)then
				_G.volumeLevel = 7
			end
		end
	end
end
local function VolumeDown(msg)
    log.info("音乐键 下", msg)
	--判断音量下键是否弹起
	--只有当音量键弹起才会触发
	if (msg == 1)then
		--判断是否处于开机界面
		if (_G.iCool_inBootUpPage)then
			--音量下键进入Boot下载模式
			ril.request("AT^FORCEDNLD")
			sys.timerStart(function() rtos.restart() end, 1000)
		else
			_G.volumeLevel = _G.volumeLevel - 1
			if (_G.volumeLevel < 0)then
				_G.volumeLevel = 0
			end
		end
	end
end

--关机定时函数
local function iCool_PowerOffTiming()
    iCool_PowerOffmmSecond = iCool_PowerOffmmSecond + 1
    if (iCool_PowerOffmmSecond == 5)then
        iCool_PowerOffmSecond = iCool_PowerOffmSecond +1
        iCool_PowerOffmmSecond = 0
    end
    if (iCool_PowerOffmSecond == 10)then
        iCool_PowerOffSecond = iCool_PowerOffSecond + 1
        iCool_PowerOffmSecond = 0
    end
    if (iCool_PowerOffSecond == 5)then
		iCool_PowerOffPopUpInit()
    end
end
--关机回调函数
local function iCool_PowerOff()
	sys.timerLoopStart(iCool_PowerOffTiming, 20, "iCool_PowerOffSignal")
end

--短按熄屏/亮屏
--短暂点击开机键进行熄屏和亮屏
local function iCool_SleepScreen()
	if (iCool_OnSleepScreen)then
		iCool_OnSleepScreen = false
		if (_G.iCool_inUpdating)then
			_G.iCool_DisableTp = true
		else
			_G.iCool_DisableTp = false
		end
		---------------------------------------------------------
		--退出休眠
		-- pmd.ldoset(7,pmd.LDO_VIBR)
		-- pmd.ldoset(8, pmd.LDO_VLCD)
		-- lcdControl(true)
		-- -----------开启I2C------------
		-- tp.IfcInit(true)
		-- -- -------------开启I2C------------
		-- iCoolLvglFreshScr()
		backlightopen(true)
		---------------------------------------------------------
		--判断是否处于升级中，若为升级中则亮屏不打开下方按钮触摸屏
	else
		--判断是否时处于关机界面或者开机界面
		--处于此界面则无法单击熄屏
		if (not iCool_inPowerOffPage and not iCool_inBootUpPage)then
			----------------------------------------------------------
			backlightopen(false)
			--进入休眠
			-- sys.timerStop(freshByHand)
			-- freshByHand = nil
			-------------关闭I2C------------
			-- tp.IfcInit(false)
			-- -----------关闭I2C------------
			-- lcdControl(false)
			-- pmd.ldoset(0,pmd.LDO_VIBR)
			-- pmd.ldoset(0,pmd.LDO_VLCD)
			----------------------------------------------------------
			iCool_OnSleepScreen = true
			_G.iCool_DisableTp = true
		end
	end
end

--定义开机键功能
--当短暂点击时，是进行熄屏/亮屏操作
--当长按5秒时，是进行关机选择操作
local function keyMsg(msg)
    log.info("开机键",msg.key_matrix_row,msg.key_matrix_col,msg.pressed)
	if msg.pressed then
		iCool_PowerOffmmSecond = 0
		iCool_PowerOffmSecond = 0
		iCool_PowerOffSecond = 0
		if (not iCool_OnSleepScreen)then
			log.info("正在关机中，请按住关机键5秒")
			iCool_PowerOff()
		end
	else
		log.info("你松开手了")
		sys.timerStop(iCool_PowerOffTiming, "iCool_PowerOffSignal")
		iCool_SleepScreen()
	end
end

local function iCool_SleepScreenEnd()
	--判断是否时处于关机界面
	--处于此界面则无法待机熄屏
	if (not iCool_inPowerOffPage)then
		iCool_OnSleepScreen = true
		backlightopen(false)
		_G.iCool_DisableTp = true
	end
end

--待机1分钟，iCool熄屏
function _G.iCool_standByTimeoutSleepScreen()
	if (isInStandByTimeOne)then
		isInStandByTimeOne = false
        sys.timerStop(standByTimeIdTwo)
		standByTimeIdOne = sys.timerStart(iCool_SleepScreenEnd, 60000*1)
	else
		isInStandByTimeOne = true
        sys.timerStop(standByTimeIdOne)
		standByTimeIdTwo = sys.timerStart(iCool_SleepScreenEnd, 60000*1)
	end
end

--挂载SD卡，判断是否存在SD卡
local gl_sdExist = nil

if (_G.isInSimulator)then
	gl_sdExist = 0
else
	gl_sdExist = io.mount(io.SDCARD)
end

--SD卡初始化
--return       true/false
local function iCoolSDInit()
    --判断SD卡是否挂在成功
    --1：成功、0：失败
    if (gl_sdExist == 1)then
        --获取SD卡的总内存大小
        local sdCardTotalSize = rtos.get_fs_total_size(1, 1)/1000
        print("SD卡的总共空间为："..sdCardTotalSize.." KB")
        --获取SD卡的剩余内存大小
        local sdCardLeaveSize = rtos.get_fs_free_size(1, 1)/1000
        print("SD卡的剩余空间为："..sdCardLeaveSize.." KB")
        --在SD卡中创建/sdcard0/iCool/applications/目录
		--1. 先判断是否存在/sdcard0/iCool/目录
		-----是否存在/sdcard0/iCool/applications/目录和/sdcard0/iCool/temStorage/目录
		local a = io.opendir(iCoolSDCardRoot..slash..floderiCool)
		local b, c, b1, c1 = nil, nil, true, true
		if (a == 1)then
			io.closedir(iCoolSDCardRoot..slash..floderiCool)
			b = io.opendir(iCoolSDCardRoot..slash..floderiCool..slash..floderApl)
			if (b == 1)then
				io.closedir(iCoolSDCardRoot..slash..floderiCool..slash..floderApl)
			else
				--1.2 /sdcard0/iCool/applications/目录不存在，则创建
				b1 = false
				b1 = rtos.make_dir(iCoolSDCardRoot..slash..floderiCool..slash..floderApl)
			end
			c = io.opendir(iCoolSDCardRoot..slash..floderiCool..slash..floderTap)
			if (c == 1)then
				io.closedir(iCoolSDCardRoot..slash..floderiCool..slash..floderTap)
			else
				--1.3. /sdcard0/iCool/temStorage/目录不存在，则创建
				c1 = false
				c1 = rtos.make_dir(iCoolSDCardRoot..slash..floderiCool..slash..floderTap)
			end
			if ((b1 and c1) or (b and c))then
				print("SD卡要创建目录都已存在")
				return true
			else
				print("SD初始化失败")
				return false
			end
		else
		--2. /sdcard0/iCool目录不存在，则创建全部
			if (rtos.make_dir(iCoolSDCardRoot..slash..floderiCool))then
				local sdInitSuccess = nil
				b1 = rtos.make_dir(iCoolSDCardRoot..slash..floderiCool..slash..floderApl)
				c1 = rtos.make_dir(iCoolSDCardRoot..slash..floderiCool..slash..floderTap)
				sdInitSuccess = b1 and c1
				if (sdInitSuccess)then
					print("SD卡要创建目录都已创建成功")
				end
				return sdInitSuccess
			else
				--创建/sdcard0/iCool目录失败，初始化失败
				return false
			end
		end
    else
		--SD卡挂载失败，SD卡初始化失败
        return false
    end
end

--FS初始化
--return       true/false
local function iCoolFsInit()
	--获取FS的总内存大小
	local fsTotalSize = rtos.get_fs_total_size()
	print("FS的总共空间为："..fsTotalSize.." B")
	--获取FS的剩余内存大小
	local fsLeaveSize = rtos.get_fs_free_size()
	print("FS的剩余空间为："..fsLeaveSize.." B")
	--在FS中创建/iCool/applications/目录
	--1. 先判断是否存在/iCool/目录
	-----是否存在/iCool/applications/目录和/iCool/temStorage/目录
	local a = io.opendir(slash..floderiCool)
	local b, c, b1, c1 = nil, nil, true, true
	if (a == 1)then
		io.closedir(slash..floderiCool)
		b = io.opendir(slash..floderiCool..slash..floderApl)
		if (b == 1)then
			io.closedir(slash..floderiCool..slash..floderApl)
		else
			--1.2 /iCool/applications/目录不存在，则创建
			b1 = false
			b1 = rtos.make_dir(slash..floderiCool..slash..floderApl)
		end
		c = io.opendir(slash..floderiCool..slash..floderTap)
		if (c == 1)then
			io.closedir(slash..floderiCool..slash..floderTap)
		else
			--1.3. /iCool/temStorage/目录不存在，则创建
			c1 = false
			c1 = rtos.make_dir(slash..floderiCool..slash..floderTap)
		end
		if ((b1 and c1) or (b and c))then
			print("FS要创建目录都已存在")
			return true
		else
			print("FS初始化失败")
			return false
		end
	else
	--2. /iCool目录不存在，则创建全部
		if (rtos.make_dir(slash..floderiCool))then
			local fsInitSuccess = nil
			b1 = rtos.make_dir(slash..floderiCool..slash..floderApl)
			c1 = rtos.make_dir(slash..floderiCool..slash..floderTap)
			fsInitSuccess = b1 and c1
			if (fsInitSuccess)then
				print("FS要创建目录都已创建成功")
			end
			return fsInitSuccess
		else
			--创建/iCool目录失败，初始化失败
			return false
		end
	end
end

_G.sdInitSuccessed = iCoolSDInit()
_G.fsInitSuccessed = iCoolFsInit()

--初始化app表文件/取出添加的app信息  
-----------------------------------------------------------
--@addAppInfo 			要添加的app的信息  
--@return 				nil: 	初始化失败  
--						0: 		app配置表不存在并初始化成功  
--						table:	app配置表存在后并读取app信息  
function appTableDataInit(addAppInfo)
    --判断SD卡是否挂在成功
    --1：成功、0：失败
	if (_G.fsInitSuccessed)then
		--判断appTable信息文件是否存在
		local isExsit = io.exists("/iCool/config.json")
		--判断传入的参数是否是表
		if (type(addAppInfo) == "table")then
			--是表并进行操作
		else
			--不是则使其成为空表
			addAppInfo = {}
		end
		local info = json.encode(addAppInfo)
		if (not isExsit)then
			--不存在则初始化app配置文件
			local buildAppInfoFloder = io.open("/iCool/config.json", "w")
			if (buildAppInfoFloder)then
				buildAppInfoFloder:write(info)
				buildAppInfoFloder:close()
				print("app配置文件已创建")
				return 0
			else
				return nil
			end
		else
			--存在则取出其中的app信息
			local read = io.readFile("/iCool/config.json")
			local a = json.decode(read)
			for k, v in pairs(a)do
				if (type(v) == "table")then
					print("  ", k)
					for i = 1, #v do
						print("     ", v[i])
					end
				else
					print("  ", v)
				end
			end
			print("已提取出app配置信息")
			return a
		end
	else
		--SD卡挂载失败，初始化失败
		return nil
	end
end

-- rtos.remove_dir("/sdcard0/iCool")
-- rtos.remove_dir("/iCool")

--默认关闭休眠
pmd.sleep(0)
pins.setup(pio.P0_10, VolumeUp, pio.PULLUP)
pins.setup(pio.P0_22, VolumeDown,pio.PULLUP)
rtos.closeSoftDog()
rtos.on(rtos.MSG_KEYPAD,keyMsg)
rtos.init_module(rtos.MOD_KEYPAD,0,0,0)