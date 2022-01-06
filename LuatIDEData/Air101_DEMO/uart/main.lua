-- LuaTools需要PROJECT和VERSION这两个信息
PROJECT = "uart_irq"
VERSION = "1.0.0"

log.info("main", PROJECT, VERSION)

-- 引入必要的库文件(lua编写), 内部库不需要require
local sys = require "sys"

if wdt then
    --添加硬狗防止程序卡死，在支持的设备上启用这个功能
    wdt.init(15000)--初始化watchdog设置为15s
    sys.timerLoopStart(wdt.feed, 10000)--10s喂一次狗
end

log.info("main", "uart demo")

local uartid = 1 -- 根据实际设备选取不同的uartid

--初始化
local result = uart.setup(
    uartid,--串口id
    115200,--波特率
    8,--数据位
    1--停止位
)


--循环发数据
sys.timerLoopStart(uart.write,1000, uartid, "test")
-- 收取数据会触发回调, 这里的"receive" 是固定值
uart.on(uartid, "receive", function(id, len)
    local s = ""
    repeat
        -- 如果是air302, len不可信, 传1024
        -- s = uart.read(id, 1024)
        s = uart.read(id, len)
        if #s > 0 then -- #s 是取字符串的长度
            -- 如果传输二进制/十六进制数据, 部分字符不可见, 不代表没收到
            -- 关于收发hex值,请查阅 https://doc.openluat.com/article/583
            log.info("uart", "receive", id, #s, s)
            -- log.info("uart", "receive", id, #s, s:toHex())
        end
    until s == ""
end)

-- 并非所有设备都支持sent事件
uart.on(uartid, "sent", function(id)
    log.info("uart", "sent", id)
end)

-- sys.taskInit(function()
--     while 1 do
--         sys.wait(500)
--     end
-- end)


-- 用户代码已结束---------------------------------------------
-- 结尾总是这一句
sys.run()
-- sys.run()之后后面不要加任何语句!!!!!
