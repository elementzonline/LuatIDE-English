---@diagnostic disable: lowercase-global, undefined-global

--获取天气信息函数变量
local weather_GetWeatherInfoVar
--自动生成未来七天信息容器函数变量
local weather_AutoCreateFuWeekContVar
--显示今天天气信息函数变量
local weather_DisplayTodayWeatherVar

--未来一周天气信息储存表
local weather_FuWeekInfoContTable
--当前存储表里的数据个数
local weather_curFuWeekInfoContTableNumber

weather_FuWeekScrollPage = nil

--[[Url的格式
"https://api.seniverse.com/v3/weather/daily.json?key=your_api_key&location=beijing&language=zh-Hans&unit=c&start=0&days=5"
]]--
--获取天气的链接
local weather_UrlHead = nil
if (_G.isInSimulator)then
    weather_UrlHead = "http://api.seniverse.com/v3/weather/daily.json?key=SZuq1xbYeyGIHVZlA"
else
    weather_UrlHead = "https://api.seniverse.com/v3/weather/daily.json?key=SZuq1xbYeyGIHVZlA"
end
--获取天气的地址
local weather_UrlLocation = "&location=shanghai"
--获取天气的参数格式设置(默认为简体中文以及摄氏度)
local weather_UrlParamSetting = "&language=zh-Hans&unit=c&start=0&days=5"

----------------------------------------------------------天气返回结果说明----------------------------------------------------------
--[[
{
"results": [{
    "location": {
    "id": "WX4FBXXFKE4F",
    "name": "北京",
    "country": "CN",
    "path": "北京,北京,中国",
    "timezone": "Asia/Shanghai",
    "timezone_offset": "+08:00"
    },
    "daily": [{                          //返回指定days天数的结果
      "date": "2015-09-20",              //日期
      "text_day": "多云",                //白天天气现象文字
      "code_day": "4",                  //白天天气现象代码
      "text_night": "晴",               //晚间天气现象文字
      "code_night": "0",                //晚间天气现象代码
      "high": "26",                     //当天最高温度
      "low": "17",                      //当天最低温度
      "precip": "0",                    //降水概率，范围0~100，单位百分比（目前仅支持国外城市）
      "wind_direction": "",             //风向文字
      "wind_direction_degree": "255",   //风向角度，范围0~360
      "wind_speed": "9.66",             //风速，单位km/h（当unit=c时）、mph（当unit=f时）
      "wind_scale": "",                 //风力等级
      "rainfall": "0.0",                //降水量，单位mm
      "humidity": "76"                  //相对湿度，0~100，单位为百分比
    }, {
    "date": "2015-09-21",
    "text_day": "晴",
    "code_day": "0",
    "text_night": "晴",
    "code_night": "0",
    "high": "27",
    "low": "17",
    "precip": "0",
    "wind_direction": "",
    "wind_direction_degree": "157",
    "wind_speed": "17.7",
    "wind_scale": "3",
    "rainfall": "0.0",
    "humidity": "76"
    }, {
      ...                               //更多返回结果
    }],
    "last_update": "2015-09-20T18:00:00+08:00" //数据更新时间（该城市的本地时间）
}]
}
]]

