
module(..., package.seeall)
----GT911

require "misc"
require "utils"
require "pins"

local GT911addr = 0x14
local i2cid = 2

local rst = pins.setup(23, 1)
local int = pins.setup(19)

local function init()
    if i2c.setup(i2cid, i2c.SLOW) ~= i2c.SLOW then
        print("i2c.init fail")
        return
    end
    -------------------------初始化-------------------------
    rst(0)
    int(1)
    sys.wait(10)
    rst(1)
    sys.wait(10)
    int(0)
    sys.wait(55)
    sys.wait(50)
end

sys.taskInit(init)

local ispress = false
local last_x, last_y
x = 0
y = 0

iskeypress = false
lastKeypress = false
local keyid = 0
local keycb = nil
function tpkeyprase()
    if iskeypress ~= lastKeypress then
        lastKeypress = iskeypress
        if keycb ~= nil then keycb(2, iskeypress) end
    end
end

function cb(cb)
    log.info("msg2238 cb ")
    keycb = cb
end

function get()
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x4e))
    pressed = i2c.recv(i2cid, GT911addr, 1)
    if pressed:byte() == nil then return false, false, -1, -1 end
    pressed = bit.band(pressed:byte(), 0x0f)
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x4e, 0x00, 0x00))
    if pressed == 0 then
        if ispress == false then return false, false, -1, -1 end

        ispress = false
        -- log.info("ispress x,y ", ispress, x, y)
        return true, ispress, x, y
    end
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x51))
    xh = i2c.recv(i2cid, GT911addr, 1):byte()
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x50))
    xl = i2c.recv(i2cid, GT911addr, 1):byte()

    i2c.send(i2cid, GT911addr, string.char(0x81, 0x53))
    yh = i2c.recv(i2cid, GT911addr, 1):byte()
    i2c.send(i2cid, GT911addr, string.char(0x81, 0x52))
    yl = i2c.recv(i2cid, GT911addr, 1):byte()
    x = xl + (xh * 256)
    y = yl + (yh * 256)
    if ispress == true and last_x == x and last_y == y then
        return false, false, -1, -1
    end
    ispress = true
    last_x = x
    last_y = y
    -- log.info("ispress x,y ", ispress, x, y)
    return true, ispress, x, y
    -- end
end

local data = {type = lvgl.INDEV_TYPE_POINTER}

function input()

    if lvgl.indev_get_emu_touch then
        return lvgl.indev_get_emu_touch()
    end

    pmd.sleep(100)
    local ret, ispress, px, py = get()
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
    data.state = tpstate
    data.point = {x = px, y = py}
    return data
end


-- sys.timerLoopStart(function() 
--     local a=i2c.read(i2cid,0x5051,2)
--     print("a",a)
-- end,50)