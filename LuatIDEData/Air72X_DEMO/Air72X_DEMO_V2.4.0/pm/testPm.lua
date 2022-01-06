--- 模块功能：休眠功能测试.
-- @author openLuat
-- @module pm.testPm
-- @license MIT
-- @copyright openLuat
-- @release 2018.03.27

module(...,package.seeall)

require"pm"

--[[
关于休眠这一部分的说明：
目前的休眠处理有两种方式，
一种是底层core内部，自动处理，例如tcp发送或者接收数据时，会自动唤醒，发送接收结束后，会自动休眠；这部分不用lua脚本控制
另一种是lua脚本使用pm.sleep和pm.wake自行控制，例如，uart连接外围设备，uart接收数据前，要主动去pm.wake，这样才能保证前面接收的数据不出错，当不需要通信时，调用pm.sleep；如果有lcd的项目，也是同样道理
不休眠时功耗至少30mA左右
休眠后，飞行模式不到1mA，非飞行模式的功耗还没有数据（后续补充）
如果不是故意控制的不休眠，一定要保证pm.wake("A")了，有地方去调用pm.sleep("A")
]]


pm.wake("A") --执行本句后，A唤醒了模块
pm.wake("A") --执行本句后，A重复唤醒模块，实际上没什么变化
pm.sleep("A") --执行本句后，A休眠了模块，lua部分已经没有功能唤醒模块了，模块是否休眠由core决定

pm.wake("B") --执行本句后，B唤醒了模块
pm.wake("C") --执行本句后，C唤醒了模块
pm.sleep("B") --执行本句后，B休眠了模块，但是lua部分还有C已经唤醒了模块，模块并不会休眠
pm.sleep("C") --执行本句后，C休眠了模块，lua部分已经没有功能唤醒模块了，模块是否休眠由core决定


