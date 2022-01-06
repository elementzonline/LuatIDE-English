---@diagnostic disable: lowercase-global, undefined-global
------------------------------------------------iCool Interface Manager----------------------------------------------------------
------------------------------This scripts is about how to manager the interface of iCool----------------------------------------

--Define a macro for development and debugging
local iCool_interfaceDebugSignal = false

---------------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------GLOBAL VARIABLE-------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------

--------------------------------------------------Interface Resgister Table------------------------------------------------------
--1. This is the storage table of interface serial numbers.
--2. It saves the serial numbers of all interfaces, and each interface has only one serial number.
---------------------------------------------------------------------------------------------------------------------------------
_G.iCool_interfaceIndexTable =
{
    interfaceIndex_Default      = 0x0000,
    interfaceIndex_Idle         = 0x0001,
    interfaceIndex_Widgets      = 0x0002,
    interfaceIndex_Clock        = 0x0003,
    interfaceIndex_Weather      = 0x0004,
    interfaceIndex_Calculator   = 0x0005,
    interfaceIndex_Floder       = 0x0006,
    interfaceIndex_Audio        = 0x0007,
    interfaceIndex_Calendar     = 0x0008,
    interfaceIndex_QrCode       = 0x0009,
    interfaceIndex_BlueTooth    = 0x000A,
    interfaceIndex_Setting      = 0x000B,
    interfaceIndex_Store        = 0x000C,
    interfaceIndex_ExterApp     = 0x00A0,
}

---------------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------PARTIAL VARIABLE-------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------

--------------------------------------------------Opera of Interface Manager----------------------------------------------------
--Defines the input operation in the interface management function
--------------------------------------------------------------------------------------------------------------------------------
local iCool_interfaceManagerOpera =
{
    --Registration interface operation
    registerInterfaceOpera      = 0x0100,
    --Logout interface operation
    logoutInterfaceOpera        = 0x0101,
}

--------------------------------------------------interaction of Interface Manager----------------------------------------------------
--Defines the input interaction in the interface management function
--------------------------------------------------------------------------------------------------------------------------------
local iCool_interfaceManagerInteraction =
{
    --Load interface operation
    loadInterfaceInteraction    = 0x0110,
    --Destroy interface operation
    destroyInterfaceInteraction = 0x0111,
}

--------------------------------------------------Interface Record Table--------------------------------------------------------
--1. This table holds the interface that has been recorded
--2. It saves the serial numbers of all interfaces, and each interface has only one serial number.
---------------------------------------------------------------------------------------------------------------------------------
_G.iCool_interfaceIndexRecordTable = {}

---------------------------------------------Current Interface Serial Number-----------------------------------------------------
--1. This variable holds the serial number of the currently displayed interface
---------------------------------------------------------------------------------------------------------------------------------
local iCool_curInterfaceIndex = nil
---------------------------------------------History Interface Serial Number-----------------------------------------------------
--1. This variable saves the previous interface of the current interface
---------------------------------------------------------------------------------------------------------------------------------
local iCool_historyInterfaceIndex = nil
------------------------------------------ Interface Serial Number Record Table--------------------------------------------------
--1. This variable holds the amount of data that has been recorded in the interface sequence record table
---------------------------------------------------------------------------------------------------------------------------------
_G.iCool_recordInterfaceNumber = 0

---------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------FUNCTION-----------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------

