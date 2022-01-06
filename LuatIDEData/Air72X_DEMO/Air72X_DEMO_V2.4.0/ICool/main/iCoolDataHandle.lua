---@diagnostic disable: undefined-field, undefined-global, lowercase-global
------------------------------------------------------------------------------------------
--1. 本文件作用是对商店页面的App进行下载并且独立运行app
------------------------------------------------------------------------------------------
local iCool_DataHandleDebugSignal = true


--1. 对下载的文件进行解压
local appTotalSize = nil
--2. 对下载的文件进行存储到SD卡
local getDirContent
--SD卡中的zip文件信息表
local sdZipInfo = {}
--app下载链接头
local appUrlHead = "http://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/"
----------------------------------------安装方式: SD--------------------------------------------------
--sd卡盘符
local iCoolSDCardRoot = "/sdcard0"
--app数据存储地址
local iCoolAppDataStoreDir = iCoolSDCardRoot.."/iCool/applications"
local iCoolTemDataStoreDir = iCoolSDCardRoot.."/iCool/temStorage"
----------------------------------------安装方式: SD--------------------------------------------------
----------------------------------------安装方式: FS--------------------------------------------------
--iCool手机模块根目录
local iCoolFsRoot = "/"
--app数据存储地址
local iCoolFsAppDataStoreDir = "/iCool/applications"
local iCoolFsTemDataStoreDir = "/iCool/temStorage"
----------------------------------------安装方式: FS--------------------------------------------------  
--定位要写入的app数据  
local appIsToWriteData = nil
--临时函数变量
local zipToAppTableVar = nil
local getAppJsonInfoVar = nil
--app下载定时器ID
local appDlId = nil
local appdowningCont = nil
--判断是否处于商城app下载中
local iCoolStoreAppDling = -1
--数据存储临时变量
local canStoreInFs, canStoreInSD = false, false
--获取数据的指示标志  
--当 getDataSignal = 0      表示获取 FS 系统数据  
--当 getDataSignal = 1      表示获取 SD 卡的数据  
local getDataSignal = -1
--zip文件临时存储表
----------------------------------------------------------------------------------------------
--------------------从SD卡中读取zip格式的文件，并且把他给解压出来到SD卡---------------------------
--文件必须为zip格式
--其中具体的结构为：
--               /── Google.zip
--                      ├─ Google.json
--                      ├─ resource
--                            ├─ icon.png(jpg/jpeg/bin)
--                            └─ ...
--                      ├─ main.lua
--                      ├─ code1.lua
--                      ├─ code2.lua
--                      └─ ...
-----------------------------------------------------------------------------------------------

--判断内存大小以选择安装地址  
--@dSize            要下载的压缩包的大小  
--@zipData          压缩包的数据  
--@pathToStor       存储的地址  
--枚举参数，只有两个固定的参数  
--1.                "/iCool/temStorage"  
--2.                "/sdcard0/iCool/temStorage"  
--@return  
--true:             内存足够，可以下载  
--false:            内存不够，禁止下载  
local function memoryChoose(dSize, zipData, pathToStor)
    --判断是否是存储到SD卡中
    local targetLastMemory = nil
    if (pathToStor == iCoolTemDataStoreDir)then
        targetLastMemory = rtos.get_fs_free_size(1, 1)
        if (iCool_DataHandleDebugSignal)then
            print("SD剩余内存大小 ", targetLastMemory)
            print("压缩包大小： ", dSize)
        end
    elseif (pathToStor == iCoolFsTemDataStoreDir) then
        --保留 1000B 内存给app配置文件使用
        targetLastMemory = rtos.get_fs_free_size() - 1000
        if (iCool_DataHandleDebugSignal)then
            print("FS剩余内存大小 ", targetLastMemory)
            print("压缩包大小： ", dSize)
        end
    else
        --传入的地址错误则不允许存储
        targetLastMemory = 0
    end
    --判断内存是否足够存储
    if (tonumber(dSize) < targetLastMemory)then
        --向传入的路径存储app压缩包
        --地址为 (../temStorage/) + appName.zip
        local file = io.open(pathToStor.."/"..appIsToWriteData..".zip", "w+b")
        if (file)then
            file:write(zipData)
            file:close()
            --分析压缩包解压后所占内存大小
            local zfile, err = zip.open(pathToStor.."/"..appIsToWriteData..".zip")
            if (zfile)then
                local zipSize = 0
                for zzfile in zfile:files() do
                    if (string.sub(zzfile.filename, -1) ~= "/")then
                        if (iCool_DataHandleDebugSignal)then
                            print("\t"..zzfile.filename, "\t\t\t", zzfile.uncompressed_size)
                        end
                        zipSize = zipSize + zzfile.uncompressed_size
                    end
                end
                if (zipSize < (targetLastMemory - tonumber(dSize)))then
                    return true
                end
            end
        end
    end
    return false
