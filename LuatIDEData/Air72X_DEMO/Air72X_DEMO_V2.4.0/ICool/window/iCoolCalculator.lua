---@diagnostic disable: lowercase-global, undefined-global

--Define a macro for development and debugging
local iCool_calculatorDebugSignal = false
--计算器界面按钮函数变量
local calcu_AutoCreateBtnVar
--计算器界面按钮函数
    --加
    local calcu_PlusFunVar,
    --减
    calcu_SubsFunVar,
    --乘
    calcu_MultiFunVar,
    --除
    calcu_DivFunVar,
    --CE
    calcu_RemFunVar,
    --清0
    calcu_SetZeroFunVar,
    --等于
    calcu_EqualFunVar,
    --正负
    calcu_NegateVar,
    --删除
    calcu_DeleteVar,
    --数字0
    calcu_NumberZeroVar,
    --数字1
    calcu_NumberOneVar,
    --数字2
    calcu_NumberTwoVar,
    --数字3
    calcu_NumberThreeVar,
    --数字4
    calcu_NumberFourVar,
    --数字5
    calcu_NumberFiveVar,
    --数字6
    calcu_NumberSixVar,
    --数字7
    calcu_NumberSevenVar,
    --数字8
    calcu_NumberEightVar,
    --数字9
    calcu_NumberNineVar,
    --小数点
    calcu_DotVar

--计算器的实用小函数变量
local calcu_EqualVar = nil
local calcu_GetSumVar = nil
local calcu_ClearDataVar = nil
local calcu_InputNumberVar = nil
local calcu_InputOperatorVar = nil
--计算器数据存储表
calcu_DataRecordTable = {}
calcu_DataRecordTable[1] = 0
--当前数据存储表中的数据量
_G.calcu_curDataNumber = 1

--计算器显示字符表
calcu_DisplayStringTable = ""
calcu_LeftString = nil
calcu_RightString = nil
--记录显示的变量
calcu_ProcessNumber = nil
--上一个运算符
calcu_PreOperator = nil
--当前运算符
calcu_curOperator = nil
--是否是第一次输入运算符
calcu_FirstInputOperator = true
--是否是第一次输入
calcu_FirstInputNumber = true
--是否点击了等于
calcu_ClickEqual = false
--点击了正负号
calcu_ClickNegate = false


