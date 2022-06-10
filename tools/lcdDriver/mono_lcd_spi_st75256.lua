--- 模块功能：ST75256驱动芯片LCD命令配置
-- @author openLuat
-- @module ui.mono_std_spi_ST75256
-- @license MIT
-- @copyright openLuat
-- @release 2021.09.29
--[[
注意：disp库目前支持I2C接口和SPI接口的屏，此文件的配置，硬件上使用的是LCD专用的SPI引脚，不是标准的SPI引脚
硬件连线图如下：
Air模块			LCD
GND-------------地
LCD_CS----------片选
LCD_CLK---------时钟
LCD_DATA--------数据
LCD_DC----------数据/命令选择
VDDIO-----------电源
LCD_RST---------复位
]]

module(...,package.seeall)
require"pm"
require"utils"
require"common"
pm.wake("lcd")
--[[
函数名：init
功能  ：初始化LCD参数
参数  ：无
返回值：无
]]

initcmd_table={
    0x00020030,
    0x00020094,
    
    0x00020031,
    0x000200D7,
    0x0003009F,
    
    
    0x00020032,
    0x00030000,
    0x00030001,
    0x00030003,

   
    0x00020020,
    0x00030001,
    0x00030003,
    0x00030005,
    0x00030007,
    0x00030009,
    0x0003000B,
    0x0003000D,
    0x00030010,
    0x00030011,
    0x00030013,
    0x00030015,
    0x00030017,
    0x00030019,
    0x0003001B,
    0x0003001D,
    0x0003001F,

    0x00020030,--调用
    0x00020075,
    0x00030000,
    0x00030028,
    
    0x00020015,
    0x00030000,
    0x000300FF,



    0x000200BC,--刷屏方向
    0x00030003,
    0x000300A6,
    --A6

    0x000200CA,
    0x00030000,
    0x0003009F,
    0x00030020,
    

    0x000200F0,
    0x00030010,

    0x00020081,
    0x00030038,
    0x00030004,


    0x00020020,
    0x0003000B,

    0x00010065,

    0x000200AF,

    0x00020015,--x
    0x00030000,
    0x000300FF,

    0x00020075,--y
    0x00030000,
    0x00030015,
    
    0x00020030,
    0x0002005C,
}
for i=0,20,1 do
    for j=0,255,1 do
    table.insert(initcmd_table,0x00030000)
    end
end



local function init()
    local para =
    {   
        id_reg = 0x04,
    	id_value = 0x7c89f0,
        width = 256, --分辨率宽度，128像素；用户根据屏的参数自行修改
        height = 160, --分辨率高度，160像素；用户根据屏的参数自行修改
        bpp = 1, --位深度，彩屏仅支持16位
        bus = disp.BUS_SPI4LINE, --LCD专用SPI引脚接口，不可修改
        xoffset = 0, --X轴偏移
        yoffset = 0, --Y轴偏移
        freq = 13000000, --spi时钟频率，支持110K到13M（即110000到13000000）之间的整数（包含110000和13000000）
        pinrst = pio.P0_6, --reset，复位引脚
        pinrs = pio.P0_1, --rs，命令/数据选择引脚
        --初始化命令
        --前两个字节表示类型：0001表示延时，0000或者0002表示命令，0003表示数据
        --延时类型：后两个字节表示延时时间（单位毫秒）
        --命令类型：后两个字节命令的值
        --数据类型：后两个字节数据的值
        initcmd =initcmd_table,
        --休眠命令
        sleepcmd = {
            0x00020095,
        },
        --唤醒命令
        wakecmd = {
            0x00020094,
        }
    }
    ret = disp.init(para)
    disp.clear()
    disp.update()
end
               
disp.update=function()
    local testd3={ 0x00020015,--x
               0x00030000,
               0x000300FF,

               0x00020075,--y
               0x00030000,
               0x00030015,

               0x00020030,
               0x0002005C,}
 local pic=disp.getframe()
 while true do
        if #testd3>0 then
            data=table.remove(testd3,1)
            disp.write(data)
        else
            break
        end
 end
 for i=1,pic:len() do--发数据
    local data = pic:sub(i,i)
    disp.write(tonumber(string.toHex(data),16) + 0x00030000)
 end
end


--打开背光
--实际使用时，用户根据自己的lcd背光控制方式，添加背光控制代码
--控制SPI引脚的电压域
pmd.ldoset(15,pmd.LDO_VLCD)
init()

-- disp.puttext(common.utf8ToGb2312("扫描失败"),16,8)
-- disp.puttext("123456789ABCDEF",16,24)
-- disp.update()

-- rtos.sleep(2000)
-- disp.clear()
-- disp.update()
-- disp.puttext(common.utf8ToGb2312("扫描失败"),0,8)
-- disp.puttext("123456789ABCDEF",0,24)
-- disp.update()