end
--1. 获取地址中的zip文件
getDirContent = function(dirPath, level)
    local ftb = {}
    local dtb = {}
    level = level or "    "
    local tag = " "
	if io.opendir(dirPath) == 0 then
		log.error("FsTest.getDirContent", "无法打开目标文件夹\"" .. dirPath .. "\"")
		return
	end
    while true do
        local fType, fName, fSize = io.readdir()
        if fType == 32 then
            table.insert(ftb, {name = fName, path = dirPath .. "/" .. fName, size = fSize})
        elseif fType == 16 then
            table.insert(dtb, {name = fName, path = dirPath .. "/" .. fName})
        else
            break
        end
    end
    io.closedir(dirPath)
    for i = 1, #ftb do 
        if i == #ftb then
            log.info(tag, level .. "└─", ftb[i].name, "[" .. ftb[i].size .. " Bytes]", "----[Dir]" .. ftb[i].path)
        else
            log.info(tag, level .. "├─", ftb[i].name, "[" .. ftb[i].size .. " Bytes]", "----[Dir]" .. ftb[i].path)
        end
    end
    for i = 1, #dtb do 
        if i == #dtb then
            log.info(tag, level.."└─", dtb[i].name)
            getDirContent(dtb[i].path, level .. "  ")
        else
            log.info(tag, level.."├─", dtb[i].name)
            getDirContent(dtb[i].path, level .. "│ ")
        end
    end
    ------------------------------------------------------------------------
    --写入数据到app信息表
    zipToAppTableVar(ftb)
