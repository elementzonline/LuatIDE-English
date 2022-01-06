---@diagnostic disable: lowercase-global, undefined-global

local apptid = nil
local dataInFs = true
--通过 SD 卡启动 APP
local function launch(app)
	return sys.taskInit(function()
		local env = mkenv(app)
		setfenv(0, env)
		--加载lib库
		local corelib = {
			"log", "common", "pm",
		}
		for i = 1, #corelib do
			env.require(corelib[i])
		end
		--创建app基础父级
		env.appBase = lvgl.cont_create(lvgl.scr_act(), nil)
		lvgl.obj_set_size(env.appBase, 480, 804)
		lvgl.obj_align(env.appBase, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
		print("env.appBase[start]", env.appBase)
		--进入app初始化文件

		local f, err = loadfile("/sdcard0/iCool/applications/"..app.."/main.lua")
        print("f: ", f)
        print("err: ", err)
		if (f)then
            f(app)
        end
		--app协程退出消息
		local ret, rdata = sys.waitUntil("appCoQuit")
		if (rdata == "yes")then
			collectgarbage("collect")
			collectgarbage("collect")
			print("appCoQuit")
			print("env.appBase[quit]", env.appBase)
			env.appQuit()
			lvgl.obj_del(env.appBase)
			sys.publish("appQuit", "yes")
		end
	end)
end

--通过 FS 启动 APP
local function launchFs(app)
	return sys.taskInit(function()
		local env = mkenvFs(app)
		setfenv(0, env)
		--加载lib库
		local corelib = {
			"log", "common", "pm",
		}
		for i = 1, #corelib do
			env.require(corelib[i])
		end
		--创建app基础父级
		env.appBase = lvgl.cont_create(lvgl.scr_act(), nil)
		lvgl.obj_set_size(env.appBase, 480, 804)
		lvgl.obj_align(env.appBase, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
		print("env.appBase[start]", env.appBase)
		--进入app初始化文件
		local f, err = loadfile("/iCool/applications/"..app.."/main.lua")
        print("f: ", f)
        print("err: ", err)
		if (f)then
            f(app)
        end
		--app协程退出消息
		local ret, rdata = sys.waitUntil("appCoQuit")
		if (rdata == "yes")then
			collectgarbage("collect")
			collectgarbage("collect")
			print("appCoQuit")
			print("env.appBase[quit]", env.appBase)
			env.appQuit()
			lvgl.obj_del(env.appBase)
			sys.publish("appQuit", "yes")
		end
	end)
end

local function apptask()
	sys.timerLoopStart(function() end, 500)
	apps = {}
	while true do
		if (dataInFs)then
			print("APP 在 FS 中")
			local result2, dataFs = sys.waitUntil("APP_FSLAUNCH")
			if apps[dataFs] == nil then
				apps[dataFs] = launchFs(dataFs)
			end
		else
			print("APP 在 SD 中")
			local result, data = sys.waitUntil("APP_SDLAUNCH")
			if apps[data] == nil then
				apps[data] = launch(data)
			end
		end
		local endRet, endData = sys.waitUntil("appQuit")
		if (endData == "yes")then
			print("you will quit app")
			break
		end
	end
end

local function mklib(lib, index)
	setmetatable(lib, {
		__index = index,
	})
	return lib
end

--创建一个app环境
--用于 SD 卡的环境
function mkenv(app)
	local handlers = {}
	setmetatable(handlers, {__index = function() return function() end end})

	local env = {
		--此变量是提供给app用来调用处理app内部内存管理的函数，因此禁止改动
		appQuit = function() end,
		--此变量是app中所有控件的共同的父级，因此禁止改动
		appBase = nil,
		getfenv = getfenv,
		rawset = rawset,
		new_env = new_env,
		loadfile = loadfile,
		tostring = tostring,
		package = package,
		require = function(name)
			if package.loaded[name] ~= nil then package.loaded[name] = nil end
			package.path = "/sdcard0/iCool/applications/"..app.."/?.lua;/lua/?.lua"
			local mod = require(name)
			return mod
		end,
		print = function(...)
			print("[app] ", ...)
		end,
        --lua 5.1自带的表和方法
        string = string, pcall = pcall, os = os, unpack = unpack, next = next, assert = assert, tonumber = tonumber, io = io,
        rawequal = rawequal, collectgarbage = collectgarbage, arg = arg, module = module, math = math, coroutine = coroutine,
        type = type, select = select, table = table, pairs = pairs, ipairs = ipairs, load = load, dofile = dofile,
        error = error, loadstring = loadstring, xpcall = xpcall, debug = debug, setmetatable = setmetatable,
		--合宙官方库
		adc = adc, audiocore = audiocore, bit = bit, btcore = btcore, crypto = crypto, i2c = i2c, json = json, pio = pio,
		pmd = pmd, pwm = pwm, pack = pack, qrencode = qrencode, rtos = rtos, spi = spi, socket = socket, rtk = rtk,
		TTS = TTS, zip = zip, lua_protobuf = lua_protobuf, uart = uart, http = http,
	}

	local indexEnv = {
		audio = mklib({
			play = function(a, b, c, ...)
				if (string.sub(c, 1, 4) == "/lua")then
					local f = "/sdcard0/iCool/applications/"..app.."/resource"..string.sub(c, 5)
					audio.play(a, b, f, ...)
				end
			end
		}, audio),
		lvgl = mklib(
            {
                img_set_src = function(a, b)
                    if (string.sub(b, 1, 4) == "/lua")then
                        local c = "/sdcard0/iCool/applications/"..app.."/resource"..string.sub(b, 5)
                        lvgl.img_set_src(a, c)
                    end
                end,
				font_load = function(a)
                    if (string.sub(a, 1, 4) == "/lua")then
                        local c = "/sdcard0/iCool/applications/"..app.."/resource"..string.sub(a, 5)
                        lvgl.img_set_src(c)
                    end
				end,
				scr_act = function()
					return env.appBase
				end
            }, lvgl),
		sys = mklib({
			init = function(...)
			end,
			run = function(...)
			end
		}, sys),
		app = {
			handlers = handlers,
			on = function(id, handler)
				handlers[id] = handler
			end
		},
	}

	env._G = env

	setmetatable(env, {
		__index = indexEnv,
		__newindex = function(t, k, v)
			print("[app]: ".."add "..tostring(k).." to "..tostring(v))
			rawset(env, k, v)
		end
	})

	return env
end
--用于 FS 系统的环境
function mkenvFs(app)
	local handlers = {}
	setmetatable(handlers, {__index = function() return function() end end})

	local env = {
		--此变量是提供给app用来调用处理app内部内存管理的函数，因此禁止改动
		appQuit = function() end,
		--此变量是app中所有控件的共同的父级，因此禁止改动
		appBase = nil,
		getfenv = getfenv,
		rawset = rawset,
		new_env = new_env,
		loadfile = loadfile,
		tostring = tostring,
		package = package,
		require = function(name)
			if package.loaded[name] ~= nil then package.loaded[name] = nil end
			package.path = "/iCool/applications/"..app.."/?.lua;/lua/?.lua"
			local mod = require(name)
			return mod
		end,
		print = function(...)
			print("[app] ", ...)
		end,
        --lua 5.1自带的表和方法
        string = string, pcall = pcall, os = os, unpack = unpack, next = next, assert = assert, tonumber = tonumber, io = io,
        rawequal = rawequal, collectgarbage = collectgarbage, arg = arg, module = module, math = math, coroutine = coroutine,
        type = type, select = select, table = table, pairs = pairs, ipairs = ipairs, load = load, dofile = dofile,
        error = error, loadstring = loadstring, xpcall = xpcall, debug = debug, setmetatable = setmetatable,
		--合宙官方库
		adc = adc, audiocore = audiocore, bit = bit, btcore = btcore, crypto = crypto, i2c = i2c, json = json, pio = pio,
		pmd = pmd, pwm = pwm, pack = pack, qrencode = qrencode, rtos = rtos, spi = spi, socket = socket, rtk = rtk,
		TTS = TTS, zip = zip, lua_protobuf = lua_protobuf, uart = uart, http = http,
	}

	local indexEnv = {
		audio = mklib({
			play = function(a, b, c, ...)
				if (string.sub(c, 1, 4) == "/lua")then
					local f = "/iCool/applications/"..app.."/resource"..string.sub(c, 5)
					audio.play(a, b, f, ...)
				end
			end
		}, audio),
		lvgl = mklib(
            {
                img_set_src = function(a, b)
                    if (string.sub(b, 1, 4) == "/lua")then
                        local c = "/iCool/applications/"..app.."/resource"..string.sub(b, 5)
                        lvgl.img_set_src(a, c)
                    end
                end,
				font_load = function(a)
                    if (string.sub(a, 1, 4) == "/lua")then
                        local c = "/iCool/applications/"..app.."/resource"..string.sub(a, 5)
                        lvgl.img_set_src(c)
                    end
				end,
				scr_act = function()
					return env.appBase
				end
            }, lvgl),
		sys = mklib({
			init = function(...)
			end,
			run = function(...)
			end
		}, sys),
		app = {
			handlers = handlers,
			on = function(id, handler)
				handlers[id] = handler
			end
		},
	}

	env._G = env

	setmetatable(env, {
		__index = indexEnv,
		__newindex = function(t, k, v)
			print("[app]: ".."add "..tostring(k).." to "..tostring(v))
			rawset(env, k, v)
		end
	})

	return env
end

--app初始化
function iCoolAppLunch(appName, path)
	if (path == "/iCool")then
		dataInFs = true
	else
		dataInFs = false
	end
    apptid = sys.taskInit(apptask)
	if (dataInFs)then
		sys.publish("APP_FSLAUNCH", appName)
	else
		sys.publish("APP_SDLAUNCH", appName)
	end
end