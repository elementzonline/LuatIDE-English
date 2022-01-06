---@diagnostic disable: lowercase-global, undefined-global

multi_WidgetsBase = nil
wid_TableView = nil
wid_Tab1_btnLabel = nil
wid_Tab1_keyBoard = nil
wid_firstTab = nil
Tab1_cont = nil
Tab1_cont2 = nil
Tab1_cont3 = nil
wid_Tab1_btn1 = nil
wid_Tab1_btn3 = nil
wid_Tab1_ck = nil
wid_Tab1_TextArea = nil
wid_Tab1_TextArea_2 = nil
chart = nil
lmeter = nil
gauge1 = nil
arc = nil
wid_calendar = nil
wid_roller1 = nil
wid_dropDown = nil
wid_dropDown2 = nil
wid_Tab1_slider = nil

--总的Label表
labelTable = {}

--动画说明显示Label
lmeterAnimLabel = nil
gaugeAnimLabel = nil
arcAnimLabel = nil

--控件说明显示Label
Tab1_cont_label = nil
Tab1_cont_label_1 = nil

wid_Tab1_kb_isDisplay = false
bool_Bg_Color_isWhite = true

wid_Tab1_btnLabel_txt = 0

widgets_White = lvgl.color_make(192, 192, 192)
widgets_Black = lvgl.color_make(88,98,115)

widgets_TabColor_white = lvgl.color_make(169,169,169)
widgets_TabColor_black = lvgl.color_make(68,75,90)

black = lvgl.color_make(0, 0, 0)
blue = lvgl.color_make(0, 0, 255)
red = lvgl.color_make(255, 0, 0)

--控件填充颜色
mulWid_PaddingColor = lvgl.color_make(1, 162, 177)

--设置Widgets基础样式
widgets_BaseStyle_white = lvgl.style_t()
widgets_BaseStyle_black = lvgl.style_t()
--设置TabView的样式(白天/黑夜)
widgets_TabStyle_white = lvgl.style_t()
widgets_TabStyle_black = lvgl.style_t()

local function widgetsHandle_Roller1(b, e)
	if (e == lvgl.EVENT_VALUE_CHANGED)then
		lvgl.roller_get_selected_str(b)
	end
end

local function widgetsHandle_Calender(b, e)
	if(e == lvgl.EVENT_VALUE_CHANGED)then
		local date = lvgl.calendar_get_pressed_date(b)
		if(date)then
			log.info("This is "..date.year.."."..date.month.."."..date.day)
		end
	end
end