end
--2. 把获取的zip文件中的信息写入到app信息表中
local function zipToAppTable(ftb)
    local isStore = nil
    for i = 1, #ftb do
        local oo = string.match(ftb[i].name, "%.(%w+)$")
        if (getDataSignal == 0) then
            local ol = string.sub(ftb[i].path, 1, #iCoolFsTemDataStoreDir + 1)
            isStore = true
            --判断是否存在zip文件
            if (oo)then
                if ((oo == "zip" or oo == "ZIP") and ol == "/"..iCoolFsTemDataStoreDir)then
                    for j = 1, #sdZipInfo do
                        --防止重复写入相同的app
                        if (ftb[i].name == sdZipInfo[j][1])then
                            isStore = false
                        else
                        end
                    end
                    if (isStore)then
                        sdZipInfo[#sdZipInfo+1] = {}
                        sdZipInfo[#sdZipInfo][1] = ftb[i].name
                        sdZipInfo[#sdZipInfo][2] = string.sub(ftb[i].path, 2)
                        sdZipInfo[#sdZipInfo][3] = ftb[i].size
                        --用于调试查看文件系统
                        if (iCool_DataHandleDebugSignal)then
                            print("存在新数据写入")
                        end
                    end
                end
            end
        elseif (getDataSignal == 1) then
            local ol = string.sub(ftb[i].path, 1, #iCoolTemDataStoreDir)
            isStore = true
            --判断是否存在zip文件
            if (oo)then
                if ((oo == "zip" or oo == "ZIP") and ol == iCoolTemDataStoreDir)then
                    --从app配置文件中读取app配置，防止app丢失
                    for j = 1, #sdZipInfo do
                        --防止重复写入相同的app
                        if (ftb[i].name == sdZipInfo[j][1])then
                            isStore = false
                        else
                        end
                    end
                    if (isStore)then
                        sdZipInfo[#sdZipInfo+1] = {}
                        sdZipInfo[#sdZipInfo][1] = ftb[i].name
                        sdZipInfo[#sdZipInfo][2] = ftb[i].path
                        sdZipInfo[#sdZipInfo][3] = ftb[i].size
                        --用于调试查看文件系统
                        if (iCool_DataHandleDebugSignal)then
                            print("存在新数据写入")
                        end
                    end
                end
            end
        end
    end
end
zipToAppTableVar = zipToAppTable
--3. app数据写操作
--@path             写入的根地址
local function appDataWriteToFl(tarPathIndex)
    if (#sdZipInfo > 0)then
        local nf = nil
        local appToWriteName = nil
        --解压所有的zip文件到规定的文件中
        for i = 1, #sdZipInfo do
            local zipCNF = nil
            --判断是在那个地方存储
            if (tarPathIndex == 0)then
                zipCNF = iCoolFsAppDataStoreDir.."/"..string.sub(sdZipInfo[i][2], 
                                                        #"/iCool/temStorage/1", (-2 - #string.match(sdZipInfo[i][2], "%.(%w+)$")))
            else
                zipCNF = iCoolAppDataStoreDir.."/"..string.sub(sdZipInfo[i][2], 
                                                        #"/sdcard0/iCool/temStorage/1", (-2 - #string.match(sdZipInfo[i][2], "%.(%w+)$")))
            end
            --创建一个和压缩包同名的文件夹
            rtos.make_dir(zipCNF)
            --判断是否是要写入的app数据
            --主要是获取 "/sdcard0/iCool/applications/" 后的app的根文件夹
            appToWriteName = string.match(zipCNF, "%/(%w+)$")
            if (appToWriteName == appIsToWriteData)then
                --对app进行数据写入
                local zfile, err = zip.open(sdZipInfo[i][2])
                if (zfile)then
                    --解压出所有文件到SD卡
                    local zf, zerr, s, fw = nil, nil, nil, nil
                    for file in zfile:files() do
                        print("\t\t"..file.filename)
                        --获取压缩包里的文件的名称
                        if (string.sub(file.filename, -1) == "/")then
                            rtos.make_dir(zipCNF.."/"..string.sub(file.filename, 1, -2))
                        else
                            zf, zerr = zfile:open(file.filename)
                            s = zf:read("*a")
                            zf:close()
                            --如果图片是jpeg格式，则转为jpg格式
                            -- if((string.sub(file.filename, -4, -1) == "jpeg") or (string.sub(file.filename, -4, -1) == "JPEG"))then
                            --     file.filename = string.sub(file.filename, 1, -5).."jpg"
                            -- end
                            fw = io.open(zipCNF.."/"..file.filename,"w")
                            if fw then
                                fw:write(s)
                                fw:close()
                            end
                        end
                    end
                    print("-------------------")
                    zfile:close()
                end
            end
        end
        if (tarPathIndex == 0)then
            --用于调试查看文件系统
            if (iCool_DataHandleDebugSignal)then
                print("下载写入后 FS 数据")
                getDirContent("/")
            end
            --返回获取到的app信息
            getAppJsonInfoVar(0)
        else
            --用于调试查看文件系统
            if (iCool_DataHandleDebugSignal)then
                print("下载写入后SD卡数据")
                getDirContent("/sdcard0")
            end
            --返回获取到的app信息
            getAppJsonInfoVar(1)
        end
    end
end
--3. app数据存储
local function appDataDlSuccess(result,prompt,head,body)
    if (result)then
        --判断 FS 是否存在足够内存存储数据
        canStoreInFs = memoryChoose(head["Content-Length"], body, iCoolFsTemDataStoreDir)
        if (canStoreInFs)then
            getDataSignal = 0
            getDirContent("/")
            getDataSignal = -1
            if (iCool_DataHandleDebugSignal)then
                print("进入 FS 系统中")
            end
            appDataWriteToFl(0)
            --重置变量
            canStoreInFs = false
        else
            --判断 SD卡 是否存在足够内存存储数据
            if (_G.sdInitSuccessed) then
                canStoreInSD = memoryChoose(head["Content-Length"], body, iCoolTemDataStoreDir)
                if (canStoreInSD)then
                    getDataSignal = 1
                    getDirContent(iCoolSDCardRoot)
                    getDataSignal = -1
                    if (iCool_DataHandleDebugSignal)then
                        print("进入 SD 系统中")
                    end
                    appDataWriteToFl(1)
                    --重置变量
                    canStoreInSD = false
                else
                    --提示内存不足
                    iCoolStoreAppDling = 2
                    --关闭下载进度条
                    _G.inAppDling = 2
                end
            else
                --提示内存不足
                iCoolStoreAppDling = 2
                --关闭下载进度条
                _G.inAppDling = 2
            end
        end
        --若其中存在app压缩包
        --清空下载信息表
        sdZipInfo = {}
    end
end
--4. 获取到app的配置信息
local function getAppJsonInfo(pathIndex)
    local cont = nil
    if (pathIndex == 0)then
        cont = io.readFile(iCoolFsAppDataStoreDir.."/"..appIsToWriteData.."/app.json")
    else
        cont = io.readFile(iCoolAppDataStoreDir.."/"..appIsToWriteData.."/app.json")
    end
    if (cont)then
        local kk = json.decode(cont)
        local appName =  kk["name"]
        local appPngDir = kk["icon"]
        --判断是否获取到app名称
        if (not appName)then
            appName = "未命名"
        end
        --判断是否获取到app图标地址
        if (not appPngDir)then
            appPngDir = "/lua/Store.bin"
        else
            -- if ((string.sub(appPngDir, -4, -1) == "jpeg") or (string.sub(appPngDir, -4, -1) == "JPEG"))then
            --     appPngDir = string.sub(appPngDir, 1, -5).."jpg"
            -- end
            print("图标", appPngDir)
            if (pathIndex == 0)then
                appPngDir = iCoolFsAppDataStoreDir.."/"..appIsToWriteData.."/"..appPngDir
            else
                appPngDir = iCoolAppDataStoreDir.."/"..appIsToWriteData.."/"..appPngDir
            end
        end
        --同时把app配置信息存储到app配置文件中
        local data = appTableDataInit()
        if (type(data) == "table")then
            --获取app的位置以及要显示在哪个界面
            local appPox_X, appPox_Y, appScr = appsAutoLayout()
            if (appPox_X)then
                --把app信息的表插入app信息总表中
                --其中 appIsToWriteData 为 app 的根文件夹
                table.insert(data, {appName, appPngDir, appPox_X, appPox_Y, appScr, "storeApp", appIsToWriteData})
            end
            --把信息转为json格式
            local jsonData = json.encode(data)
            --打开app信息文件写入json数据
            local appfd = io.open("/iCool/config.json", "w")
            appfd:write(jsonData)
            appfd:close()
            --发送下载完成的消息
            iCoolStoreAppDling = 1
            --通知下载进度条结束
            _G.inAppDling = 1
        else
            print("app配置文件存在问题")
        end
    end
end
getAppJsonInfoVar = getAppJsonInfo
local temBool = true
local appDlSignal = nil
local function appDlingSignal()
    if (iCoolStoreAppDling == 0 and temBool)then
        temBool = false
        appdowningCont = lvgl.cont_create(lvgl.scr_act(), nil)
        lvgl.obj_set_size(appdowningCont, 400, 80)
        lvgl.obj_align(appdowningCont, nil, lvgl.ALIGN_IN_TOP_MID, 0, 10)
        lvgl.obj_add_style(appdowningCont, lvgl.CONT_PART_MAIN, store_nCSigContStyle)
        lvgl.obj_set_state(appdowningCont, lvgl.STATE_DISABLED)
        appDlSignal = lvgl.label_create(appdowningCont, nil)
        lvgl.label_set_text(appDlSignal, "正在下载中，请勿操作iCool手机")
        lvgl.obj_align(appDlSignal, appdowningCont, lvgl.ALIGN_CENTER, 0, 0)
        lvgl.obj_add_style(appDlSignal, lvgl.LABEL_PART_MAIN, store_nCSigFontStyle)
        lvgl.obj_set_state(appDlSignal, lvgl.STATE_DISABLED)
    elseif (iCoolStoreAppDling == 1) then
        temBool = true
        lvgl.obj_del(appdowningCont)
        --停止循环定时器
        sys.timerStop(appDlId)
        iCoolStoreAppDling = -1
        appDlId = nil
    elseif iCoolStoreAppDling == 2 then
        temBool = true
        sys.timerStop(appDlId)
        iCoolStoreAppDling = -1
        appDlId = nil
        lvgl.label_set_text(appDlSignal, "内存不足，请确认内存充足后再下载")
        sys.timerStart(function() lvgl.obj_del(appdowningCont) end, 1000)
    end
end
----------------------------------------------------------------------------------------
--对外调用的数据回调函数
----------------------------------------------------------------------------------------
--app数据接收  
--whichApp      下载的app压缩包的网站名称  
function appDataRecieve(whichApp)
    --判断是否sd卡初始化成功
    if (_G.fsInitSuccessed)then
        --app正在下载中
        temBool = true
        iCoolStoreAppDling = 0
        --设置定时器去判断是否处于下载中
        appDlId = sys.timerLoopStart(appDlingSignal, 20)
        --获取app压缩包
        appIsToWriteData = whichApp
        http.request("GET", appUrlHead.."20211013192126256_PacMan2.zip"
        ,nil,nil,nil,nil,appDataDlSuccess)
    end
end