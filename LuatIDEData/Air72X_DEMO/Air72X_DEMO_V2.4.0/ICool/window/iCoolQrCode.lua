---@diagnostic disable: undefined-global, lowercase-global
--QrCode界面跳转函数变量
local qrcode_JumpToCreateQrCodePageVar, qrcode_JumpToScanQrCodePageVar
--QrCode界面初始化函数变量
local qrcode_CreateQrCodePageInitVar, qrcode_ScanQrCodePageInitVar
--QrCode:CreateQrCodePage界面函数变量
local qrcode_InputDetailForCreateVar, qrcode_CreateQrCodeVar, qrcode_KeyBoardCancelVar
--QrCode界面变量
qrcode_CreateQrCodePage = nil
qrcode_ScanQrCodePage = nil

--判断当前处于哪个界面:默认为生成二维码界面
qrcode_InCreateQrCodePage = true
qrcode_InScanQrCodePage = false

--QrCode界面初始化
function QrCodeInit()
    --QrCode界面基容器
    QRCODE_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(QRCODE_BASECONT, 480, 804)
	lvgl.obj_align(QRCODE_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(QRCODE_BASECONT, lvgl.CONT_PART_MAIN, qrcode_BaseStyle)

    --Audio界面导航栏
    qrcode_NavBar = lvgl.cont_create(QRCODE_BASECONT, nil)
    lvgl.obj_set_size(qrcode_NavBar, 480, 70)
    lvgl.obj_align(qrcode_NavBar, QRCODE_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 734)
    lvgl.obj_add_style(qrcode_NavBar, lvgl.CONT_PART_MAIN, qrcode_PageStyle)

    qrcode_CreateQrCodePageBtn = lvgl.btn_create(qrcode_NavBar, nil)
    lvgl.obj_set_size(qrcode_CreateQrCodePageBtn, 150, 70)
    lvgl.obj_align(qrcode_CreateQrCodePageBtn, qrcode_NavBar, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.obj_add_style(qrcode_CreateQrCodePageBtn, lvgl.BTN_PART_MAIN, absTransStyle)

    qrcode_CreateQrCodePageBtnLabel = lvgl.label_create(qrcode_CreateQrCodePageBtn, nil)
    lvgl.label_set_text(qrcode_CreateQrCodePageBtnLabel, "二维码生成")
    lvgl.obj_add_style(qrcode_CreateQrCodePageBtnLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)

    qrcode_CreateQrCodePageInitVar()
end

--CreateQrCode界面初始化
local function qrcode_CreateQrCodePageInit()
    --清除其他界面
    if (qrcode_InScanQrCodePage)then
        lvgl.obj_del(qrcode_ScanQrCodePage)
    end

    qrcode_CreateQrCodePage = lvgl.page_create(QRCODE_BASECONT, nil)
    lvgl.obj_set_size(qrcode_CreateQrCodePage, 480, (804-lvgl.obj_get_height(qrcode_NavBar)))
    lvgl.obj_align(qrcode_CreateQrCodePage, QRCODE_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.page_set_scrollbar_mode(qrcode_CreateQrCodePage, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.obj_add_style(qrcode_CreateQrCodePage, lvgl.PAGE_PART_BG, qrcode_PageStyle)

    --二维码生成显示区
    qrcode_DisQrCodeArea = lvgl.cont_create(qrcode_CreateQrCodePage, nil)
    lvgl.obj_set_size(qrcode_DisQrCodeArea, 460, 460)
    lvgl.obj_align(qrcode_DisQrCodeArea, qrcode_CreateQrCodePage, lvgl.ALIGN_IN_TOP_MID, 0, 10)
    lvgl.obj_add_style(qrcode_DisQrCodeArea, lvgl.CONT_PART_MAIN, qrcode_DisplayAreaStyle)

    --二维码输入内容框
    qrcode_InputQrCodeDetail = lvgl.textarea_create(qrcode_CreateQrCodePage, nil)
    lvgl.obj_set_size(qrcode_InputQrCodeDetail, 460, (804-lvgl.obj_get_height(qrcode_NavBar)-lvgl.obj_get_height(qrcode_DisQrCodeArea)-150))
    lvgl.obj_align(qrcode_InputQrCodeDetail, qrcode_CreateQrCodePage, lvgl.ALIGN_IN_TOP_MID, 0, (lvgl.obj_get_height(qrcode_DisQrCodeArea)+20))
    lvgl.textarea_set_text(qrcode_InputQrCodeDetail, "")
    lvgl.textarea_set_placeholder_text(qrcode_InputQrCodeDetail, "\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t"..
                                                                                "请输入二维码内容")
    lvgl.textarea_set_cursor_hidden(qrcode_InputQrCodeDetail, true)
    lvgl.obj_add_style(qrcode_InputQrCodeDetail, lvgl.TEXTAREA_PART_BG, qrcode_DisplayAreaStyle)
    lvgl.obj_set_event_cb(qrcode_InputQrCodeDetail, qrcode_InputDetailForCreateVar)

    --生成二维码按钮
    qrcode_CreateQrCodeBtn = lvgl.btn_create(qrcode_CreateQrCodePage, nil)
    lvgl.obj_set_size(qrcode_CreateQrCodeBtn, 200, 80)
    lvgl.obj_align(qrcode_CreateQrCodeBtn, qrcode_CreateQrCodePage, lvgl.ALIGN_IN_TOP_MID, 0, 
                    (lvgl.obj_get_height(qrcode_DisQrCodeArea)+lvgl.obj_get_height(qrcode_InputQrCodeDetail)+50))
    lvgl.obj_add_style(qrcode_CreateQrCodeBtn, lvgl.BTN_PART_MAIN, qrcode_DisplayAreaStyle)
    lvgl.obj_set_event_cb(qrcode_CreateQrCodeBtn, qrcode_CreateQrCodeVar)

    qrcode_CreateQrCodeBtnLabel = lvgl.label_create(qrcode_CreateQrCodeBtn, nil)
    lvgl.obj_align(qrcode_CreateQrCodeBtnLabel, qrcode_CreateQrCodeBtn, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.label_set_text(qrcode_CreateQrCodeBtnLabel, "生成二维码")
    lvgl.obj_add_style(qrcode_CreateQrCodeBtnLabel, lvgl.LABEL_PART_MAIN, qrcode_FontStyle)

end

--键盘生成
local function qrcode_CreateKeyBoard(obj)
    qrcode_KeyBoard = lvgl.keyboard_create(qrcode_CreateQrCodePage, nil)
    lvgl.obj_set_size(qrcode_KeyBoard, 460, 350)
    lvgl.keyboard_set_cursor_manage(qrcode_KeyBoard, true)
    lvgl.obj_set_event_cb(qrcode_KeyBoard, qrcode_KeyBoardCancelVar)
    lvgl.keyboard_set_textarea(qrcode_KeyBoard, obj)
    lvgl.obj_align(qrcode_KeyBoard, qrcode_CreateQrCodePage, lvgl.ALIGN_IN_TOP_MID, 0, 10)
end

--输入二维码内容
local function qrcode_InputDetailForCreate(obj, e)
    if (e == lvgl.EVENT_CLICKED and qrcode_KeyBoard == nil)then
        qrcode_CreateKeyBoard(obj)
    end
end

--关闭键盘
local function qrcode_KeyBoardCancel(obj, e)
    lvgl.keyboard_def_event_cb(obj, e)
    if (e == lvgl.EVENT_CANCEL)then
        lvgl.keyboard_set_textarea(obj, nil)
        lvgl.obj_del(obj)
        qrcode_KeyBoard = nil
    end
end

--点击生成二维码
local function qrcode_CreateQrcode(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        lvgl.obj_clean(qrcode_DisQrCodeArea)
        qrcode_target = lvgl.img_create(qrcode_DisQrCodeArea, nil)
        lvgl.img_set_src(qrcode_target, "/lua/QrCode_1.png")
        lvgl.obj_set_size(qrcode_target, 370, 370)
        lvgl.obj_align(qrcode_target, qrcode_DisQrCodeArea, lvgl.ALIGN_CENTER, 0, 0)
            --[[
        qrcode_Canvas = lvgl.canvas_create(qrcode_DisQrCodeArea, nil)
        lvgl.canvas_set_buffer(qrcode_Canvas, 100, 100)
        lvgl.obj_align(qrcode_Canvas, qrcode_DisQrCodeArea, lvgl.ALIGN_CENTER, 0, 0)
        qrcode_DisplayLayer = lvgl.canvas_to_disp_layer(qrcode_Canvas)
        disp.setactlayer(qrcode_DisplayLayer)
        width, data = qrencode.encode('http://www.openluat.com')
        l_w, l_h = disp.getlayerinfo()
        displayWidth = 100
        disp.putqrcode(data, width, displayWidth, (l_w-displayWidth)/2, (l_h-displayWidth)/2)
        disp.update()
]]
    end
end

function QrCode_DeleteAll()
    if (qrcode_KeyBoard)then
        lvgl.obj_del(qrcode_KeyBoard)
        qrcode_KeyBoard = nil
    end
end

--QrCode界面函数变量的调用声明
--(禁止随意改动)
qrcode_JumpToCreateQrCodePageVar = qrcode_JumpToCreateQrCodePage
qrcode_JumpToScanQrCodePageVar = qrcode_JumpToScanQrCodePage
qrcode_CreateQrCodePageInitVar = qrcode_CreateQrCodePageInit
qrcode_ScanQrCodePageInitVar = qrcode_ScanQrCodePageInit
qrcode_InputDetailForCreateVar = qrcode_InputDetailForCreate
qrcode_KeyBoardCancelVar = qrcode_KeyBoardCancel
qrcode_CreateQrCodeVar = qrcode_CreateQrcode