function iCoolWeatherInit()
    weather_FuWeekInfoContTable = {}
    weather_curFuWeekInfoContTableNumber = 0
    --天气基容器
    WEATHER_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(WEATHER_BASECONT, 480, 804)
    lvgl.obj_align(WEATHER_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)
    lvgl.obj_add_style(WEATHER_BASECONT, lvgl.CONT_PART_MAIN, weather_PageStyle)

    --天气背景图片
    weather_BgImg = lvgl.img_create(WEATHER_BASECONT, nil)
    lvgl.img_set_src(weather_BgImg, "")
    lvgl.obj_set_size(weather_BgImg, 480, 580)
    lvgl.obj_align(weather_BgImg, WEATHER_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 0)

    --显示天气信息容器(温度/地点/阴晴)
    weather_InfoCont = lvgl.cont_create(weather_BgImg, nil)
    lvgl.obj_set_size(weather_InfoCont, 420, 300)
    lvgl.obj_align(weather_InfoCont, weather_BgImg, lvgl.ALIGN_IN_TOP_MID, 0,150)
    lvgl.obj_add_style(weather_InfoCont, lvgl.CONT_PART_MAIN, weather_InfoContStyle)

    --未来一周天气容器
    weather_FuWeekWeatherCont = lvgl.cont_create(WEATHER_BASECONT, nil)
    lvgl.obj_set_size(weather_FuWeekWeatherCont, 480, (804 - lvgl.obj_get_height(weather_BgImg)))
    lvgl.obj_align(weather_FuWeekWeatherCont, WEATHER_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, lvgl.obj_get_height(weather_BgImg))
    lvgl.obj_add_style(weather_FuWeekWeatherCont, lvgl.CONT_PART_MAIN, weather_PageStyle)

    --未来一周天气滚动栏
    weather_FuWeekScrollPage = lvgl.page_create(weather_FuWeekWeatherCont, nil)
    lvgl.obj_set_size(weather_FuWeekScrollPage, 480, lvgl.obj_get_height(weather_FuWeekWeatherCont))
    lvgl.obj_align(weather_FuWeekScrollPage, nil, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.page_set_scrollbar_mode(weather_FuWeekScrollPage, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.page_scroll_hor(weather_FuWeekScrollPage, 1)
    lvgl.obj_add_style(weather_FuWeekScrollPage, lvgl.PAGE_PART_BG, weather_PageStyle)
    _G.iCool_DisableTp = true
    weather_GetWeatherInfoVar()
end

local function iCool_getWeatherInfo(result,prompt,head,body)
    print(body)
    local getTodayWeatherLocation = nil
    local getTodayWeatherDetailInfo = {}
    local weather_FuWeekInfoTable = 
    {
        {"", ""}, 
        {"", ""},
        {"", ""},
    }
    local getTodayWeatherTime = "上次更新时间: "
    local getWeatherInfo = json.decode(body)
    --地址
    getTodayWeatherLocation = getWeatherInfo["results"][1]["location"]["name"]
    --更新时间
    getTodayWeatherTime = getTodayWeatherTime..string.sub(getWeatherInfo["results"][1]["last_update"], 12, 16)
    --天气(今天)
    local a = getWeatherInfo["results"][1]["daily"][1]["date"]
    getTodayWeatherDetailInfo[1] = tostring(((tonumber(string.sub(a, 6, 6)) > 0) and 
                                    string.sub(a, 6, 7)) or string.sub(a, 7, 7)).."月"..
                                    tostring(((tonumber(string.sub(a, 9, 9)) > 0) and 
                                    string.sub(a, 9, 10)) or string.sub(a, 10, 10)).."日"
    getTodayWeatherDetailInfo[2] = getWeatherInfo["results"][1]["daily"][1]["text_day"]
    getTodayWeatherDetailInfo[3]  = getWeatherInfo["results"][1]["daily"][1]["low"]
    getTodayWeatherDetailInfo[4]  = getWeatherInfo["results"][1]["daily"][1]["high"]
    --天气(明天)
    local b = getWeatherInfo["results"][1]["daily"][2]["date"]
    getTodayWeatherDetailInfo[5] = tostring(((tonumber(string.sub(b, 6, 6)) > 0) and 
                                    string.sub(b, 6, 7)) or string.sub(b, 7, 7)).."月"..
                                    tostring(((tonumber(string.sub(b, 9, 9)) > 0) and 
                                    string.sub(b, 9, 10)) or string.sub(b, 10, 10)).."日"
    getTodayWeatherDetailInfo[6] = getWeatherInfo["results"][1]["daily"][2]["text_day"]
    getTodayWeatherDetailInfo[7]  = getWeatherInfo["results"][1]["daily"][2]["low"]
    getTodayWeatherDetailInfo[8]  = getWeatherInfo["results"][1]["daily"][2]["high"]
    --天气(后天)
    local c = getWeatherInfo["results"][1]["daily"][3]["date"]
    getTodayWeatherDetailInfo[9] = tostring(((tonumber(string.sub(c, 6, 6)) > 0) and 
                                    string.sub(c, 6, 7)) or string.sub(c, 7, 7)).."月"..
                                    tostring(((tonumber(string.sub(c, 9, 9)) > 0) and 
                                    string.sub(c, 9, 10)) or string.sub(c, 10, 10)).."日"
    getTodayWeatherDetailInfo[10] = getWeatherInfo["results"][1]["daily"][2]["text_day"]
    getTodayWeatherDetailInfo[11]  = getWeatherInfo["results"][1]["daily"][2]["low"]
    getTodayWeatherDetailInfo[12]  = getWeatherInfo["results"][1]["daily"][2]["high"]
    local getTodayWeather = tostring((getTodayWeatherDetailInfo[3] + getTodayWeatherDetailInfo[4])/2)

    --显示今天天气信息
    weather_DisplayTodayWeatherVar(getTodayWeatherLocation, getTodayWeatherDetailInfo[2], "/lua/sun.bin", getTodayWeather.."度", getTodayWeatherTime)
    --显示预测天气
    weather_FuWeekInfoTable[1][1] = getTodayWeatherDetailInfo[1]
    weather_FuWeekInfoTable[1][2] = getTodayWeatherDetailInfo[2]
    weather_FuWeekInfoTable[1][3] = getTodayWeatherDetailInfo[3].."-"..getTodayWeatherDetailInfo[4].."度"
    weather_FuWeekInfoTable[2][1] = getTodayWeatherDetailInfo[5]
    weather_FuWeekInfoTable[2][2] = getTodayWeatherDetailInfo[6]
    weather_FuWeekInfoTable[2][3] = getTodayWeatherDetailInfo[7].."-"..getTodayWeatherDetailInfo[8].."度"
    weather_FuWeekInfoTable[3][1] = getTodayWeatherDetailInfo[9]
    weather_FuWeekInfoTable[3][2] = getTodayWeatherDetailInfo[10]
    weather_FuWeekInfoTable[3][3] = getTodayWeatherDetailInfo[11].."-"..getTodayWeatherDetailInfo[12].."度"

    for i = 1, 3 do
        weather_AutoCreateFuWeekContVar()
        weather_FuWeekInfoLabel = lvgl.label_create(weather_FuWeekInfoContTable[i], nil)
        lvgl.label_set_text(weather_FuWeekInfoLabel, weather_FuWeekInfoTable[i][1].."\n\n"..weather_FuWeekInfoTable[i][2].."\n\n"..weather_FuWeekInfoTable[i][3])
        lvgl.obj_align(weather_FuWeekInfoLabel, weather_FuWeekInfoContTable[i], lvgl.ALIGN_CENTER, 0, 0)
        lvgl.obj_add_style(weather_FuWeekInfoLabel, lvgl.LABEL_PART_MAIN, weather_FuWeekInfoFontStyle)
    end
    --打开触摸屏
    _G.iCool_DisableTp = false
end

--获取今天天气信息
local function weather_GetWeatherInfo()
    local iCoolInNet = sim.getStatus()
    local netModel = net.getNetMode()
    local getTodayWeatherLocation = "北京"
    local getTodayWeatherDetailInfo = {"晴天", "26"}
    local getTodayWeatherTime = "上次更新时间: No Internet"
    local weather_FuWeekInfoTable = 
    {
        {"7月15日", "晴", "28-30度"},
        {"7月16日", "晴", "28-30度"},
        {"7月16日", "晴", "28-30度"},
    }
    if (iCoolInNet and (netModel > 0))then
        print("------------------------")
        http.request("GET", (weather_UrlHead..weather_UrlLocation..weather_UrlParamSetting),nil,nil,nil,nil,iCool_getWeatherInfo)
    else
        print("没有网络")
        --显示今天天气信息
        weather_DisplayTodayWeatherVar(getTodayWeatherLocation, getTodayWeatherDetailInfo[1], "/lua/sun.bin", getTodayWeatherDetailInfo[2].."度", getTodayWeatherTime)
        for i = 1, 3 do
            weather_AutoCreateFuWeekContVar()
            weather_FuWeekInfoLabel = lvgl.label_create(weather_FuWeekInfoContTable[i], nil)
            lvgl.label_set_text(weather_FuWeekInfoLabel, weather_FuWeekInfoTable[i][1].."\n\n"..weather_FuWeekInfoTable[i][2].."\n\n"..weather_FuWeekInfoTable[i][3])
            lvgl.obj_align(weather_FuWeekInfoLabel, weather_FuWeekInfoContTable[i], lvgl.ALIGN_CENTER, 0, 0)
            lvgl.obj_add_style(weather_FuWeekInfoLabel, lvgl.LABEL_PART_MAIN, weather_FuWeekInfoFontStyle)
        end
        --打开触摸屏
        _G.iCool_DisableTp = false
    end
end

--自动生成未来几天信息容器函数  
--默认容器的宽为140，高为200，间隔为15  
local function weather_AutoCreateFuWeekCont()
    --当前数量加1
    weather_curFuWeekInfoContTableNumber = weather_curFuWeekInfoContTableNumber + 1
    --进行容器的创建
    weather_FuWeekInfoCont = lvgl.cont_create(weather_FuWeekScrollPage, nil)
    weather_FuWeekInfoContTable[weather_curFuWeekInfoContTableNumber] = weather_FuWeekInfoCont
    lvgl.obj_set_state(weather_FuWeekInfoContTable[weather_curFuWeekInfoContTableNumber], lvgl.STATE_DISABLED)
    lvgl.obj_set_size(weather_FuWeekInfoContTable[weather_curFuWeekInfoContTableNumber], 140, 200)
    lvgl.obj_align(weather_FuWeekInfoContTable[weather_curFuWeekInfoContTableNumber], weather_FuWeekScrollPage, lvgl.ALIGN_IN_LEFT_MID, (140 * (weather_curFuWeekInfoContTableNumber - 1) + (15 * weather_curFuWeekInfoContTableNumber)), 0)
    lvgl.obj_add_style(weather_FuWeekInfoContTable[weather_curFuWeekInfoContTableNumber], lvgl.CONT_PART_MAIN, weather_FuWeekInfoContStyle)
end

--显示今天天气信息  
--@position         获取哪个地点的天气信息  
--@weather          天气信息(晴天/暴雨/等)  
--@weatherIconAddr  天气信息所对应的天气图标  
--@temperature      天气信息里的温度  
--@releaseTime      获取天气时间的最近的更新时间  
--默认天气图标大小为180 * 180  
local function weather_DisplayTodayWeather(position, weather, weatherIconAddr, temperature, releaseTime)
    --天气信息：地点
    weather_TodayPositionLabel = lvgl.label_create(weather_InfoCont, nil)
    lvgl.label_set_text(weather_TodayPositionLabel, position)
    lvgl.obj_align(weather_TodayPositionLabel, weather_InfoCont, lvgl.ALIGN_IN_TOP_MID, (lvgl.obj_get_width(weather_InfoCont) / 4), (lvgl.obj_get_height(weather_InfoCont) / 5 * 4))
    lvgl.obj_add_style(weather_TodayPositionLabel, lvgl.LABEL_PART_MAIN, weather_FuWeekInfoFontStyle)
    --天气信息：天气阴晴
    weather_TodayWeatherLabel = lvgl.label_create(weather_InfoCont, nil)
    lvgl.label_set_text(weather_TodayWeatherLabel, weather)
    lvgl.obj_align(weather_TodayWeatherLabel, weather_InfoCont, lvgl.ALIGN_IN_TOP_MID, (lvgl.obj_get_width(weather_InfoCont) * (-1) / 4), (lvgl.obj_get_height(weather_InfoCont) / 5 * 4))
    lvgl.obj_add_style(weather_TodayWeatherLabel, lvgl.LABEL_PART_MAIN, weather_FuWeekInfoFontStyle)
    --天气信息：背景
    weather_TodayWeatherImg = lvgl.img_create(weather_InfoCont, nil)
    lvgl.img_set_src(weather_TodayWeatherImg, weatherIconAddr)
    lvgl.obj_align(weather_TodayWeatherImg, weather_InfoCont, lvgl.ALIGN_IN_TOP_MID, (lvgl.obj_get_width(weather_InfoCont) * (-1) / 4), (lvgl.obj_get_height(weather_InfoCont) / 7))
    --天气信息：温度
    weather_TodayTemperatureLabel = lvgl.label_create(weather_InfoCont, nil)
    lvgl.label_set_text(weather_TodayTemperatureLabel, temperature)
    lvgl.obj_align(weather_TodayTemperatureLabel, weather_InfoCont, lvgl.ALIGN_IN_TOP_MID, (lvgl.obj_get_width(weather_InfoCont) / 4), (lvgl.obj_get_height(weather_InfoCont) / 5 * 2))
    lvgl.obj_add_style(weather_TodayTemperatureLabel, lvgl.LABEL_PART_MAIN, weather_FuWeekInfoFontStyle)
    --天气信息：更新时间
    weather_TodayReleaseTimeLabel = lvgl.label_create(weather_BgImg, nil)
    lvgl.label_set_text(weather_TodayReleaseTimeLabel, releaseTime)
    lvgl.obj_align(weather_TodayReleaseTimeLabel, weather_BgImg, lvgl.ALIGN_IN_BOTTOM_MID, 0, 0)
    lvgl.obj_add_style(weather_TodayReleaseTimeLabel, lvgl.LABEL_PART_MAIN, weather_FuWeekInfoFontStyle)
end

weather_GetWeatherInfoVar = weather_GetWeatherInfo
weather_AutoCreateFuWeekContVar = weather_AutoCreateFuWeekCont
weather_DisplayTodayWeatherVar = weather_DisplayTodayWeather