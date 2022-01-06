---@diagnostic disable: undefined-global, lowercase-global
--Define a macro for development and debugging
local iCool_touchManageDebugSignal = false

------------------------------------------------------Touch Key Management--------------------------------------------  
--1. This function is the management function of iCool mobile phone touch keys  
--2. iCool has three touch keys:  
----2.1 Menu:           this touch key is used to return to Idle  
----2.2 Home:           this touch key is used to return to Idle  
----2.3 Back:           this touch key is used to return to previous interface  
----2.4 whickTouchKey： (Menu is 1, Back is 2, Home is 4)  
----------------------------------------------------------------------------------------------------------------------  
--@whichTouchKey        This is to distinguish which touch key is used  
--@touchKeyState        This is to distinguish the state of touch keys(one is Being pressed, one is release after pressing)
function iCool_touchKeyInit(whichTouchKey, touchKeyState)
    if (not _G.iCool_DisableTp and not iCool_inPowerOffPage)then
        --This is the processing of the menu key
        if (whichTouchKey == 1)then
            if (iCool_touchManageDebugSignal)then
                print("[Menu]".."---------------")
            end
        --This is the processing of the back key
        elseif (whichTouchKey == 2) then
            if (iCool_touchManageDebugSignal)then
                print("[Back]".."---------------")
            end
            iCool_logoutApp()
            --This is the processing of the home key
        elseif (whichTouchKey == 4) then
            if (iCool_touchManageDebugSignal)then
                print("[Home]".."---------------")
            end
        end
    end
end

tp.cb(iCool_touchKeyInit)

--全局的临时变量(禁止改动)
iCool_temporaryppx = -1
------------------------------------------------------TouchScreen Optimization--------------------------------------------  
--触摸屏滑屏优化函数  
--@e                lvgl控件调用的事件函数中的事件变量  
--@screenActSpeed   屏幕的反应速度，数值越小，反应越快(注意不能为0，screenActSpeed>0)  
--@parentObj        页面所对应的父物体(主要是为TabView物体)  
------------------------------------------------------TouchScreen Optimization--------------------------------------------  
function iCoolTouchScreenOptimization(e, screenActSpeed, parentObj)
    --获取页面的数量并记录最大的页面index
    local pageCount = lvgl.tabview_get_tab_count(parentObj) - 1
    if (e == lvgl.EVENT_PRESSING)then
        if (iCool_temporaryppx == -1)then
            iCool_temporaryppx = tp.x
        end
    elseif (e == lvgl.EVENT_RELEASED) then
        if (pageCount ~= 0)then
            local endx = iCool_temporaryppx - tp.x
            --获取当前显示的页面index
            local index = lvgl.tabview_get_tab_act(parentObj)
            if (index == 0)then
                if (endx > screenActSpeed)then
                    lvgl.tabview_set_tab_act(parentObj, 1, lvgl.ANIM_OFF)
                end
            elseif (index > 0 and index < pageCount) then
                if (endx < -screenActSpeed)then
                    lvgl.tabview_set_tab_act(parentObj, (index - 1), lvgl.ANIM_OFF)
                end
                if (endx > screenActSpeed)then
                    lvgl.tabview_set_tab_act(parentObj, (index + 1), lvgl.ANIM_OFF)
                end
            else
                if (endx < -screenActSpeed)then
                    lvgl.tabview_set_tab_act(parentObj, (index - 1), lvgl.ANIM_OFF)
                end
            end
        end
        --对ppx进行还原，为下次的翻屏做准备
        iCool_temporaryppx = -1
    end
end