---------------------------------------------------1. Interface registration-----------------------------------------------------
--1. This is the initialization function of iCool's interface registration.
--2. Every interface will call this function to register and record the interface.
--3. Note: changes to it are prohibited
---------------------------------------------------------------------------------------------------------------------------------
--@interfaceIndex   This is the serial number of the interface to be registered
--@return iCool_curInterfaceIndex           Return the current interface serial number
local function iCool_interfaceRegistInit(interfaceIndex)
    --Increase the number of record interfaces by one
    iCool_recordInterfaceNumber = iCool_recordInterfaceNumber + 1
    --Save the interface will be registered
    iCool_curInterfaceIndex = interfaceIndex
    --Record the current interface in iCool_interfaceIndexRecordTable
    iCool_interfaceIndexRecordTable[iCool_recordInterfaceNumber] = iCool_curInterfaceIndex
    if (iCool_interfaceDebugSignal)then
        print("[iCool:Interface Register]".."The interface that needs to be registered is:  "..iCool_interfaceIndexRecordTable[iCool_recordInterfaceNumber])
        print("[iCool:Interface Register]".."There are "..iCool_recordInterfaceNumber.." interfaces in the interface table ")
    end

    --Return interface will be display
    return iCool_curInterfaceIndex
end

------------------------------------------------------2. Interface Logout--------------------------------------------------------------
--1. This function is used to log out the interface
---------------------------------------------------------------------------------------------------------------------------------------
--@return iCool_toLogoutInterfaceIndex      The serial number of the interface to be delete
--@return iCool_curInterfaceIndex           The serial number of the interface to be displayed
local function iCool_interfaceLogoutinit()
    --When in Idle interface, it is forbidden to logout the interface
    iCool_curInterfaceIndex = iCool_interfaceIndexTable.interfaceIndex_Default
    local iCool_toLogoutInterfaceIndex = iCool_interfaceIndexRecordTable[iCool_recordInterfaceNumber]
    if (iCool_recordInterfaceNumber > 1)then
        iCool_interfaceIndexRecordTable[iCool_recordInterfaceNumber] = nil
        iCool_recordInterfaceNumber = iCool_recordInterfaceNumber - 1
        iCool_curInterfaceIndex = iCool_interfaceIndexRecordTable[iCool_recordInterfaceNumber]
        if (iCool_interfaceDebugSignal)then
            print("[iCool:Interface Logout]".."The serial number of interface that will be logouted:  "..iCool_toLogoutInterfaceIndex)
            print("[iCool:Interface Logout]".."The serial number of interface that will be displayed:  "..iCool_curInterfaceIndex)
            print("[iCool:Interface Logout]".."Interface RecordTable currently has  "..iCool_recordInterfaceNumber.."  interfaces")
        end

        --Return the interface will be deleted
        --Return the interface will be displayed
        return iCool_toLogoutInterfaceIndex, iCool_curInterfaceIndex
    end
    if (iCool_interfaceDebugSignal)then
        print("[iCool:Interface Logout]".."你不能删除主界面")
    end
    return iCool_toLogoutInterfaceIndex, iCool_curInterfaceIndex
end

-------------------------------------------------------3. Interface Loadtion----------------------------------------------------------
--1. This function is used to load the interface
--------------------------------------------------------------------------------------------------------------------------------------
--@curToDisplayInterfaceIndex       This is the serial number of the interface to be loaded
local function iCool_loadInterfaceInit(curToDisplayInterfaceIndex)
    if (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Idle)then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Idle")
        iCool_IdleInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Widgets) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Widgets")
        Multi_WidgetsInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Clock) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Clock")
        iCoolTimeInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Weather) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Weather")
        iCoolWeatherInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Calculator) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Calculator")
        iCoolCalculatorInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Floder) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Floder")
        floderInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Audio) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Audio")
        AudioInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Calendar) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Calendar")
        CalendarInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_QrCode) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."QrCode")
        QrCodeInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_BlueTooth) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."BlueTooth")
        iCoolBlueToothInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Setting) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Setting")
        iCool_settingInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Store) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."Store")
        iCool_storeInit()
    elseif (curToDisplayInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_ExterApp) then
        print("[iCool:Interface Loadtion]".."Current load interface: ".."StoreApp")
    end
end

