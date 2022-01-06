PROJECT = "RECORD" 
VERSION = "2.0.0"
require "log"
LOG_LEVEL = log.LOGLEVEL_TRACE
require "sys"

local function call_abc(tag, val, date, time)
    log.info(tag, val, date)
    log.info(tag, val + time, date)
end
local function call_def(t)
    call_abc("QQ", 123, os.date(), t)
end
sys.taskInit(function()
    while true do
        call_def(os.time())
        sys.wait(3000)
    end
end)

sys.taskInit(function()
    local mynum = 0
    local mychr = 'z'
    local mystr = "abcd"
    local myfloat = 1
    local mybool = false
    
    while true do
        
        mynum = mynum + 1
        if mybool == false then
            mybool = true
        else
            mybool = false
        end
        log.info("test1","mynum:", mynum)
        log.info("test1","mychr:", mychr)
        log.info("test1","mystr:", mystr)
        log.info("test1","myfloat:", myfloat)
        log.info("test1","mybool:", mybool)
        sys.wait(100)
    end
end)


sys.taskInit(function()
    local tab2={"apple",111,222,true}
    local tab3={
        key1=100,
        key2="value2",
        jjj=true,
        key4={"apple",111,222,true},
        key3={
            c=100,
            d="value2",
            key3_arr={"c","z","m",2035}
            }
        }
    
    while true do
        tab2[2] = tab2[2] + 1
        tab3["key1"] = tab3["key1"] + 1
        sys.wait(1000)
    end
end)


sys.taskInit(function()
    local array={{"abc1","def1"},{"abc2","def2"},{"abc3","def3"},{"abc4","def4"}}
    while true do
        -- log.info("test",array)
        log.info("test", array[1][1])
        sys.wait(1000)
    end
end)

sys.init(0, 0)
sys.run()