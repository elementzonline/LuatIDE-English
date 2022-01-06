--- 模块功能：音频功能测试.
-- @author openLuat
-- @module audio.testAudio
-- @license MIT
-- @copyright openLuat
-- @release 2018.03.19

module(...,package.seeall)
--require"record"
require"audio"
require"common"

--音频播放优先级，对应audio.play接口中的priority参数；数值越大，优先级越高，用户根据自己的需求设置优先级
--PWRON：开机铃声
--CALL：来电铃声
--SMS：新短信铃声
--TTS：TTS播放
--REC:录音音频
PWRON,CALL,SMS,TTS,REC = 4,3,2,1,0

local function testCb(r)
    log.info("testAudio.testCb",r)
end

--播放音频文件测试接口，每次打开一行代码进行测试
local function testPlayFile()
    --单次播放来电铃声，默认音量等级
    --audio.play(CALL,"FILE","/lua/call.mp3")
    --单次播放来电铃声，音量等级7
    --audio.play(CALL,"FILE","/lua/call.mp3",audiocore.VOL7)
    --单次播放来电铃声，音量等级7，播放结束或者出错调用testcb回调函数
    --audio.play(CALL,"FILE","/lua/call.mp3",audiocore.VOL7,testCb)
    --循环播放来电铃声，音量等级7，没有循环间隔(一次播放结束后，立即播放下一次)
    audio.play(CALL,"FILE","/lua/call.mp3",audiocore.VOL7,nil,true)
    --循环播放来电铃声，音量等级7，循环间隔为2000毫秒
    --audio.play(CALL,"FILE","/lua/call.mp3",audiocore.VOL7,nil,true,2000)
end


--播放tts测试接口，每次打开一行代码进行测试
--audio.play接口要求TTS数据为UTF8编码，因为本文件编辑时采用的是UTF8编码，所以可以直接使用ttsStr，不用做编码转换
--如果用户自己编辑脚本时，采用的不是UTF8编码，需要调用common.XXX2utf8接口进行转换
local ttsStr = "上海合宙通信科技有限公司欢迎您"
local function testPlayTts()
    --单次播放，默认音量等级
    --audio.play(TTS,"TTS",ttsStr)
    --单次播放，音量等级7
    --audio.play(TTS,"TTS",ttsStr,7)
    --单次播放，音量等级7，播放结束或者出错调用testcb回调函数
    --audio.play(TTS,"TTS",ttsStr,7,testCb)
    --循环播放，音量等级7，没有循环间隔(一次播放结束后，立即播放下一次)
    --audio.play(TTS,"TTS",ttsStr,7,nil,true)
    --循环播放，音量等级7，循环间隔为2000毫秒
    audio.play(TTS,"TTS",ttsStr,7,nil,true,2000)
end


--播放冲突测试接口，每次打开一个if语句进行测试
local function testPlayConflict()
    if true then
        --循环播放来电铃声
        audio.play(CALL,"FILE","/lua/call.mp3",7,nil,true)
        --5秒钟后，循环播放开机铃声
        sys.timerStart(audio.play,5000,PWRON,"FILE","/lua/pwron.mp3",7,nil,true)        
    end    

    if false then
        --循环播放来电铃声
        audio.play(CALL,"FILE","/lua/call.mp3",audiocore.VOL7,nil,true)
        --5秒钟后，尝试循环播放新短信铃声，但是优先级不够，不会播放
        sys.timerStart(audio.play,5000,SMS,"FILE","/lua/sms.mp3",7,nil,true)        
    end    

    if false then
        --循环播放TTS
        audio.play(TTS,"TTS",ttsStr,7,nil,true)
        --10秒钟后，循环播放开机铃声
        sys.timerStart(audio.play,10000,PWRON,"FILE","/lua/pwron.mp3",7,nil,true)        
    end


    if false then
        --循环播放录音
        audio.play(REC,"RECORD",1,7,nil,true)
        --5秒钟后，循环播放开机铃声
        sys.timerStart(audio.play,5000,PWRON,"FILE","/lua/pwron.mp3",7,nil,true)        
    end   
end


local function tesTtsNew()
    --设置优先级相同时的播放策略，1表示停止当前播放，播放新的播放请求
    audio.setStrategy(1)
    audio.play(TTS,"TTS",ttsStr,7)
end

--audio.setChannel(1)

--每次打开下面的一种分支进行测试

if true then
    if string.match(rtos.get_version(),"TTS") then
        sys.timerStart(testPlayTts,5000)
        --如果要测试tts播放时，请求播放新的tts，打开下面这段代码
        --sys.timerLoopStart(tesTtsNew,5000)
    else
        sys.timerStart(testPlayFile,5000)
    end
else
    sys.timerStart(testPlayConflict,5000)
    
    --5秒后，开始录音6秒，之后进行播放冲突测试接口
    --sys.timerStart(record.start,5000,6,testPlayConflict)
end

--[[
sys.taskInit(function()
    local vol = 1
    while true do
        log.info("vol",vol)
        --audio.play(CALL,"FILE","/lua/call.mp3",vol,function() sys.publish("PLAY_END") end)
        audio.play(TTS,"TTS",ttsStr,vol,function() sys.publish("PLAY_END") end)
        sys.waitUntil("PLAY_END")
        vol = (vol==7) and 1 or (vol+1)
    end
end)
]]

--[[
sys.taskInit(function()
    
    while true do        
        sys.wait(2000)  
        
        --播放多arm文件方式
        local multiFile = {"/lua/alipay.amr","/lua/10.amr","/lua/2.amr","/lua/yuan.amr"}
        audio.play(1,"FILE",multiFile,7,function() sys.publish("armMultiTest") end)
        sys.waitUntil("armMultiTest")
        
        sys.wait(2000)
        
        --播放多pcm文件方式
        multiFile = {"/lua/alipay.pcm","/lua/10.pcm","/lua/8.pcm","/lua/yuan.pcm"}
        audio.play(1,"FILE",multiFile,7,function() sys.publish("armMultiTest") end)
        sys.waitUntil("armMultiTest")        
        
    end
end)
]]

--支持audiocore.CLASS_AB和audiocore.CLASS_D两种
--注意：烧录软件后，第一次开机后需要重启一次，设置才会生效
--audiocore.setpa(audiocore.CLASS_AB)
--[[
sys.taskInit(function()    
    while true do                
        audio.play(TTS,"TTS","支付宝收款242425元",3,function() sys.publish("PLAY_END") end)
        sys.waitUntil("PLAY_END")
        
        audio.play(TTS,"TTS","支付宝收款303000元",3,function() sys.publish("PLAY_END") end)
        sys.waitUntil("PLAY_END")
        
        audio.play(TTS,"TTS","支付宝收款6003000元",3,function() sys.publish("PLAY_END") end)
        sys.waitUntil("PLAY_END")
    end
end)
]]

--audio.setTTSSpeed(5)
--pcall(audiocore.pa,13,2)
--audiocore.setpa(audiocore.CLASS_D)
--audio.setChannel(1)

--[[
sys.taskInit(function()
    
    while true do        
        sys.wait(2000)  
        
        --播放多mp3文件方式
        local multiFile = {"/lua/0.mp3","/lua/1.mp3","/lua/2.mp3","/lua/3.mp3","/lua/4.mp3"}
        audio.play(1,"FILE",multiFile,2,function() sys.publish("mp3MultiTest") end)
        sys.waitUntil("mp3MultiTest") 
        
    end
end)
]]





