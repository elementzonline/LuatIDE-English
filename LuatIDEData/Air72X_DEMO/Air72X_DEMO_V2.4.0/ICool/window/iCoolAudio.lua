---@diagnostic disable: undefined-global, lowercase-global
require "iCoolStyle"

--Audio界面跳转函数变量
local audio_JumpToMusicPageVar, audio_JumpToRecordPageVar, audio_JumpToVoicePageVar
--Audio界面初始化函数变量
local audio_MusicPageInitVar, audio_RecordPageInitVar, audio_VoicePageInitVar
--Audio：Music界面控制函数变量
local audio_MusicPlaySongVar, audio_MusicNextSongVar, audio_MusicPreSongVar
--Audio界面读取音频文件函数变量
local audio_GetMusicInfoVar, audio_GetRecordInfoVar, audio_GetVoiceInfoVar
--Audio:Record界面录音函数变量
local audio_StartRecordVar
--Audio:Voice界面语音播报函数变量
local audio_StartVoiceVar

--Audio界面全局按钮变量
_G.audio_RecordBtn = nil
_G.audio_VoiceBtn = nil
_G.audio_MusicControl = nil

--读取到的音乐信息存储表
local audio_GetMusicInfoTable = {}
--当前播放的音乐
local curMusic = nil

--判断处于哪个界面:默认处于Music界面
_G.audio_InMusicPage = false
_G.audio_InVoicePage = false
_G.audio_InRecordPage = false
--判断是否存在Music界面的控制容器:默认存在
_G.audio_ExistMusicControl = false
--判断是否在播放音乐:默认未播放
local audio_InPlaySong = false
--判断录音按钮是否存在:默认不存在
_G.audio_ExistRecordBtn = false
--判断是否在录音:默认未录音
local audio_InRecord = false
--判断语音按钮是否存在:默认不存在
_G.audio_ExistVoiceBtn = false
--判断是否在语音播报:默认未语音播报
local audio_InVoice = false

audio_MainScreenColor = lvgl.color_make(112, 128, 144)
--Audio界面测试样式
audio_TtStyle = lvgl.style_t()

