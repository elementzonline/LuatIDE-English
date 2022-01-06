---@diagnostic disable: lowercase-global, undefined-global

--完全透明样式:背景和边框透明
absTransStyle = lvgl.style_t()
lvgl.style_init(absTransStyle)
lvgl.style_set_bg_opa(absTransStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_border_opa(absTransStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--部分透明样式:边框透明
borderTransStyle = lvgl.style_t()
lvgl.style_init(borderTransStyle)
lvgl.style_set_border_opa(borderTransStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--部分透明样式:背景透明
bgTransStyle = lvgl.style_t()
lvgl.style_init(bgTransStyle)
lvgl.style_set_bg_opa(bgTransStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--字体默认颜色样式(黑色)
defaultFontStyle_Black = lvgl.style_t()
lvgl.style_init(defaultFontStyle_Black)
lvgl.style_set_text_color(defaultFontStyle_Black, lvgl.STATE_DEFAULT, lvgl.color_hex(0x1C1C1C))

--字体默认颜色样式(白色)
defaultFontStyle_White = lvgl.style_t()
lvgl.style_init(defaultFontStyle_White)
lvgl.style_set_text_color(defaultFontStyle_White, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

--被选中的字体颜色样式(蓝色)
selectedFontStyle = lvgl.style_t()
lvgl.style_init(selectedFontStyle)
lvgl.style_set_text_color(selectedFontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x1E90FF))

--主界面状态栏样式
mainPage_StatusBarStyle = lvgl.style_t()
lvgl.style_init(mainPage_StatusBarStyle)
lvgl.style_set_bg_color(mainPage_StatusBarStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
lvgl.style_set_bg_opa(mainPage_StatusBarStyle, lvgl.STATE_DEFAULT, 10)
lvgl.style_set_border_opa(mainPage_StatusBarStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--手机app图标样式
mainPage_IconStyle = lvgl.style_t()
lvgl.style_init(mainPage_IconStyle)
lvgl.style_set_bg_opa(mainPage_IconStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_bg_opa(mainPage_IconStyle, (lvgl.STATE_PRESSED or lvgl.STATE_CHECKED), lvgl.OPA_0)
lvgl.style_set_border_opa(mainPage_IconStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_border_opa(mainPage_IconStyle, (lvgl.STATE_PRESSED or lvgl.STATE_CHECKED), lvgl.OPA_0)
lvgl.style_set_outline_opa(mainPage_IconStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(mainPage_IconStyle, lvgl.STATE_FOCUSED, lvgl.OPA_0)

--主界面图标字体默认颜色样式(白色)
mainPage_IconFontStyle = lvgl.style_t()
lvgl.style_init(mainPage_IconFontStyle)
lvgl.style_set_text_color(mainPage_IconFontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

--主界面状态栏：电量背景样式
statusBar_BatteryBgStyle = lvgl.style_t()
lvgl.style_init(statusBar_BatteryBgStyle)
lvgl.style_set_bg_opa(statusBar_BatteryBgStyle, lvgl.STATE_DEFAULT, lvgl.OPA_30)

--主界面状态栏：电量填充样式
statusBar_BatteryIndicStyle = lvgl.style_t()
lvgl.style_init(statusBar_BatteryIndicStyle)
lvgl.style_set_bg_color(statusBar_BatteryIndicStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x00FF00))

--Audio界面总样式
audio_PageStyle = lvgl.style_t()
lvgl.style_init(audio_PageStyle)
lvgl.style_set_bg_color(audio_PageStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
lvgl.style_set_border_opa(audio_PageStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Audio:Music界面控制栏颜色样式
audio_MusicControlStyle = lvgl.style_t()
lvgl.style_init(audio_MusicControlStyle)
lvgl.style_set_bg_color(audio_MusicControlStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xBEBEBE))
lvgl.style_set_border_opa(audio_MusicControlStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Audio:Music界面控制栏按钮样式
audio_MusicControlBtnStyle = lvgl.style_t()
lvgl.style_init(audio_MusicControlBtnStyle)
lvgl.style_set_bg_color(audio_MusicControlBtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xB1B1B1))

--Audio:Record界面录音按钮样式
Audio_RecordBtnStyle = lvgl.style_t()
lvgl.style_init(Audio_RecordBtnStyle)
lvgl.style_set_bg_color(Audio_RecordBtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xDC143C))

--Audio:Record界面录音按钮默认样式
Audio_RecordBtnDefaultStyle = lvgl.style_t()
lvgl.style_init(Audio_RecordBtnDefaultStyle)
lvgl.style_set_bg_color(Audio_RecordBtnDefaultStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

--QrCode界面基容器样式
qrcode_BaseStyle = lvgl.style_t()
lvgl.style_init(qrcode_BaseStyle)
lvgl.style_set_radius(qrcode_BaseStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(qrcode_BaseStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x696969))
lvgl.style_set_border_opa(qrcode_BaseStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--QrCode界面总样式
qrcode_PageStyle = lvgl.style_t()
lvgl.style_init(qrcode_PageStyle)
lvgl.style_set_bg_color(qrcode_PageStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x696969))
lvgl.style_set_border_opa(qrcode_PageStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--QrCode显示框样式
qrcode_disContStyle = lvgl.style_t()
lvgl.style_init(qrcode_disContStyle)
lvgl.style_set_bg_color(qrcode_disContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x696969))
lvgl.style_set_border_opa(qrcode_disContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--QrCode界面字体默认样式
qrcode_FontStyle = lvgl.style_t()
lvgl.style_init(qrcode_FontStyle)
lvgl.style_set_text_color(qrcode_FontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

--QrCode:CreateQrCode界面显示二维码区域样式
qrcode_DisplayAreaStyle = lvgl.style_t()
lvgl.style_init(qrcode_DisplayAreaStyle)
lvgl.style_set_bg_color(qrcode_DisplayAreaStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x778899))
lvgl.style_set_border_opa(qrcode_DisplayAreaStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Widgets界面总样式
widgets_PageStyle = lvgl.style_t()
lvgl.style_init(widgets_PageStyle)
lvgl.style_set_bg_color(widgets_PageStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x33CAFF))
lvgl.style_set_border_opa(widgets_PageStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Calculator界面: 显示区域样式
calcu_DisplayResultAreaStyle = lvgl.style_t()
lvgl.style_init(calcu_DisplayResultAreaStyle)
lvgl.style_set_radius(calcu_DisplayResultAreaStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(calcu_DisplayResultAreaStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x4E5C65))
lvgl.style_set_border_opa(calcu_DisplayResultAreaStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_text_color(calcu_DisplayResultAreaStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xF8F8FF))

--Calculator界面: 按钮区域样式
calcu_BtnAreaStyle = lvgl.style_t()
lvgl.style_init(calcu_BtnAreaStyle)
lvgl.style_set_bg_color(calcu_BtnAreaStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x3C434B))
lvgl.style_set_border_opa(calcu_BtnAreaStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Calculator界面: 按钮样式
calcu_BtnStyle = lvgl.style_t()
lvgl.style_init(calcu_BtnStyle)
lvgl.style_set_radius(calcu_BtnStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(calcu_BtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x3C434B))
lvgl.style_set_bg_color(calcu_BtnStyle, (lvgl.STATE_PRESSED or lvgl.STATE_CHECKED), lvgl.color_hex(0x3C434B))
lvgl.style_set_border_color(calcu_BtnStyle, (lvgl.STATE_PRESSED), lvgl.color_hex(0xF8F8FF))
lvgl.style_set_border_opa(calcu_BtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_text_color(calcu_BtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xF8F8FF))

--BlueTooth界面总样式
blueTooth_PageStyle = lvgl.style_t()
lvgl.style_init(blueTooth_PageStyle)
lvgl.style_set_radius(blueTooth_PageStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(blueTooth_PageStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x3C434B))
lvgl.style_set_border_opa(blueTooth_PageStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--BlueTooth界面字体样式
blueTooth_FontStyle = lvgl.style_t()
lvgl.style_init(blueTooth_FontStyle)
lvgl.style_set_text_color(blueTooth_FontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))

--BlueTooth: 蓝牙扫描按钮样式
blueTooth_ScanBtnStyle = lvgl.style_t()
lvgl.style_init(blueTooth_ScanBtnStyle)
lvgl.style_set_bg_color(blueTooth_ScanBtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x8A2BE2))
lvgl.style_set_bg_color(blueTooth_ScanBtnStyle, (lvgl.STATE_PRESSED or lvgl.STATE_CHECKED), lvgl.color_hex(0x8A2BE2))
lvgl.style_set_border_opa(blueTooth_ScanBtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Weather界面样式
weather_PageStyle = lvgl.style_t()
lvgl.style_init(weather_PageStyle)
lvgl.style_set_radius(weather_PageStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(weather_PageStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x393939))
lvgl.style_set_border_opa(weather_PageStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Weather：显示天气信息容器样式
weather_InfoContStyle = lvgl.style_t()
lvgl.style_init(weather_InfoContStyle)
lvgl.style_set_radius(weather_InfoContStyle, lvgl.STATE_DEFAULT, 50)
lvgl.style_set_bg_opa(weather_InfoContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_10)
lvgl.style_set_bg_color(weather_InfoContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x696969))
lvgl.style_set_border_opa(weather_InfoContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--weather：未来一周天气信息容器样式
weather_FuWeekInfoContStyle = lvgl.style_t()
lvgl.style_init(weather_FuWeekInfoContStyle)
lvgl.style_set_radius(weather_FuWeekInfoContStyle, lvgl.STATE_DEFAULT, 70)
lvgl.style_set_bg_color(weather_FuWeekInfoContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x696969))
lvgl.style_set_border_opa(weather_FuWeekInfoContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--weather：未来一周天气信息字体样式
weather_FuWeekInfoFontStyle = lvgl.style_t()
lvgl.style_init(weather_FuWeekInfoFontStyle)
lvgl.style_set_text_color(weather_FuWeekInfoFontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xF5F5F5))

--开机画面容器样式
BootUp_ContStyle = lvgl.style_t()
lvgl.style_init(BootUp_ContStyle)
lvgl.style_set_radius(BootUp_ContStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(BootUp_ContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x231F1F))
lvgl.style_set_border_opa(BootUp_ContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--关机容器样式
PowerOff_ContStyle = lvgl.style_t()
lvgl.style_init(PowerOff_ContStyle)
lvgl.style_set_radius(PowerOff_ContStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(PowerOff_ContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x231F1F))
lvgl.style_set_border_opa(PowerOff_ContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--关机画面按钮样式
PowerOff_BtnStyle = lvgl.style_t()
lvgl.style_init(PowerOff_BtnStyle)
lvgl.style_set_radius(PowerOff_BtnStyle, lvgl.STATE_DEFAULT, 40)
lvgl.style_set_bg_color(PowerOff_BtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x8B8E86))
lvgl.style_set_border_opa(PowerOff_BtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--Setting:界面总样式
setting_ContStyle = lvgl.style_t()
lvgl.style_init(setting_ContStyle)
lvgl.style_set_radius(setting_ContStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(setting_ContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x708090))
lvgl.style_set_border_opa(setting_ContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

setting_ThemeStyle_Bg = lvgl.style_t()
lvgl.style_init(setting_ThemeStyle_Bg)
lvgl.style_set_radius(setting_ThemeStyle_Bg, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(setting_ThemeStyle_Bg, lvgl.STATE_DEFAULT, lvgl.color_hex(0x708090))
lvgl.style_set_bg_color(setting_ThemeStyle_Bg, (lvgl.STATE_CHECKED or lvgl.STATE_PRESSED), lvgl.color_hex(0x708090))
lvgl.style_set_bg_color(setting_ThemeStyle_Bg, lvgl.STATE_DISABLED, lvgl.color_hex(0x708090))
lvgl.style_set_border_opa(setting_ThemeStyle_Bg, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(setting_ThemeStyle_Bg, lvgl.STATE_DEFAULT, lvgl.OPA_0)

setting_MainPageBtnStyle = lvgl.style_t()
lvgl.style_init(setting_MainPageBtnStyle)
lvgl.style_set_radius(setting_MainPageBtnStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(setting_MainPageBtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x708090))
lvgl.style_set_bg_color(setting_MainPageBtnStyle, (lvgl.STATE_CHECKED or lvgl.STATE_PRESSED), lvgl.color_hex(0x708090))
lvgl.style_set_bg_color(setting_MainPageBtnStyle, lvgl.STATE_DISABLED, lvgl.color_hex(0x708090))
lvgl.style_set_border_opa(setting_MainPageBtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(setting_MainPageBtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_pad_top(setting_MainPageBtnStyle, lvgl.STATE_DEFAULT, 30)
lvgl.style_set_pad_bottom(setting_MainPageBtnStyle, lvgl.STATE_DEFAULT, 30)

--设置界面检查pac更新按钮
setting_ReleaseBtnStyle = lvgl.style_t()
lvgl.style_init(setting_ReleaseBtnStyle)
lvgl.style_set_radius(setting_ReleaseBtnStyle, lvgl.STATE_DEFAULT, 30)
lvgl.style_set_bg_color(setting_ReleaseBtnStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x8A2BE2))
lvgl.style_set_bg_color(setting_ReleaseBtnStyle, (lvgl.STATE_PRESSED or lvgl.STATE_CHECKED), lvgl.color_hex(0x0000CD))
lvgl.style_set_border_opa(setting_ReleaseBtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(setting_ReleaseBtnStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(setting_ReleaseBtnStyle, lvgl.STATE_FOCUSED, lvgl.OPA_0)

--商店界面滚动屏样式
store_scrollPageStyle = lvgl.style_t()
lvgl.style_init(store_scrollPageStyle)
lvgl.style_set_radius(store_scrollPageStyle, lvgl.STATE_DEFAULT, 0)
lvgl.style_set_bg_color(store_scrollPageStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xFFFFFF))
lvgl.style_set_border_opa(store_scrollPageStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--商店界面app容器样式
store_appContStyle = lvgl.style_t()
lvgl.style_init(store_appContStyle)
lvgl.style_set_radius(store_appContStyle, lvgl.STATE_DEFAULT, 30)
lvgl.style_set_bg_color(store_appContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0xCCCCCC))
lvgl.style_set_border_opa(store_appContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--商店界面app下载按钮样式
store_appDlStyle = lvgl.style_t()
lvgl.style_init(store_appDlStyle)
lvgl.style_set_radius(store_appDlStyle, lvgl.STATE_DEFAULT, 13)
lvgl.style_set_bg_color(store_appDlStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x228B22))
lvgl.style_set_bg_color(store_appDlStyle, (lvgl.STATE_PRESSED or lvgl.STATE_CHECKED), lvgl.color_hex(0x228B22))
lvgl.style_set_border_opa(store_appDlStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(store_appDlStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)
lvgl.style_set_outline_opa(store_appDlStyle, lvgl.STATE_FOCUSED, lvgl.OPA_0)

--商店页面异常提示容器样式
store_nCSigContStyle = lvgl.style_t()
lvgl.style_init(store_nCSigContStyle)
lvgl.style_set_radius(store_nCSigContStyle, lvgl.STATE_DEFAULT, 30)
lvgl.style_set_bg_color(store_nCSigContStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x778899))
lvgl.style_set_border_opa(store_nCSigContStyle, lvgl.STATE_DEFAULT, lvgl.OPA_0)

--商店页面异常提示字体样式
store_nCSigFontStyle = lvgl.style_t()
lvgl.style_init(store_nCSigFontStyle)
lvgl.style_set_text_color(store_nCSigFontStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x800000))



