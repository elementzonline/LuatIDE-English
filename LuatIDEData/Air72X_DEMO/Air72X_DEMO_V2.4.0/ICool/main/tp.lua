---@diagnostic disable: unbalanced-assignments, undefined-global, lowercase-global
module(..., package.seeall)

require "bit"


local lcd_width = 480
local lcd_height = 854
local ispress = false
local last_x, last_y
x = 0
y = 0

local function tpPrase(data)
    local byteToOne = string.byte(data,1)
    local byteToTwo = string.byte(data,2)
    local byteToThree = string.byte(data,3)
    local byteToFour = string.byte(data,4)
    if (not _G.iCool_DisableTp)then-- 第一个字节头信息为0x52
        if byteToOne == 0x52 then
            local tmpl,tmph
            --第2，3，4，5, 7全是0xff 表示release,其余表示press
            if byteToTwo == 0xff and byteToThree == 0xff then
                if ispress == false then
                    _G.iCool_standByTimeoutSleepScreen()
                    return false, false, -1, -1
                end
    
                ispress = false
                -- log.info("ispress x,y ", ispress, x, y)
                return true, ispress, x, y
            end
    
            -- x 11位， 第3字节为[0,7] 第2字节的[4,6]为[8,11] 转化坐标需要*width/2048
            tmpl = bit.band(byteToTwo, 0xf0)
            tmph = bit.lshift(tmpl, 4)
            x = tmph + byteToThree
            x = x * lcd_width / 2048
    
            -- y 11位， 第4字节为[0,7] 第2字节的[0,2]为[8,11] 转化坐标需要*height/2048
            tmpl = bit.band(byteToTwo, 0x0f)
            tmph = bit.lshift(tmpl, 8) 
            y = tmph + byteToFour
            y = y * lcd_height / 2048
            
            if ispress == true and last_x == x and last_y == y then
                return false, false, -1, -1
            end
    
            ispress = true
            last_x = x
            last_y = y
            -- log.info("ispress x,y ", ispress, x, y)
            return true, ispress, x, y
        end
    end
    
    -- log.info("Tick", "I2C end")
    return false, false, -1, -1
end

local function open(id, speed)
    if i2c.setup(id, speed or i2c.SLOW) ~= i2c.SLOW then
        i2c.close(id)
        return i2c.setup(id, speed or i2c.SLOW)
    end
    return i2c.SLOW
end

local function init()
    --打开电压域
    pmd.ldoset(15, pmd.LDO_VMMC)
    --tp使能管脚
    pins.setup(pio.P0_11,1) 
    --初始化i2c
    if i2c.setup(2, 409600) ~= 409600 then
        log.info("tp init error")
    end
end

local iskeypress = false
local keyid = 0
local keycb = nil
function tpkeyprase(data)
    -- 菜单，home，返回键
    local byteToOne = string.byte(data,1)
    local byteToTwo = string.byte(data,2)
    local byteToThree = string.byte(data,3)
    local byteToSix = string.byte(data,6)

    if byteToOne == 0x52 and byteToTwo == 0xff then
        if byteToSix == 0x01 or byteToSix == 0x04 or byteToSix == 0x02 then
            keyid = byteToSix
            if keycb ~= nil and iskeypress == false then
                iskeypress = true
                keycb(keyid, iskeypress)
            end
        end

        if byteToTwo == 0xff and byteToThree == 0xff and byteToSix == 0xff then
            if iskeypress then 
                iskeypress = false
                if keycb ~= nil then
                    keycb(keyid, iskeypress)
                end
            end
        end
    end
end

function cb(cb)
    log.info("msg2238 cb ")
    keycb = cb
end

function get()
    --通过I2C读取数据8个字节
    -- log.info("Tick", "I2C Start")
    if (_G.iCool_DisableTp)then
        return false, false, -1, -1
    else
        local data = i2c.recv(2, 0x26, 8)
        local a = 0
        for i = 1, 7 do
            if (string.byte(data, i))then
                a = a + string.byte(data, i)
            else
                return false, false, -1, -1
            end
        end
        if (((a % 256) + string.byte(data, 8)) == 256)then
            --解析坐标参数返回valid,ispress,x,y
            tpkeyprase(data)
            return tpPrase(data)
        end
    end
end

init()

--I2C控制函数
function IfcInit(a)
    if (a)then
        init()
    else
        i2c.close(2)
    end
end