-------------------------------------------------------4. Interface Destruction-------------------------------------------------------
--1. This function is used to delete the interface
--------------------------------------------------------------------------------------------------------------------------------------
--@curToDeleteInterfaceIndex       This is the serial number of the interface to be deleted
local function iCool_destroyInterfaceInit(curToDeleteInterfaceIndex)
    if (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Idle)then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Idle")
        lvgl.obj_del(SCREEN_MAIN)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Widgets) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Widgets")
        Multi_DeleteAll()
        lvgl.obj_del(multi_WidgetsBase)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Clock) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Clock")
        lvgl.obj_del(clockPage_Cont)
        sys.timerStop(_G.clock_StopWatchDisplayHandle, "Clock_StopWatch")
        sys.timerStop(_G.getTimeOneSec, "getTime")
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Weather) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Weather")
        lvgl.obj_del(WEATHER_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Calculator) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Calculator")
        lvgl.obj_del(CALCULATOR_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Floder) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Floder")
        lvgl.obj_del(FLODER_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Audio) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Audio")
        audiocore.stop()
        if (_G.audio_ExistMusicControl)then
            lvgl.obj_del(_G.audio_MusicControl)
        elseif (_G.audio_ExistRecordBtn) then
            lvgl.obj_del(_G.audio_RecordBtn)
        elseif (_G.audio_ExistVoiceBtn) then
            lvgl.obj_del(_G.audio_VoiceBtn)
        end
        _G.audio_ExistMusicControl = false
        _G.audio_ExistRecordBtn = false
        _G.audio_ExistVoiceBtn = false
        lvgl.obj_del(AUDIO_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Calendar) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Calendar")
        lvgl.obj_del(CALENDAR_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_QrCode) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."QrCode")
        QrCode_DeleteAll()
        lvgl.obj_del(QRCODE_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_BlueTooth) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."BlueTooth")
        lvgl.obj_del(BLUETOOTH_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Setting) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Setting")
        lvgl.obj_del(SETTING_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_Store) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."Store")
        lvgl.obj_del(STORE_BASECONT)
    elseif (curToDeleteInterfaceIndex == iCool_interfaceIndexTable.interfaceIndex_ExterApp) then
        print("[iCool:Interface Destruction]".."Current delete interface:  ".."StoreApp")
        sys.publish("appCoQuit", "yes")
    end
end

---------------------------------------------------- 5. Interface Manager-------------------------------------------------------------
--1. You can register and logout the interface through this function
--2. All interface operations are carried out by calling this function
--3. This function has different modes of operation
--whichOpera is 0x0010:         Register   Interface
--whichOpera is 0x0011:         Logout     Interface
--------------------------------------------------------------------------------------------------------------------------------------
--@whichOpera                       This is to choose which interface operation
--@curRegisterAndLoadInterface      The interface will be registered or loaded--(Only whichOpera is 0x0010 need)
--@return
--whichOpera is 0x0100,             It will have 1 return:  The serial number of interface will be display
--whichOpera is 0x0101,             It will have 2 return:  1. The serial number of interface will be deleted  2. The serial number of interface will be display
local function iCool_interfaceManagerInit(whichOpera, curRegisterAndLoadInterface)
    if (whichOpera == iCool_interfaceManagerOpera.registerInterfaceOpera)then
        local index = iCool_interfaceRegistInit(curRegisterAndLoadInterface)
        return index
    elseif (whichOpera == iCool_interfaceManagerOpera.logoutInterfaceOpera) then
        local interfaceToDelete, interfaceToDisplay = iCool_interfaceLogoutinit()
        return interfaceToDelete, interfaceToDisplay
    end
end

----------------------------------------------------6. Interface Interaction----------------------------------------------------------
--1. You can load and delete the interface through this function
--2. All interface interaction are carried out by calling this function
--3. This function has different modes of interaction
--whichInteractive is 0x0110:   Load        Interface
--whichInteractive is 0x0111:   Delete      Interface
--------------------------------------------------------------------------------------------------------------------------------------
--@whichInteractive                 This is to choose which interface interaction
--@curInteractiveInterface          The interface will be loaded or deleted
local function iCool_interfaceInteractionInit(whichInteractive, curInteractiveInterface)
    if (whichInteractive == iCool_interfaceManagerInteraction.loadInterfaceInteraction)then
        iCool_loadInterfaceInit(curInteractiveInterface)
    elseif (whichInteractive == iCool_interfaceManagerInteraction.destroyInterfaceInteraction) then
        iCool_destroyInterfaceInit(curInteractiveInterface)
    end
