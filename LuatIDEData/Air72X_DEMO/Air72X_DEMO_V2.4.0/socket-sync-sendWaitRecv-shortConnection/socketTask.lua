--- 模块功能：socket短连接功能测试
-- @author openLuat
-- @module socketShortConnection.socketTask
-- @license MIT
-- @copyright openLuat
-- @release 2018.03.27

module(...,package.seeall)

require"socket"

--启动socket客户端任务
sys.taskInit(
    function()
        local retryConnectCnt = 0
        while true do
            if not socket.isReady() then
                retryConnectCnt = 0
                --等待网络环境准备就绪，超时时间是5分钟
                sys.waitUntil("IP_READY_IND",300000)
            end
            
            if socket.isReady() then
                --创建一个socket tcp客户端
                local socketClient = socket.tcp()
                --阻塞执行socket connect动作，直至成功
                if socketClient:connect("180.97.80.55",12415) then
                    retryConnectCnt = 0
                    if socketClient:send("heart data\r\n") then
                        result,data = socketClient:recv(5000)
                        if result then
                            --TODO：处理收到的数据data
                            log.info("socketTask.recv",data)
                        end
                    end
                else
                    retryConnectCnt = retryConnectCnt+1
                end
                
                --断开socket连接
                socketClient:close()
                if retryConnectCnt>=5 then link.shut() retryConnectCnt=0 end
                sys.wait(20000)
            else
                --进入飞行模式，20秒之后，退出飞行模式
                net.switchFly(true)
                sys.wait(20000)
                net.switchFly(false)
            end
        end
    end
)
