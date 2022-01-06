---@diagnostic disable: undefined-global, lowercase-global



function CalendarInit()
    --Calendar界面基容器
    CALENDAR_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(CALENDAR_BASECONT, 480, 804)
	lvgl.obj_align(CALENDAR_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)

    calendar_MainScreen = lvgl.calendar_create(CALENDAR_BASECONT, nil)
    lvgl.obj_set_size(calendar_MainScreen, 400, 350)
	lvgl.obj_align(calendar_MainScreen, CALENDAR_BASECONT, lvgl.ALIGN_CENTER, 0, 0)
end