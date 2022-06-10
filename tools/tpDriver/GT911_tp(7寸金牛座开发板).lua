----GT911
module(..., package.seeall)
require "misc"
require "pins"

local addr = 0x14
local i2cid = 2

-- 读取数据
local function i2crd(val)
    i2c.send(i2cid, addr, string.char(0x81, val))
    local ret = i2c.recv(i2cid, addr, 1)
    if ret and #ret == 1 then
        return ret:byte()
    end
    return
end

-- 触摸数据
local data = {
    type = lvgl.INDEV_TYPE_POINTER,
    point = {
        x = 0,
        y = 0
    }
}

function change(px, py)
    -- px = px * (800 / 1024)
    -- py = py * (480 / 600)

    return {
        x = px,
        y = py
    }
end

function input()
    if lvgl.indev_get_emu_touch then
        return lvgl.indev_get_emu_touch()
    end
    if not tpInit then
        return data
    end
    pmd.sleep(100)
    local pressed = i2crd(0x4e)
    i2c.send(i2cid, addr, string.char(0x81, 0x4e, 0x00, 0x00))
    pressed = bit.band(pressed or 0, 0x0f)
    if pressed == 0 then
        data.state = lvgl.INDEV_STATE_REL
    else
        data.state = lvgl.INDEV_STATE_PR
    end
    local x = i2crd(0x50) + (i2crd(0x51) * 256)
    local y = i2crd(0x52) + (i2crd(0x53) * 256)
    x = 1024 - x
    y = 600 - y
    x = x * 800 / 1024
    y = y * 480 / 600
    if x > 0 and y > 0 then
        data.point = change(x, y)
    end
    -- print(data.point.x, data.point.y)
    return data
end
local rst = pins.setup(pio.P0_23, 1)
local int = pins.setup(pio.P0_19)
-- 触摸初始化
sys.taskInit(function()
    if not (pins and pins.setup and i2c) then
        return
    end
    if i2c.setup(i2cid, i2c.SLOW) ~= i2c.SLOW then
        print("i2c.init fail")

        return
    end

    -- 7寸金牛座开发板上的硬件设计兼容了电容触摸屏和电阻触摸屏
    -- 使用电容触摸屏时，需要关掉电阻触摸ic的电压，否则会影响电容触摸屏功能
    -- 如果是自己设计板子，没有做兼容电容和电阻触摸的设计，则不需要下面这行代码
    rst(0)
    sys.wait(10)
    rst(1)
    sys.wait(10)
    -- 拉低电阻上拉电压
    -- 7寸金牛座开发板上的硬件设计兼容了电容触摸屏和电阻触摸屏
    -- 使用电容触摸屏时，需要关掉电阻触摸ic的电压，否则会影响电容触摸屏功能
    -- 如果是自己设计板子，没有做兼容电容和电阻触摸的设计，则不需要下面这行代码
    i2c.send(i2cid, 0x48, 0x80)
    -- 拉低int管脚
    int(0)
    sys.wait(10)
    -- 恢复电阻上拉电压
    -- 7寸金牛座开发板上的硬件设计兼容了电容触摸屏和电阻触摸屏
    -- 使用电容触摸屏时，需要关掉电阻触摸ic的电压，否则会影响电容触摸屏功能
    -- 如果是自己设计板子，没有做兼容电容和电阻触摸的设计，则不需要下面这行代码
    i2c.send(i2cid, 0x48, 0x00)
    -- 置高int管脚
    int(1)
    print("i2c.init 0k---------------")

    --[[   i2c.send(i2cid,i2cslaveaddr, 0x80)
    -------------------------初始化-------------------------
    rst(0)
    sys.wait(100)
    rst(1)
    sys.wait(100)
    sys.wait(100) ]]
    tpInit = true
end)