--Audio总界面初始化
function AudioInit()
    audio_InPlaySong = false
    audio_InRecord = false
    audio_InVoice = false
    lvgl.style_init(audio_TtStyle)
    lvgl.style_set_bg_color(audio_TtStyle, lvgl.STATE_DEFAULT, lvgl.color_hex(0x0BFF00))

    --Audio界面基容器
    AUDIO_BASECONT = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(AUDIO_BASECONT, 480, 804)
    lvgl.obj_align(AUDIO_BASECONT, nil, lvgl.ALIGN_IN_TOP_MID, 0, 50)

    --Audio界面导航栏
    audio_NavBar = lvgl.cont_create(AUDIO_BASECONT, nil)
    lvgl.obj_set_size(audio_NavBar, 480, 70)
    lvgl.obj_align(audio_NavBar, AUDIO_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 734)
    lvgl.obj_add_style(audio_NavBar, lvgl.PAGE_PART_BG, audio_PageStyle)

    audio_MusicPageBtn = lvgl.btn_create(audio_NavBar, nil)
    lvgl.obj_set_size(audio_MusicPageBtn, 100, 70)
    lvgl.obj_align(audio_MusicPageBtn, audio_NavBar, lvgl.ALIGN_CENTER, 0, 0)
    lvgl.obj_add_style(audio_MusicPageBtn, lvgl.BTN_PART_MAIN, audio_PageStyle)
    lvgl.obj_set_event_cb(audio_MusicPageBtn, audio_JumpToMusicPageVar)

    audio_MusicLabel = lvgl.label_create(audio_MusicPageBtn, nil)
    lvgl.label_set_text(audio_MusicLabel, "音乐")
    lvgl.obj_add_style(audio_MusicLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    
    audio_RecordPageBtn = lvgl.btn_create(audio_NavBar, audio_MusicPageBtn)
    lvgl.obj_align(audio_RecordPageBtn, audio_NavBar, lvgl.ALIGN_CENTER, -(210 - lvgl.obj_get_width(audio_RecordPageBtn)/2), 0)
    lvgl.obj_set_event_cb(audio_RecordPageBtn, audio_JumpToRecordPageVar)
    
    audio_RecordLabel = lvgl.label_create(audio_RecordPageBtn, nil)
    lvgl.label_set_text(audio_RecordLabel, "录音")
    lvgl.obj_add_style(audio_RecordLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)

    audio_VoicePageBtn = lvgl.btn_create(audio_NavBar, audio_MusicPageBtn)
    lvgl.obj_align(audio_VoicePageBtn, audio_NavBar, lvgl.ALIGN_CENTER, (210 - lvgl.obj_get_width(audio_VoicePageBtn)/2), 0)
    lvgl.obj_set_event_cb(audio_VoicePageBtn, audio_JumpToVoicePageVar)

    audio_VoiceLabel = lvgl.label_create(audio_VoicePageBtn, nil)
    lvgl.label_set_text(audio_VoiceLabel, "语音")
    lvgl.obj_add_style(audio_VoiceLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)

    audio_MainPage = lvgl.page_create(AUDIO_BASECONT, nil)
    lvgl.obj_set_size(audio_MainPage, 480, (804-lvgl.obj_get_height(audio_NavBar)))
    lvgl.obj_align(audio_MainPage, AUDIO_BASECONT, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.page_set_scrollbar_mode(audio_MainPage, lvgl.SCROLLBAR_MODE_OFF)
    lvgl.obj_add_style(audio_MainPage, lvgl.PAGE_PART_BG, audio_PageStyle)
    
    --设置当前播放的音乐
    curMusic = "/lua/mood.mp3"
    audio_MusicPageInitVar()
end

--跳转到Music界面
local function audio_JumpToMusicPage(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO]audio_JumpToMusic")
        if (_G.audio_InMusicPage == false)then
            lvgl.page_clean(audio_MainPage)
            audio_MusicPageInitVar()
        end
    end
end

--跳转到Record界面
local function audio_JumpToRecordPage(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO]audio_JumpToRecordPage")
        if (_G.audio_InRecordPage == false)then
            lvgl.page_clean(audio_MainPage)
            audio_RecordPageInitVar()
        end
    end
end

--跳转到Voice界面
local function audio_JumpToVoicePage(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO]audio_JumpToVoicePage")
        if (_G.audio_InVoicePage == false)then
            lvgl.page_clean(audio_MainPage)
            audio_VoicePageInitVar()
        end
    end
end

--Music界面初始化
local function audio_MusicPageInit()
    _G.audio_InMusicPage = true
    _G.audio_InRecordPage = false
    _G.audio_InVoicePage = false
    _G.audio_ExistMusicControl = true
    --重置录音/播放音乐/语音播报状态
    audio_InRecord = false
    audio_InVoice = false

    lvgl.obj_add_style(audio_MusicLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
    lvgl.obj_add_style(audio_RecordLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    lvgl.obj_add_style(audio_VoiceLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    if (_G.audio_ExistRecordBtn)then
        lvgl.obj_del(_G.audio_RecordBtn)
        _G.audio_RecordBtn = nil
        _G.audio_ExistRecordBtn = false
    end
    if (_G.audio_ExistVoiceBtn)then
        lvgl.obj_del(_G.audio_VoiceBtn)
        _G.audio_VoiceBtn = nil
        _G.audio_ExistVoiceBtn = false
    end

    --Music界面控制容器
    _G.audio_MusicControl = lvgl.cont_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(_G.audio_MusicControl, 480, 90)
    lvgl.obj_align(_G.audio_MusicControl, audio_NavBar, lvgl.ALIGN_OUT_TOP_MID, 0, 0)
    lvgl.obj_add_style(_G.audio_MusicControl, lvgl.CONT_PART_MAIN, audio_MusicControlStyle)

    --Music播放按钮
    audio_MusicPlaySongBtn = lvgl.btn_create(_G.audio_MusicControl, nil)
    lvgl.obj_set_size(audio_MusicPlaySongBtn, 85, 85)
    lvgl.obj_align(audio_MusicPlaySongBtn, _G.audio_MusicControl, lvgl.ALIGN_CENTER, 105, 0)
    lvgl.obj_add_style(audio_MusicPlaySongBtn, lvgl.BTN_PART_MAIN, audio_MusicControlBtnStyle)
    lvgl.obj_set_event_cb(audio_MusicPlaySongBtn, audio_MusicPlaySongVar)

    audio_MusicPlayBtnLabel = lvgl.label_create(audio_MusicPlaySongBtn, nil)
    if (audio_InPlaySong)then
        lvgl.label_set_text(audio_MusicPlayBtnLabel, "暂停")
        lvgl.obj_add_style(audio_MusicPlayBtnLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
    else
        lvgl.label_set_text(audio_MusicPlayBtnLabel, "播放")
        lvgl.obj_add_style(audio_MusicPlayBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    end

    --Music下一首按钮
    audio_MusciNextSongBtn = lvgl.btn_create(_G.audio_MusicControl, audio_MusicPlaySongBtn)
    lvgl.obj_set_size(audio_MusciNextSongBtn, 70, 70)
    lvgl.obj_align(audio_MusciNextSongBtn, _G.audio_MusicControl, lvgl.ALIGN_CENTER, 200, 0)
    lvgl.obj_set_event_cb(audio_MusciNextSongBtn, audio_MusicNextSongVar)

    audio_MusicNextBtnLabel = lvgl.label_create(audio_MusciNextSongBtn, audio_MusicPlayBtnLabel)
    lvgl.label_set_text(audio_MusicNextBtnLabel, "下一首")
    lvgl.obj_add_style(audio_MusicNextBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)

    --Music上一首按钮
    audio_MusicPreSongBtn = lvgl.btn_create(_G.audio_MusicControl, audio_MusciNextSongBtn)
    lvgl.obj_align(audio_MusicPreSongBtn, _G.audio_MusicControl, lvgl.ALIGN_CENTER, 10, 0)
    lvgl.obj_set_event_cb(audio_MusicPreSongBtn, audio_MusicPreSongVar)

    audio_MusicPreBtnLabel = lvgl.label_create(audio_MusicPreSongBtn, audio_MusicPlayBtnLabel)
    lvgl.label_set_text(audio_MusicPreBtnLabel, "上一首")
    lvgl.obj_add_style(audio_MusicPreBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)

    --Music界面音乐播放信息
    audio_MusicPlayInfoLabel = lvgl.label_create(_G.audio_MusicControl, nil)
    lvgl.label_set_long_mode(audio_MusicPlayInfoLabel, lvgl.LABEL_LONG_SROLL_CIRC)
    lvgl.obj_set_width(audio_MusicPlayInfoLabel, 200)
    lvgl.obj_align(audio_MusicPlayInfoLabel, _G.audio_MusicControl, lvgl.ALIGN_IN_LEFT_MID, 10, 0)
    lvgl.label_set_text(audio_MusicPlayInfoLabel, "Mood(Lil Ghost Remix)     24kGoldn")

    --Music界面音乐信息展示表
    audio_MusicList = lvgl.list_create(audio_MainPage, nil)
    lvgl.obj_set_size(audio_MusicList, 480, (804-lvgl.obj_get_height(audio_NavBar)-lvgl.obj_get_height(_G.audio_MusicControl)))
    lvgl.obj_align(audio_MusicList, audio_MainPage, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.obj_add_style(audio_MusicList, lvgl.LIST_PART_BG, audio_PageStyle)
    lvgl.list_set_scrollbar_mode(audio_MusicList, lvgl.SCROLLBAR_MODE_OFF)
    
    audio_MusicInfoListBtn = lvgl.list_add_btn(audio_MusicList, lvgl.SYMBOL_LIST, "歌曲                                       歌手")
    
    audio_GetMusicInfoVar()
end
--音乐播放的优先级
local musicProtity = 1
--音乐播放结束的回调函数
local function iCool_musicPlayEnd(ret)
    if (ret == 0)then
        audio.stop()
		print("放完了")
		audio_InPlaySong = false
        lvgl.label_set_text(audio_MusicPlayBtnLabel, "播放")
        lvgl.obj_add_style(audio_MusicPlayBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    end
end

--播放音乐
local function musicPlay()
    local volume = iCool_settingGetVolumeLevel()
    audio.play(musicProtity, "FILE", curMusic, volume, iCool_musicPlayEnd)
    musicProtity = musicProtity + 1
end

--音乐播放函数
local function iCool_audioMusicPlay()
    print("musicProtity", musicProtity)
    sys.timerStart(musicPlay, 30, "MusicPlaySignal")
    print("播放结束")
end

--Music界面播放音乐函数
local function audio_MusicPlaySong(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO-Music]PlaySong")
        if (not audio_InPlaySong)then
            print("播放开始")
            audio_InPlaySong = true
            iCool_audioMusicPlay()
            lvgl.label_set_text(audio_MusicPlayBtnLabel, "暂停")
            lvgl.obj_add_style(audio_MusicPlayBtnLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
        else
            print("暂停了")
            audiocore.stop()
            audio_InPlaySong = false
            lvgl.label_set_text(audio_MusicPlayBtnLabel, "播放")
            lvgl.obj_add_style(audio_MusicPlayBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
        end
    end
end

--Music界面下一首音乐函数
local function audio_MusicNextSong(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO-Music]NextSong")
        if (audio_InPlaySong)then
            audio.stop()
            if (curMusic == "/lua/mood.mp3")then
                curMusic = "/lua/Doraemon.mp3"
                lvgl.label_set_text(audio_MusicPlayInfoLabel, "Doraemon          佚名")
                iCool_audioMusicPlay()
            else
                curMusic = "/lua/mood.mp3"
                lvgl.label_set_text(audio_MusicPlayInfoLabel, "Mood(Lil Ghost Remix)     24kGoldn")
                iCool_audioMusicPlay()
            end
        end
    end
end

--Music界面上一首音乐函数
local function audio_MusicPreSong(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO-Music]PreviousSong")
        if (audio_InPlaySong)then
            audio.stop()
            if (curMusic == "/lua/mood.mp3")then
                curMusic = "/lua/Doraemon.mp3"
                lvgl.label_set_text(audio_MusicPlayInfoLabel, "Doraemon          佚名")
                iCool_audioMusicPlay()
            else
                curMusic = "/lua/mood.mp3"
                lvgl.label_set_text(audio_MusicPlayInfoLabel, "Mood(Lil Ghost Remix)     24kGoldn")
                iCool_audioMusicPlay()
            end
        end
    end
end

--Record界面初始化
local function audio_RecordPageInit()
    _G.audio_InMusicPage = false
    _G.audio_InRecordPage = true
    _G.audio_InVoicePage = false
    _G.audio_ExistRecordBtn = true
    --重置录音/播放音乐/语音播报状态
    audio_InRecord = false
    audio_InVoice = false

    lvgl.obj_add_style(audio_MusicLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    lvgl.obj_add_style(audio_RecordLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
    lvgl.obj_add_style(audio_VoiceLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    if (_G.audio_ExistMusicControl)then
        lvgl.obj_del(_G.audio_MusicControl)
        _G.audio_MusicControl = nil
        _G.audio_ExistMusicControl = false
    end
    if (_G.audio_ExistVoiceBtn)then
        lvgl.obj_del(_G.audio_VoiceBtn)
        _G.audio_VoiceBtn = nil
        _G.audio_ExistVoiceBtn = false
    end

    --Record界面录音按钮
    _G.audio_RecordBtn = lvgl.btn_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(_G.audio_RecordBtn, 80, 80)
    lvgl.obj_align(_G.audio_RecordBtn, audio_NavBar, lvgl.ALIGN_OUT_TOP_MID, 0, 0)
    lvgl.obj_set_event_cb(_G.audio_RecordBtn, audio_StartRecordVar)

    audio_RecordBtnLabel = lvgl.label_create(_G.audio_RecordBtn, nil)
    lvgl.label_set_text(audio_RecordBtnLabel, "录音")
    lvgl.obj_add_style(audio_RecordBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)

    --Record界面录音记录表
    audio_RecordList = lvgl.list_create(audio_MainPage, nil)
    lvgl.obj_set_size(audio_RecordList, 480, (804-lvgl.obj_get_height(audio_NavBar)-lvgl.obj_get_height(_G.audio_RecordBtn)))
    lvgl.obj_align(audio_RecordList, audio_MainPage, lvgl.ALIGN_IN_TOP_MID, 0, 0)
    lvgl.obj_add_style(audio_RecordList, lvgl.LIST_PART_BG, audio_PageStyle)
    lvgl.list_set_scrollbar_mode(audio_RecordList, lvgl.SCROLLBAR_MODE_OFF)

    audio_RecordListBtn = lvgl.list_add_btn(audio_RecordList, lvgl.SYMBOL_FILE, "                           录音")
    audio_RecordListBtn = lvgl.list_add_btn(audio_RecordList, lvgl.SYMBOL_FILE, "                           录音")
    audio_RecordListBtn = lvgl.list_add_btn(audio_RecordList, lvgl.SYMBOL_FILE, "                           录音")
end
--Record按钮的响应函数
local function audio_StartRecord(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO-Record]StartRecord")
        if (audio_InRecord)then
            lvgl.label_set_text(audio_RecordBtnLabel, "录音")
            lvgl.obj_add_style(audio_RecordBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
            lvgl.obj_add_style(_G.audio_RecordBtn, lvgl.BTN_PART_MAIN, Audio_RecordBtnDefaultStyle)
            audio_InRecord = false
        else
            lvgl.label_set_text(audio_RecordBtnLabel, "结束")
            lvgl.obj_add_style(audio_RecordBtnLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
            lvgl.obj_add_style(_G.audio_RecordBtn, lvgl.BTN_PART_MAIN, Audio_RecordBtnStyle)
            audio_InRecord = true
        end
    end
end

--Voice界面初始化
local function audio_VoicePageInit()
    _G.audio_InMusicPage = false
    _G.audio_InRecordPage = false
    _G.audio_InVoicePage = true
    _G.audio_ExistVoiceBtn = true
    --重置录音/播放音乐/语音播报状态
    audio_InRecord = false
    audio_InVoice = false

    lvgl.obj_add_style(audio_MusicLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    lvgl.obj_add_style(audio_RecordLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
    lvgl.obj_add_style(audio_VoiceLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
    if (_G.audio_ExistMusicControl)then
        lvgl.obj_del(_G.audio_MusicControl)
        _G.audio_MusicControl = nil
        _G.audio_ExistMusicControl = false
    end
    if (_G.audio_ExistRecordBtn)then
        lvgl.obj_del(_G.audio_RecordBtn)
        _G.audio_RecordBtn = nil
        _G.audio_ExistRecordBtn = false
    end

    --Voice界面语音播报按钮
    _G.audio_VoiceBtn = lvgl.btn_create(lvgl.scr_act(), nil)
    lvgl.obj_set_size(_G.audio_VoiceBtn, 120, 90)
    lvgl.obj_align(_G.audio_VoiceBtn, audio_NavBar, lvgl.ALIGN_OUT_TOP_MID, 0, 0)
    lvgl.obj_set_event_cb(_G.audio_VoiceBtn, audio_StartVoiceVar)

    audio_VoiceBtnLabel = lvgl.label_create(_G.audio_VoiceBtn, nil)
    lvgl.label_set_text(audio_VoiceBtnLabel, "开始朗读")
    lvgl.obj_add_style(audio_VoiceBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
end
--Voice按钮的响应函数
local function audio_StartVoice(obj, e)
    if (e == lvgl.EVENT_CLICKED)then
        log.info("[AUDIO-Voice]StartVoice")
        if (audio_InVoice)then
            lvgl.label_set_text(audio_VoiceBtnLabel, "开始朗读")
            lvgl.obj_add_style(audio_VoiceBtnLabel, lvgl.LABEL_PART_MAIN, defaultFontStyle_Black)
            audio_InVoice = false
        else
            lvgl.label_set_text(audio_VoiceBtnLabel, "结束朗读")
            lvgl.obj_add_style(audio_VoiceBtnLabel, lvgl.LABEL_PART_MAIN, selectedFontStyle)
            audio_InVoice = true
        end
    end
end

--读取音乐函数  
--歌曲和歌手之间相隔20个空格
local function audio_GetMusicInfo()
    audio_GetMusicInfoTable[1] = {}
    audio_GetMusicInfoTable[1][1] = "Mood"
    audio_GetMusicInfoTable[1][2] = "24kGoldn"
    audio_GetMusicInfoTable[2] = {}
    audio_GetMusicInfoTable[2][1] = "Doraemon"
    audio_GetMusicInfoTable[2][2] = "佚名"

    for k, v in pairs(audio_GetMusicInfoTable) do
        if (audio_GetMusicInfoTable[k][1])then
            log.info("[AUDIO-Music]getInfo")
            audio_MusicListBtn = lvgl.list_add_btn(audio_MusicList, lvgl.SYMBOL_AUDIO, audio_GetMusicInfoTable[k][1].."                                       "..audio_GetMusicInfoTable[k][2])
        end
    end
end

--Audio界面函数变量的调用声明
--(禁止随意改动)
audio_JumpToMusicPageVar = audio_JumpToMusicPage
audio_JumpToRecordPageVar = audio_JumpToRecordPage
audio_JumpToVoicePageVar = audio_JumpToVoicePage
audio_MusicPageInitVar = audio_MusicPageInit
audio_RecordPageInitVar = audio_RecordPageInit
audio_VoicePageInitVar = audio_VoicePageInit
audio_MusicPlaySongVar = audio_MusicPlaySong
audio_MusicNextSongVar = audio_MusicNextSong
audio_MusicPreSongVar = audio_MusicPreSong
audio_GetMusicInfoVar = audio_GetMusicInfo
audio_StartRecordVar = audio_StartRecord
audio_StartVoiceVar = audio_StartVoice