end

local function iCool_interfaceDebugInterfaceTableInfo()
    if (iCool_interfaceDebugSignal)then
        for k, v in pairs(iCool_interfaceIndexRecordTable) do
            print("现在保存的界面有", v)
        end
    end
end

---------------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------GLOBAL FUNCTION-------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------

----------------------------------------------------8. Load App----------------------------------------------------------------------
--1. This function is an external global function, you can load app through this function
--2. All interface interaction are carried out by calling this function
--------------------------------------------------------------------------------------------------------------------------------------
--@tarApp                       This is to choose which app to load
function iCool_enterApp(tarApp, whichStoreApp)
	--delete Idle
	iCool_interfaceInteractionInit(iCool_interfaceManagerInteraction.destroyInterfaceInteraction, iCool_interfaceIndexTable.interfaceIndex_Idle)
	--judge this interface whether is storeApp
    if (tarApp ~= iCool_interfaceIndexTable.interfaceIndex_ExterApp)then
        local b = iCool_interfaceManagerInit(iCool_interfaceManagerOpera.registerInterfaceOpera, tarApp)
        --load storeApp
        iCool_interfaceInteractionInit(iCool_interfaceManagerInteraction.loadInterfaceInteraction, b)
        iCool_interfaceDebugInterfaceTableInfo()
    else
        if (iCool_interfaceDebugSignal)then
            print("[iCool:Interface Loadtion]", "You are coming to storeApp")
        end
        local b = iCool_interfaceManagerInit(iCool_interfaceManagerOpera.registerInterfaceOpera, tarApp)
        iCoolAppLunch(whichStoreApp[1], whichStoreApp[2])
    end
end

----------------------------------------------------9. Logout App--------------------------------------------------------------------
--1. This function is an external global function, you can logout app through this function
--2. All interface interaction are carried out by calling this function
--------------------------------------------------------------------------------------------------------------------------------------
function iCool_logoutApp()
    local interfaceToDestroy, interfaceToLoad = iCool_interfaceManagerInit(iCool_interfaceManagerOpera.logoutInterfaceOpera)
    if (interfaceToLoad == iCool_interfaceIndexTable.interfaceIndex_Default)then
    else
        iCool_interfaceInteractionInit(iCool_interfaceManagerInteraction.destroyInterfaceInteraction, interfaceToDestroy)
        iCool_interfaceInteractionInit(iCool_interfaceManagerInteraction.loadInterfaceInteraction, interfaceToLoad)
        --Add new features: [When the interface returns, it will automatically locate the interface where it is located]
        if (interfaceToDestroy == iCool_interfaceIndexTable.interfaceIndex_Store or interfaceToDestroy == iCool_interfaceIndexTable.interfaceIndex_ExterApp)then
            lvgl.tabview_set_tab_act(mainPageTableView, 2, lvgl.ANIM_OFF)
        end
    end
    iCool_interfaceDebugInterfaceTableInfo()
end

----------------------------------------------------10. Initital Interface-----------------------------------------------------------
--1. This function is an external global function, you can initital through this function
--2. All interface interaction are carried out by calling this function
--------------------------------------------------------------------------------------------------------------------------------------
function iCool_initInterface()
    local a = iCool_interfaceManagerInit(iCool_interfaceManagerOpera.registerInterfaceOpera, iCool_interfaceIndexTable.interfaceIndex_Idle)
    iCool_interfaceInteractionInit(iCool_interfaceManagerInteraction.loadInterfaceInteraction, a)
    iCool_interfaceDebugInterfaceTableInfo()
end