--更改主题颜色(黑夜/白天)
local function widgetsHandle_switch(b, e)
	--改变背景颜色
	if (e == lvgl.EVENT_VALUE_CHANGED) then
		if (_G.bool_Bg_Color_isWhite) then
			_G.bool_Bg_Color_isWhite = false

			--TabView的背景颜色(黑夜)
			lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_BG, widgets_TabStyle_black)
			--Tab标签栏颜色(黑夜)
			lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_TAB_BG, widgets_BaseStyle_black)
			lvgl.obj_add_style(Tab1_cont, lvgl.CONT_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(Tab1_cont2, lvgl.CONT_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(wid_Tab1_btn1, lvgl.BTN_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(chart, lvgl.CHART_PART_BG, widgets_BaseStyle_black)
			lvgl.obj_add_style(lmeter, lvgl.LINEMETER_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(gauge1, lvgl.GAUGE_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(arc, lvgl.ARC_PART_BG, widgets_BaseStyle_black)
			lvgl.obj_add_style(Tab1_cont3, lvgl.CONT_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(wid_calendar, lvgl.CALENDAR_PART_BG, widgets_BaseStyle_black)
			lvgl.obj_add_style(wid_roller1, lvgl.ROLLER_PART_BG, widgets_BaseStyle_black)
			lvgl.obj_add_style(wid_dropDown2, lvgl.DROPDOWN_PART_MAIN, widgets_BaseStyle_black)
			lvgl.obj_add_style(wid_dropDown2, lvgl.DROPDOWN_PART_LIST, widgets_BaseStyle_black)
			--设置主题字体样式(白)
			lvgl.obj_add_style(Tab1_cont_label_1, lvgl.LABEL_PART_MAIN, fontStyle_White)
			lvgl.obj_add_style(wid_Tab1_ck, lvgl.CHECKBOX_PART_BG, fontStyle_White)
			for k, v in pairs(labelTable) do
				lvgl.obj_add_style(v, lvgl.LABEL_PART_MAIN, fontStyle_White)
			end
		else
			_G.bool_Bg_Color_isWhite = true

			--TabView的整体背景颜色(白天)
			lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_BG, widgets_TabStyle_white)
			--Tab标签栏颜色(白天)
			lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_TAB_BG, widgets_BaseStyle_white)
			lvgl.obj_add_style(Tab1_cont, lvgl.CONT_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(Tab1_cont2, lvgl.CONT_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(wid_Tab1_btn1, lvgl.BTN_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(chart, lvgl.CHART_PART_BG, widgets_BaseStyle_white)
			lvgl.obj_add_style(lmeter, lvgl.LINEMETER_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(gauge1, lvgl.GAUGE_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(arc, lvgl.ARC_PART_BG, widgets_BaseStyle_white)
			lvgl.obj_add_style(Tab1_cont3, lvgl.CONT_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(wid_calendar, lvgl.CALENDAR_PART_BG, widgets_BaseStyle_white)
			lvgl.obj_add_style(wid_roller1, lvgl.ROLLER_PART_BG, widgets_BaseStyle_white)
			lvgl.obj_add_style(wid_dropDown2, lvgl.DROPDOWN_PART_MAIN, widgets_BaseStyle_white)
			lvgl.obj_add_style(wid_dropDown2, lvgl.DROPDOWN_PART_LIST, widgets_BaseStyle_white)
			--设置主题字体样式(黑)
			lvgl.obj_add_style(Tab1_cont_label_1, lvgl.LABEL_PART_MAIN, fontStyle_Black)
			lvgl.obj_add_style(wid_Tab1_ck, lvgl.CHECKBOX_PART_BG, fontStyle_Black)
			for k, v in pairs(labelTable) do
				lvgl.obj_add_style(v, lvgl.LABEL_PART_MAIN, fontStyle_Black)
			end
		end
	end
end

local function widgetsHandle_Tab1_slider(b, e)
	if (e == lvgl.EVENT_VALUE_CHANGED)then
    lvgl.label_set_text(Tab1_cont_label_1, lvgl.slider_get_value(b))
	end
end

--LineMeter动画处理函数
local function lmeterAnimHandle(lmeter, value)
	lvgl.linemeter_set_value(lmeter, value)
	
	lvgl.label_set_text(lmeterAnimLabel, value)
end

--Gauge动画处理函数
local function gaugeAnimHandle(gauge, value)
	lvgl.gauge_set_value(gauge, 0, value)
	lvgl.label_set_text(gaugeAnimLabel, value)
end

--Arc动画处理函数
local function arcAnimHandle(arc, value)
	lvgl.arc_set_value(arc, value)
	lvgl.label_set_text(arcAnimLabel, value)
end

--Bar动画处理函数
local function barAnimHandle(bar, value)
	lvgl.bar_set_value(bar, value, lvgl.ANIM_ON)
end

--键盘的取消键删除键盘
local function widgetsHandle_KeyBoard(kb, e)
	lvgl.keyboard_def_event_cb(wid_Tab1_keyBoard, e)
	if (e == lvgl.EVENT_CANCEL)then
		lvgl.obj_del(wid_Tab1_keyBoard)
		wid_Tab1_keyBoard = nil
	end
end

--为输入框添加键盘
local function createKeyBoard(ta)
	wid_Tab1_keyBoard = lvgl.keyboard_create(Tab1_cont2, nil)
	lvgl.obj_set_height(wid_Tab1_keyBoard, 120)
	lvgl.keyboard_set_cursor_manage(wid_Tab1_keyBoard, true)
	--为键盘指定输出口:输入框
    lvgl.keyboard_set_textarea(wid_Tab1_keyBoard, ta)
    lvgl.obj_set_event_cb(wid_Tab1_keyBoard, widgetsHandle_KeyBoard)
end

--输入框的响应函数
local function widgetsHandle_TextArea(ta, e)
	if (e == lvgl.EVENT_CLICKED)then
		--判断键盘是否存在
		if (not wid_Tab1_keyBoard)then
			createKeyBoard(ta)
		else
			lvgl.obj_del(wid_Tab1_keyBoard)
			wid_Tab1_keyBoard = nil
			createKeyBoard(ta)
		end
	end
end

function Multi_WidgetsInit()
	
	bool_Bg_Color_isWhite = true

	--设置Widgets基础样式(白天)
	lvgl.style_init(widgets_BaseStyle_white)
    lvgl.style_set_bg_color(widgets_BaseStyle_white, lvgl.STATE_DEFAULT, widgets_White)
	lvgl.style_set_text_color(widgets_BaseStyle_white, lvgl.STATE_DEFAULT, lvgl.color_hex(0x000000))

	--设置Widgets基础样式(黑夜)
	lvgl.style_init(widgets_BaseStyle_black)
    lvgl.style_set_bg_color(widgets_BaseStyle_black, lvgl.STATE_DEFAULT, widgets_Black)
	lvgl.style_set_text_color(widgets_BaseStyle_black, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

	--设置TabView的样式(白天)
	lvgl.style_init(widgets_TabStyle_white)
	lvgl.style_set_bg_color(widgets_TabStyle_white, lvgl.STATE_DEFAULT, widgets_TabColor_white)

	--设置TabView的样式(黑夜)
	lvgl.style_init(widgets_TabStyle_black)
	lvgl.style_set_bg_color(widgets_TabStyle_black, lvgl.STATE_DEFAULT, widgets_TabColor_black)

	--控件填充样式
	mulWid_PaddingStyle = lvgl.style_t()
	lvgl.style_init(mulWid_PaddingStyle)
	lvgl.style_set_bg_color(mulWid_PaddingStyle, lvgl.STATE_DEFAULT, mulWid_PaddingColor)
	
	--字体样式(黑/白)
	fontStyle_Black = lvgl.style_t()
	lvgl.style_init(fontStyle_Black)
	lvgl.style_set_text_color(fontStyle_Black, lvgl.STATE_DEFAULT, lvgl.color_hex(0x000000))
	fontStyle_White = lvgl.style_t()
	lvgl.style_init(fontStyle_White)
	lvgl.style_set_text_color(fontStyle_White, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
	-----------------------------------------------------------------------------------
	--多控件界面基容器
	multi_WidgetsBase = lvgl.cont_create(lvgl.scr_act(), nil)
	lvgl.obj_set_size(multi_WidgetsBase, 480, 804)
	lvgl.obj_align(multi_WidgetsBase, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
	lvgl.obj_add_style(multi_WidgetsBase, lvgl.CONT_PART_MAIN, absTransStyle)
    lvgl.obj_set_state(multi_WidgetsBase, lvgl.STATE_DISABLED)

	--TableView
	wid_TableView = lvgl.tabview_create(multi_WidgetsBase, nil)
	lvgl.obj_set_size(wid_TableView, 480, 804)
	lvgl.obj_align(wid_TableView, multi_WidgetsBase, lvgl.ALIGN_IN_TOP_MID, 0, 0)
	lvgl.obj_set_style_local_pad_left(wid_TableView, lvgl.TABVIEW_PART_TAB_BG, lvgl.STATE_DEFAULT, 240)
    lvgl.tabview_set_anim_time(wid_TableView, 100)

	--TabView的整体背景颜色
	lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_BG, widgets_TabStyle_white)
	--Tab标签栏颜色
	lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_TAB_BG, widgets_BaseStyle_white)
	--Tab按钮的下方滑块颜色
	lvgl.obj_add_style(wid_TableView, lvgl.TABVIEW_PART_INDIC, mulWid_PaddingStyle)
	
	--在TableView中创建3个页面
	wid_firstTab = lvgl.tabview_add_tab(wid_TableView, "Control")
	wid_secondTab = lvgl.tabview_add_tab(wid_TableView, "Visuals")
	wid_ThirdTab = lvgl.tabview_add_tab(wid_TableView, "Selector")
    lvgl.page_set_scrollbar_mode(wid_firstTab, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.page_set_scrollbar_mode(wid_secondTab, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.page_set_scrollbar_mode(wid_ThirdTab, lvgl.SCROLLBAR_MODE_OFF)
	
	--switch
	wid_sw = lvgl.switch_create(multi_WidgetsBase, nil)
	lvgl.obj_set_size(wid_sw, 80, 50)
	lvgl.obj_align(wid_sw, multi_WidgetsBase, lvgl.ALIGN_IN_TOP_LEFT, 10, 2)
	lvgl.obj_add_style(wid_sw, lvgl.SWITCH_PART_INDIC, mulWid_PaddingStyle)
	lvgl.obj_set_event_cb(wid_sw, widgetsHandle_switch)
	Tab1_cont_label = lvgl.label_create(multi_WidgetsBase, nil)
	labelTable[1] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Dark")
	lvgl.obj_align(Tab1_cont_label, multi_WidgetsBase, lvgl.ALIGN_IN_TOP_LEFT, 100, 15)

--[[
-----------创建第一个页面-----------
]]

	--添加Basic框
	Tab1_cont = lvgl.cont_create(wid_firstTab, nil)
	lvgl.obj_set_size(Tab1_cont, 470, 300)
	lvgl.obj_align(Tab1_cont, wid_firstTab, lvgl.ALIGN_IN_TOP_MID, 0, 45)
    lvgl.obj_set_state(Tab1_cont, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(Tab1_cont, lvgl.CONT_PART_MAIN, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_firstTab, nil)
	labelTable[2] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, Tab1_cont, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)
	lvgl.label_set_text(Tab1_cont_label, "Basic")
	
	--添加按钮1
	wid_Tab1_btn1 = lvgl.btn_create(Tab1_cont, nil)
	lvgl.obj_set_size(wid_Tab1_btn1, 120, 60)
	lvgl.obj_align(wid_Tab1_btn1, Tab1_cont, lvgl.ALIGN_IN_TOP_LEFT, 65, 20)
	lvgl.obj_add_style(wid_Tab1_btn1, lvgl.BTN_PART_MAIN, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_Tab1_btn1, nil)
	labelTable[3] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, wid_Tab1_btn1, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.label_set_text(Tab1_cont_label, "BUTTON-1")
	
	--添加按钮2
	wid_Tab1_btn2 = lvgl.btn_create(Tab1_cont, nil)
	lvgl.obj_set_size(wid_Tab1_btn2, 120, 60)
	lvgl.obj_align(wid_Tab1_btn2, Tab1_cont, lvgl.ALIGN_IN_TOP_RIGHT, -65, 20)
	lvgl.obj_add_style(wid_Tab1_btn2, lvgl.BTN_PART_MAIN, mulWid_PaddingStyle)

	Tab1_cont_label = lvgl.label_create(wid_Tab1_btn2, nil)
	labelTable[4] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, wid_Tab1_btn2, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.label_set_text(Tab1_cont_label, "BUTTON-2")

	--添加Switch
	wid_Tab1_sw1 = lvgl.switch_create(Tab1_cont, nil)
	lvgl.obj_align(wid_Tab1_sw1, Tab1_cont, lvgl.ALIGN_IN_TOP_LEFT, 90, 115)

	--添加CheckBox
	wid_Tab1_ck = lvgl.checkbox_create(Tab1_cont, nil)
	lvgl.obj_align(wid_Tab1_ck, Tab1_cont, lvgl.ALIGN_IN_TOP_RIGHT, -70, 115)

	--添加Slider
	wid_Tab1_slider = lvgl.slider_create(Tab1_cont, nil)
	lvgl.obj_set_size(wid_Tab1_slider, 300, 10)
	lvgl.slider_set_range(wid_Tab1_slider, 0, 100)
	lvgl.obj_align(wid_Tab1_slider, Tab1_cont, lvgl.ALIGN_CENTER, 0, 30)
	Tab1_cont_label_1 = lvgl.label_create(Tab1_cont, nil)
	lvgl.label_set_text(Tab1_cont_label_1, "0")
	lvgl.obj_align(Tab1_cont_label_1, wid_Tab1_slider, lvgl.ALIGN_OUT_TOP_MID, 0, 30)
	lvgl.obj_set_event_cb(wid_Tab1_slider, widgetsHandle_Tab1_slider)
	
	--添加Text input框
	Tab1_cont2 = lvgl.cont_create(wid_firstTab, nil)
	lvgl.obj_set_size(Tab1_cont2, 470, 350)
	lvgl.obj_align(Tab1_cont2, wid_firstTab, lvgl.ALIGN_IN_TOP_MID, 0, 390)
    lvgl.obj_set_state(Tab1_cont2, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(Tab1_cont2, lvgl.CONT_PART_MAIN, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_firstTab, nil)
	labelTable[5] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, Tab1_cont2, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)
	lvgl.label_set_text(Tab1_cont_label, "Text Input")

	--Email输入框
	wid_Tab1_TextArea = lvgl.textarea_create(Tab1_cont2, nil)
	lvgl.textarea_set_one_line(wid_Tab1_TextArea, true)
	lvgl.obj_align(wid_Tab1_TextArea, Tab1_cont2, lvgl.ALIGN_IN_TOP_MID, 0, 50)
	lvgl.textarea_set_text(wid_Tab1_TextArea, "")
	lvgl.textarea_set_placeholder_text(wid_Tab1_TextArea, "Email")
    lvgl.obj_set_event_cb(wid_Tab1_TextArea, widgetsHandle_TextArea)

	--Email输入框说明
	Tab1_cont_label = lvgl.label_create(wid_firstTab, nil)
	labelTable[6] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, wid_Tab1_TextArea, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)
	lvgl.label_set_text(Tab1_cont_label, "Email")

	--Password输入框
	wid_Tab1_TextArea_2 = lvgl.textarea_create(Tab1_cont2, nil)
	lvgl.textarea_set_one_line(wid_Tab1_TextArea_2, true)
	lvgl.obj_align(wid_Tab1_TextArea_2, Tab1_cont2, lvgl.ALIGN_IN_TOP_MID, 0, 150)
	lvgl.textarea_set_text(wid_Tab1_TextArea_2, "")
	lvgl.textarea_set_placeholder_text(wid_Tab1_TextArea_2, "Password")
	lvgl.textarea_set_pwd_mode(wid_Tab1_TextArea_2, true)
    lvgl.obj_set_event_cb(wid_Tab1_TextArea_2, widgetsHandle_TextArea)

	--Password输入框说明
	Tab1_cont_label = lvgl.label_create(wid_firstTab, nil)
	labelTable[7] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, wid_Tab1_TextArea_2, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)
	lvgl.label_set_text(Tab1_cont_label, "Password")

	--添加登录按钮
	wid_Tab1_btn3 = lvgl.btn_create(Tab1_cont2, nil)
	lvgl.obj_set_size(wid_Tab1_btn3, 120, 60)
	lvgl.obj_align(wid_Tab1_btn3, Tab1_cont2, lvgl.ALIGN_IN_TOP_MID, 0, 250)
	lvgl.obj_add_style(wid_Tab1_btn3, lvgl.BTN_PART_MAIN, mulWid_PaddingStyle)

	Tab1_cont_label = lvgl.label_create(wid_Tab1_btn3, nil)
	labelTable[8] = Tab1_cont_label
	lvgl.obj_align(Tab1_cont_label, wid_Tab1_btn3, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.label_set_text(Tab1_cont_label, "Log In")


--[[
-----------创建第二个页面-----------
]]

	--添加Line Chart
	chart = lvgl.chart_create(wid_secondTab, nil)
	lvgl.obj_set_size(chart, 450, 250)
	lvgl.obj_align(chart, wid_secondTab, lvgl.ALIGN_IN_TOP_MID, 0, 30)
    lvgl.chart_set_type(chart, lvgl.CHART_TYPE_LINE)
    lvgl.obj_set_state(chart, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(chart, lvgl.CHART_PART_BG, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_secondTab, nil)
	labelTable[9] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Line Chart")
	lvgl.obj_align(Tab1_cont_label, chart, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)
	
    s1 = lvgl.chart_add_series(chart, blue)
    s2 = lvgl.chart_add_series(chart, red)

    lvgl.chart_set_next(chart, s1, 10)
    lvgl.chart_set_next(chart, s1, 90)
    lvgl.chart_set_next(chart, s1, 30)
    lvgl.chart_set_next(chart, s1, 60)
    lvgl.chart_set_next(chart, s1, 10)
    lvgl.chart_set_next(chart, s1, 90)
    lvgl.chart_set_next(chart, s1, 30)
    lvgl.chart_set_next(chart, s1, 60)
    lvgl.chart_set_next(chart, s1, 10)
    lvgl.chart_set_next(chart, s1, 90)

    lvgl.chart_set_next(chart, s2, 32)
    lvgl.chart_set_next(chart, s2, 66)
    lvgl.chart_set_next(chart, s2, 5)
    lvgl.chart_set_next(chart, s2, 47)
    lvgl.chart_set_next(chart, s2, 32)
    lvgl.chart_set_next(chart, s2, 32)
    lvgl.chart_set_next(chart, s2, 66)
    lvgl.chart_set_next(chart, s2, 5)
    lvgl.chart_set_next(chart, s2, 47)
    lvgl.chart_set_next(chart, s2, 66)
    lvgl.chart_set_next(chart, s2, 5)
    lvgl.chart_set_next(chart, s2, 47)

	--添加Line meter
	lmeter = lvgl.linemeter_create(wid_secondTab, nil)
    lvgl.linemeter_set_range(lmeter, 0, 100)
    lvgl.linemeter_set_value(lmeter, 80)
    lvgl.linemeter_set_scale(lmeter, 240, 21)
    lvgl.obj_set_size(lmeter, 200, 200)
    lvgl.obj_align(lmeter, chart, lvgl.ALIGN_OUT_BOTTOM_LEFT, 20, 40)
    lvgl.obj_set_state(lmeter, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(lmeter, lvgl.LINEMETER_PART_MAIN, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_secondTab, nil)
	labelTable[10] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Line meter")
	lvgl.obj_align(Tab1_cont_label, lmeter, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)

	--为LineMeter动画添加动画说明显示
	lmeterAnimLabel = lvgl.label_create(lmeter, nil)
	lvgl.obj_align(lmeterAnimLabel, lmeter, lvgl.ALIGN_CENTER, 10, 0)
	lvgl.label_set_text(lmeterAnimLabel, "")

	--为lmeter添加动画
	lmeter_Anim = lvgl.anim_t()
	lvgl.anim_init(lmeter_Anim)
    lvgl.anim_set_var(lmeter_Anim, lmeter)
	lvgl.anim_set_exec_cb(lmeter_Anim, lmeter, lmeterAnimHandle)
	lvgl.anim_set_path(lmeter_Anim, 0)
    lvgl.anim_set_values(lmeter_Anim, 0, 100)
    lvgl.anim_set_time(lmeter_Anim, 4000)
    lvgl.anim_set_playback_time(lmeter_Anim, 1000)
    lvgl.anim_set_repeat_count(lmeter_Anim, lvgl.ANIM_REPEAT_INFINITE)
    lvgl.anim_start(lmeter_Anim)

	--添加Gauge
	gauge1 = lvgl.gauge_create(wid_secondTab, nil)
	lvgl.gauge_set_needle_count(gauge1, 1, black)
	lvgl.obj_set_size(gauge1, 200, 200)
	lvgl.obj_align(gauge1, chart, lvgl.ALIGN_OUT_BOTTOM_RIGHT, -20, 40)
    lvgl.obj_set_state(gauge1, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(gauge1, lvgl.GAUGE_PART_MAIN, widgets_BaseStyle_white)
	lvgl.gauge_set_value(gauge1, 0, 0)

	Tab1_cont_label = lvgl.label_create(wid_secondTab, nil)
	labelTable[11] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Gauge")
	lvgl.obj_align(Tab1_cont_label, gauge1, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)

	--为gauge动画添加动画说明显示
	gaugeAnimLabel = lvgl.label_create(gauge1, nil)
	lvgl.obj_align(gaugeAnimLabel, gauge1, lvgl.ALIGN_CENTER, 10, 70)
	lvgl.label_set_text(gaugeAnimLabel, "")

	--为Gauge添加动画
	gauge_Anim = lvgl.anim_t()
	lvgl.anim_init(gauge_Anim)
	lvgl.anim_set_var(gauge_Anim, gauge1)
	lvgl.anim_set_exec_cb(gauge_Anim, gauge1, gaugeAnimHandle)
	lvgl.anim_set_path(gauge_Anim, 0)
	lvgl.anim_set_values(gauge_Anim, 0, 100)
	lvgl.anim_set_time(gauge_Anim, 4000)
	lvgl.anim_set_playback_time(gauge_Anim, 1000)
	lvgl.anim_set_repeat_count(gauge_Anim, lvgl.ANIM_REPEAT_INFINITE)
	lvgl.anim_start(gauge_Anim)

	--添加Arc
	arc = lvgl.arc_create(wid_secondTab, nil)
	lvgl.arc_set_end_angle(arc, 200)
	lvgl.obj_set_size(arc, 150, 150)
	lvgl.obj_align(arc, lmeter, lvgl.ALIGN_OUT_BOTTOM_LEFT, 20, 40)
    lvgl.obj_set_state(arc, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(arc, lvgl.ARC_PART_BG, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_secondTab, nil)
	labelTable[12] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Arc")
	lvgl.obj_align(Tab1_cont_label, arc, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)

	--为Arc动画添加动画说明显示
	arcAnimLabel = lvgl.label_create(arc, nil)
	lvgl.obj_align(arcAnimLabel, arc, lvgl.ALIGN_CENTER, 10, 0)
	lvgl.label_set_text(arcAnimLabel, "")

	--为Arc添加动画
	arc_Anim = lvgl.anim_t()
	lvgl.anim_init(arc_Anim)
	lvgl.anim_set_var(arc_Anim, arc)
	lvgl.anim_set_exec_cb(arc_Anim, arc, arcAnimHandle)
	lvgl.anim_set_path(arc_Anim, 0)
	lvgl.anim_set_values(arc_Anim, 0, 100)
	lvgl.anim_set_time(arc_Anim, 4000)
	lvgl.anim_set_playback_time(arc_Anim, 1000)
	lvgl.anim_set_repeat_count(arc_Anim, lvgl.ANIM_REPEAT_INFINITE)
	lvgl.anim_start(arc_Anim)
	
	--添加LEDs
	Tab1_cont3 = lvgl.cont_create(wid_secondTab, nil)
	lvgl.obj_set_size(Tab1_cont3, 200, 100)
	lvgl.obj_align(Tab1_cont3, gauge1, lvgl.ALIGN_OUT_BOTTOM_RIGHT, 0, 65)
    lvgl.obj_set_state(Tab1_cont3, lvgl.STATE_DISABLED)
	--添加主题样式
	lvgl.obj_add_style(Tab1_cont3, lvgl.CONT_PART_MAIN, widgets_BaseStyle_white)
	Tab1_cont_label = lvgl.label_create(wid_secondTab, nil)
	labelTable[13] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "LEDs")
	lvgl.obj_align(Tab1_cont_label, Tab1_cont3, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)

	led1  = lvgl.led_create(Tab1_cont3, nil)
    lvgl.obj_align(led1, Tab1_cont3, lvgl.ALIGN_CENTER, -60, 0)
    lvgl.led_off(led1)

	led2  = lvgl.led_create(Tab1_cont3, nil)
    lvgl.obj_align(led2, Tab1_cont3, lvgl.ALIGN_CENTER, 0, 0)
	lvgl.led_set_bright(led2, 190)

	led3  = lvgl.led_create(Tab1_cont3, nil)
    lvgl.obj_align(led3, Tab1_cont3, lvgl.ALIGN_CENTER, 60, 0)
    lvgl.led_on(led3)

	--添加Bar
	bar1 = lvgl.bar_create(wid_secondTab, nil)
    lvgl.obj_set_size(bar1, 350, 20)
	lvgl.obj_align(bar1, arc, lvgl.ALIGN_OUT_BOTTOM_LEFT, 20, 40)
	Tab1_cont_label = lvgl.label_create(wid_secondTab, nil)
	labelTable[14] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Bar")
	lvgl.obj_align(Tab1_cont_label, bar1, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)
    lvgl.obj_set_state(Tab1_cont_label, lvgl.STATE_DISABLED)

	--为Bar添加动画
	bar_Anim = lvgl.anim_t()
	lvgl.anim_init(bar_Anim)
	lvgl.anim_set_var(bar_Anim, bar1)
	lvgl.anim_set_exec_cb(bar_Anim, bar1, barAnimHandle)
	lvgl.anim_set_path(bar_Anim, 0)
	lvgl.anim_set_values(bar_Anim, 0, 100)
	lvgl.anim_set_time(bar_Anim, 4000)
	lvgl.anim_set_playback_time(bar_Anim, 1000)
	lvgl.anim_set_repeat_count(bar_Anim, lvgl.ANIM_REPEAT_INFINITE)
	lvgl.anim_start(bar_Anim)

--[[
-----------创建第三个页面-----------
]]

	--添加日历
	wid_calendar = lvgl.calendar_create(wid_ThirdTab, nil)
    lvgl.obj_set_size(wid_calendar, 450, 350)
	lvgl.obj_align(wid_calendar, wid_ThirdTab, lvgl.ALIGN_IN_TOP_MID, 0, 30)
    lvgl.obj_set_event_cb(wid_calendar, widgetsHandle_Calender)
	--添加主题样式
	lvgl.obj_add_style(wid_calendar, lvgl.CALENDAR_PART_BG, widgets_BaseStyle_white)

	today = lvgl.calendar_date_t()
    today.year = 2021
    today.month = 6
    today.day = 16
    lvgl.calendar_set_today_date(wid_calendar, today)
    lvgl.calendar_set_showed_date(wid_calendar, today)

	highlightDate = lvgl.calendar_date_t()
	
    highlightDate.year = 2021
    highlightDate.month = 6
    highlightDate.day = 28

	lvgl.calendar_set_highlighted_dates(wid_calendar, highlightDate, 1)
	
	--添加Roller
	wid_roller1 = lvgl.roller_create(wid_ThirdTab, nil)
    lvgl.roller_set_options(wid_roller1, "SpiderMan\nWolverine\nIronMan\nCaptain America\nHulk\nDeadpool\nThor Odinson\nHawkeye", lvgl.ROLLER_MODE_INFINITE)

    lvgl.roller_set_visible_row_count(wid_roller1, 4)
    lvgl.obj_align(wid_roller1, wid_calendar, lvgl.ALIGN_OUT_BOTTOM_LEFT, 20, 40)
    lvgl.obj_set_state(wid_roller1, lvgl.STATE_DISABLED)
    lvgl.obj_set_event_cb(wid_roller1, widgetsHandle_Roller1)
	--添加主题样式
	lvgl.obj_add_style(wid_roller1, lvgl.ROLLER_PART_BG, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_ThirdTab, nil)
	labelTable[15] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Roller")
	lvgl.obj_align(Tab1_cont_label, wid_roller1, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)

	wid_dropDown2 = lvgl.dropdown_create(wid_ThirdTab, nil)
	lvgl.obj_align(wid_dropDown2, wid_calendar, lvgl.ALIGN_OUT_BOTTOM_RIGHT, -20, 40)
    lvgl.dropdown_set_options(wid_dropDown2, "SpiderMan\nWolverine\nIronMan\nCaptain America")
	lvgl.dropdown_set_dir(wid_dropDown2, lvgl.DROPDOWN_DIR_DOWN)
	--添加主题样式
	lvgl.obj_add_style(wid_dropDown2, lvgl.DROPDOWN_PART_MAIN, widgets_BaseStyle_white)
	lvgl.obj_add_style(wid_dropDown2, lvgl.DROPDOWN_PART_LIST, widgets_BaseStyle_white)

	Tab1_cont_label = lvgl.label_create(wid_ThirdTab, nil)
	labelTable[16] = Tab1_cont_label
	lvgl.label_set_text(Tab1_cont_label, "Dropdown")
	lvgl.obj_align(Tab1_cont_label, wid_dropDown2, lvgl.ALIGN_OUT_TOP_LEFT, 0, -10)

end

function Multi_DeleteAll()
	if (wid_Tab1_keyBoard)then
		lvgl.obj_del(wid_Tab1_keyBoard)
		wid_Tab1_keyBoard = nil
	end
end