function iCoolCalculatorInit()
    calcu_DataRecordTable = {}
    calcu_DataRecordTable[1] = 0
    _G.calcu_curDataNumber = 1
    calcu_DisplayStringTable = ""
    calcu_LeftString = nil
    calcu_RightString = nil
    calcu_ProcessNumber = nil
    calcu_PreOperator = nil
    calcu_curOperator = nil
    calcu_FirstInputOperator = true
    calcu_FirstInputNumber = true
    calcu_ClickEqual = false
    calcu_ClickNegate = false
    --计算器基容器
    CALCULATOR_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(CALCULATOR_BASECONT, 480, 804)
    lvgl.obj_align(CALCULATOR_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(CALCULATOR_BASECONT, lvgl.CONT_PART_MAIN, absTransStyle)

    --计算器显示区域
    calcu_DisplayResultArea = lvgl.cont_create(CALCULATOR_BASECONT, nil)
    lvgl.obj_set_size(calcu_DisplayResultArea, 480, 154)
    lvgl.obj_align(calcu_DisplayResultArea, CALCULATOR_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.obj_add_style(calcu_DisplayResultArea, lvgl.CONT_PART_MAIN, calcu_DisplayResultAreaStyle)

    --计算器计算过程显示
    calcu_DisplayProcessLabel = lvgl.label_create(calcu_DisplayResultArea, nil)
    lvgl.label_set_text(calcu_DisplayProcessLabel, "")
    lvgl.obj_align(calcu_DisplayProcessLabel, calcu_DisplayResultArea, lvgl.ALIGN_IN_TOP_MID, 0, 30)

    --计算器运算显示
    calcu_DisplayLabel = lvgl.label_create(calcu_DisplayResultArea, nil)
    lvgl.label_set_text(calcu_DisplayLabel, "0")
    lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)

    --计算器按钮区域
    calcu_BtnControlArea = lvgl.cont_create(CALCULATOR_BASECONT, nil)
    lvgl.obj_set_size(calcu_BtnControlArea, 480, (804-lvgl.obj_get_height(calcu_DisplayResultArea)))
    lvgl.obj_align(calcu_BtnControlArea, CALCULATOR_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, (lvgl.obj_get_height(calcu_DisplayResultArea)))
    lvgl.obj_add_style(calcu_BtnControlArea, lvgl.CONT_PART_MAIN, calcu_BtnAreaStyle)

    for i = 1, 20 do
        calcu_AutoCreateBtnVar(calcu_BtnInfoTable[i][1], calcu_BtnInfoTable[i][2], calcu_BtnInfoTable[i][3], calcu_BtnInfoTable[i][4])
    end

end

--自动生成按钮
--@pos_x                按钮相对于按钮区域的水平位置
--@pos_y                按钮相对于按钮区域的垂直位置
--@calcu_btnHandle      按钮所对应的响应函数
--@btnName              按钮所显示的名称
local function calcu_AutoCreateBtn(pos_x, pos_y, calcu_btnHandle, btnName)
    calcu_Btn = lvgl.btn_create(calcu_BtnControlArea, nil)
    lvgl.obj_set_size(calcu_Btn, 120, 130)
    lvgl.obj_align(calcu_Btn, calcu_BtnControlArea, lvgl.ALIGN_IN_TOP_LEFT, pos_x, pos_y)
    lvgl.obj_add_style(calcu_Btn, lvgl.BTN_PART_MAIN, calcu_BtnStyle)
    lvgl.obj_set_event_cb(calcu_Btn, calcu_btnHandle)

    calcu_BtnName = lvgl.label_create(calcu_Btn, nil)
    lvgl.label_set_text(calcu_BtnName, btnName)
    lvgl.obj_align(calcu_BtnName, calcu_Btn, lvgl.ALIGN_CENTER, 0, 0)
end
--加
local function calcu_PlusFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Plus")
        end
        calcu_InputOperatorVar("+")
    end
end
--减
local function calcu_SubsFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Subs")
        end
        calcu_InputOperatorVar("-")
    end
end
--乘
local function calcu_MultiFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Multi")
        end
        calcu_InputOperatorVar("*")
    end
end
--除
local function calcu_DivFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Div")
        end
        calcu_InputOperatorVar("/")
    end
end
--CE
local function calcu_RemFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---CE")
        end
        calcu_ClearDataVar()
        lvgl.label_set_text(calcu_DisplayLabel, "0")
        lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
    end
end
--清0
local function calcu_SetZeroFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---SetZero")
        end
        calcu_ClearDataVar()
        lvgl.label_set_text(calcu_DisplayLabel, "0")
        lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
    end
end
--等于
local function calcu_EqualFun(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Equal")
        end
        calcu_EqualVar()
    end
end
--正负
local function calcu_Negate(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Negate")
        end
        calcu_InputNumberVar("+/-")
    end
end
--删除
local function calcu_Delete(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Delete")
        end
        calcu_DisplayStringTable = string.sub(calcu_DisplayStringTable, 1, -2)
        calcu_RightString = calcu_DisplayStringTable
        lvgl.label_set_text(calcu_DisplayLabel, calcu_DisplayStringTable)
    end
end
--数字0
local function calcu_NumberZero(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberZero")
        end
        calcu_InputNumberVar("0")
    end
end
--数字1
local function calcu_NumberOne(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberOne")
        end
        calcu_InputNumberVar("1")
    end
end
--数字2
local function calcu_NumberTwo(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberTwo")
        end
        calcu_InputNumberVar("2")
    end
end
--数字3
local function calcu_NumberThree(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberThree")
        end
        calcu_InputNumberVar("3")
    end
end
--数字4
local function calcu_NumberFour(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberFour")
        end
        calcu_InputNumberVar("4")
    end
end
--数字5
local function calcu_NumberFive(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberFive")
        end
        calcu_InputNumberVar("5")
    end
end
--数字6
local function calcu_NumberSix(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberSix")
        end
        calcu_InputNumberVar("6")
    end
end
--数字7
local function calcu_NumberSeven(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberSeven")
        end
        calcu_InputNumberVar("7")
    end
end
--数字8
local function calcu_NumberEight(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberEight")
        end
        calcu_InputNumberVar("8")
    end
end
--数字9
local function calcu_NumberNine(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---NumberNine")
        end
        calcu_InputNumberVar("9")
    end
end
--小数点
local function calcu_Dot(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        if (iCool_calculatorDebugSignal)then
            log.info("Calculator".."---Dot")
        end
        calcu_InputNumberVar(".")
    end
end

local function calcu_ClearData()
    calcu_FirstInputOperator = true
    calcu_RightString = nil
    calcu_LeftString = nil
    calcu_ClickNegate = false
    calcu_ClickEqual = false
    calcu_PreOperator = nil
    calcu_curOperator = nil
    calcu_DisplayStringTable = ""
end

--获取同步计算的值
local function calcu_GetSum(whatOperator)
    --判断是否是输入为 "."
    if (calcu_RightString == ".")then
        calcu_RightString = "0"
    end
    if (calcu_LeftString == ".")then
        calcu_LeftString = "0"
    end
    if (iCool_calculatorDebugSignal)then
        print("左值为(Left)："..calcu_LeftString.."\n".."右值为(Right)："..calcu_RightString)
    end
    if (whatOperator == "+")then
        return calcu_LeftString + calcu_RightString
    elseif (whatOperator == "-") then
        return calcu_LeftString - calcu_RightString
    elseif (whatOperator == "*") then
        return calcu_LeftString * calcu_RightString
    elseif (whatOperator == "/") then
        if (0 == tonumber(calcu_RightString))then
            if (iCool_calculatorDebugSignal)then
                print("除数为0，计算出错")
            end
            calcu_ClearDataVar()
            return "除数不能为0"
        end
        return calcu_LeftString / calcu_RightString
    end
end

--输入数字
local function calcu_InputNumber(whatNumber)
    if (whatNumber == "+/-")then
        if (calcu_ClickEqual)then
            calcu_ClickNegate = true
            calcu_FirstInputOperator = true
            calcu_RightString = tostring(tonumber(calcu_RightString) * (-1))
            lvgl.label_set_text(calcu_DisplayLabel, calcu_RightString)
            lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
        else
            if (calcu_RightString)then
                calcu_ClickNegate = true
                calcu_FirstInputOperator = true
                calcu_RightString = tostring(tonumber(calcu_RightString) * (-1))
                calcu_DisplayStringTable = calcu_RightString
                lvgl.label_set_text(calcu_DisplayLabel, calcu_DisplayStringTable)
                lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
            end
        end
    else
        calcu_DisplayStringTable = calcu_DisplayStringTable..whatNumber
        calcu_RightString = calcu_DisplayStringTable
        if (iCool_calculatorDebugSignal)then
            print("--------Number----------")
            print("右值为(Right):  ", calcu_RightString)
        end
        lvgl.label_set_text(calcu_DisplayLabel, calcu_DisplayStringTable)
        lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
    end
end

local function calcu_InputOperator(whatOperator)
    --对输入的数字进行判读，若为nil，则表示连续输入2次及以上运算符
    local temNumber = tonumber(calcu_DisplayStringTable)
    if (iCool_calculatorDebugSignal)then
        print("The Input is : ", temNumber)
    end
    --把上次输入的运算符保存
    calcu_PreOperator = calcu_curOperator
    --接受当前输入的运算符
    calcu_curOperator = whatOperator

    if (temNumber)then
        if (calcu_FirstInputOperator)then
            if (calcu_ClickEqual or calcu_ClickNegate)then
                calcu_ClickEqual = false
                calcu_ClickNegate = false
                calcu_FirstInputOperator = false
                calcu_LeftString = calcu_RightString
                calcu_RightString = nil
            else
                --是首次输入运算符
                calcu_FirstInputOperator = false
                calcu_LeftString = calcu_RightString
                calcu_RightString = nil
            end
        else
            --不是首次输入运算符
            calcu_LeftString = calcu_GetSumVar(calcu_PreOperator)
            if (iCool_calculatorDebugSignal)then
                print("--------Operator----------")
                print("左值为(Left)：", calcu_LeftString)
            end
            lvgl.label_set_text(calcu_DisplayLabel, calcu_LeftString)
            lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
        end
    else
        --进入此选项表示连续输入两次及以上运算符
        --只更新运算符
        lvgl.label_set_text(calcu_DisplayLabel, calcu_LeftString)
        lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
    end

    --清空待输入的数据
    calcu_DisplayStringTable = ""
end

local function calcu_Equal()
    if (not calcu_ClickEqual)then
        calcu_RightString = calcu_GetSumVar(calcu_curOperator)
        if (iCool_calculatorDebugSignal)then
            print("The Result is: ", calcu_RightString)
        end
        lvgl.label_set_text(calcu_DisplayLabel, calcu_RightString)
        lvgl.obj_align(calcu_DisplayLabel, calcu_DisplayResultArea, lvgl.ALIGN_OUT_BOTTOM_MID, 0, -30)
        calcu_ClickEqual = true
        calcu_FirstInputOperator = true
    end
end



calcu_AutoCreateBtnVar = calcu_AutoCreateBtn
calcu_PlusFunVar = calcu_PlusFun
calcu_SubsFunVar = calcu_SubsFun
calcu_MultiFunVar = calcu_MultiFun
calcu_DivFunVar = calcu_DivFun
calcu_RemFunVar = calcu_RemFun
calcu_SetZeroFunVar = calcu_SetZeroFun
calcu_EqualFunVar = calcu_EqualFun
calcu_NegateVar = calcu_Negate
calcu_DeleteVar = calcu_Delete
--数字
calcu_NumberZeroVar = calcu_NumberZero
calcu_NumberOneVar = calcu_NumberOne
calcu_NumberTwoVar = calcu_NumberTwo
calcu_NumberThreeVar = calcu_NumberThree
calcu_NumberFourVar = calcu_NumberFour
calcu_NumberFiveVar = calcu_NumberFive
calcu_NumberSixVar = calcu_NumberSix
calcu_NumberSevenVar = calcu_NumberSeven
calcu_NumberEightVar = calcu_NumberEight
calcu_NumberNineVar = calcu_NumberNine
calcu_DotVar = calcu_Dot
--小函数
calcu_EqualVar = calcu_Equal
calcu_GetSumVar = calcu_GetSum
calcu_ClearDataVar = calcu_ClearData
calcu_InputNumberVar = calcu_InputNumber
calcu_InputOperatorVar = calcu_InputOperator

--计算器按钮信息表
calcu_BtnInfoTable = 
{
    {0, 0, calcu_SetZeroFunVar, "C"},
    {120, 0, calcu_MultiFunVar, "*"},
    {240, 0, calcu_DivFunVar, "/"},
    {360, 0, calcu_DeleteVar, "删除"},
    {0, 130, calcu_NumberNineVar, "9"},
    {120, 130, calcu_NumberEightVar, "8"},
    {240, 130, calcu_NumberSevenVar, "7"},
    {360, 130, calcu_RemFunVar, "CE"},
    {0, 260, calcu_NumberSixVar, "6"},
    {120, 260, calcu_NumberFiveVar, "5"},
    {240, 260, calcu_NumberFourVar, "4"},
    {360, 260, calcu_SubsFunVar, "-"},
    {0, 390, calcu_NumberThreeVar, "3"},
    {120, 390, calcu_NumberTwoVar, "2"},
    {240, 390, calcu_NumberOneVar, "1"},
    {360, 390, calcu_PlusFunVar, "+"},
    {0, 520, calcu_NegateVar, "+/-"},
    {120, 520, calcu_NumberZeroVar, "0"},
    {240, 520, calcu_DotVar, "."},
    {360, 520, calcu_EqualFunVar, "="},
}