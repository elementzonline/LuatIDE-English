## 使用说明
VSCode LuatIDE插件，为luat开发者提供强大的集成式开发环境，主要功能如下：
- lua代码智能辅助及语法检查
- 支持快速下载运行模块代码
- 支持灵活单步调试模块代码
- 强大的多工程管理功能
- 丰富的日志展示功能
- AT指令交互式环境功能
- 完善的代码示例与 demo 程序


### 一、强大的多工程管理功能

#### 1、 工程管理面板
LuatIDE拥有强大的多工程管理功能，支持一键新建空白工程、基于demo新建工程、导入已有历史工程、导入用户已有项目自动生成工程等多样化的工程管理能力。LuatIDE工程管理面板如下图所示：
![image.png](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/images/20210611100652536_image.png)

* 工程管理面板：LuatIDE所有功能管理入口按钮
* 用户工程显示区域：显示用户所有历史新建和导入的工程
* 活动工程显示区域：工程激活后显示区域，后续运行下载、调试均作用于活动工程。
* 示例工程显示区域：示例工程demo显示区域，显示内置所有demo示例。
* 工程管理向导按钮：点击工程管理向导面板按钮打开工程管理界面
* 刷新工作空间按钮：点击刷新工作空间按钮可以在本地文件被修改时同步工程文件。

![image.png](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/images/20210611131432798_image.png)
#### 2、新建工程
创建工程是LuatIDE后续操作的基石，LuatIDE支持用户从零开始新建空白工程，用户点击工程向导管理面板内的新建工程按钮即可进入。目前支持配置功能项包括工程名称、工程路径、模块型号、lib库选择、core文件选择、示例工程选择等六项。其中工程名称、工程路径、模块型号为必填项，工程名称处用户可键入新建工程的名称，工程路径处用户可选择所建立工程的路径位置，模块型号处用户可选择将要操作的模块型号。Lib库选择、core文件、示例工程勾选均为可选项，用户不选择将自动使用默认库及core文件。设置完毕后该工程将展示在用户工程列表中。（激活至活动工程后可展开具体形式的活动工程）

* 新建空白工程
新建空白工程最低要求用户选择具体的工程路径、自定义工程名称、工程模块型号后即可在指定位置创建含有main.lua的LuatIDE工程。
![新建空白工程.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213313952_新建空白工程.gif)

* 基于demo新建工程
基于demo新建工程会通过指定模块型号后出现对应的demo列表，选择某个具体的demo，LuatIDE会将该demo所拥有的脚本和资源文件复制进入新建的LuatIDE工程。
![基于demo新建工程.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213339470_基于demo新建工程.gif)
#### 3、导入工程
为支持用户快速管理已配置工程及方便用户快速将已有项目转入LuatIDE进行工程管理，LuatIDE支持将用户已有项目快速导入自动生成工程，实现快速二次开发。用户选择已配置LuatIDE工程(含有luatide_project.json配置文件)的文件夹可直接导入。选择未配置LuatIDE工程的已有项目，可在选择已有项目的文件夹后依据提示自定义配置该项目为LuatIDE工程。
* 导入LuatIDE已配置工程
![导入LuatIDE已配置工程.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213358891_导入LuatIDE已配置工程.gif)

* 导入已有项目自动生成工程

![导入本地项目自动生成LuatIDE工程.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213430276_导入本地项目自动生成LuatIDE工程.gif)

#### 4、激活工程
LuatIDE支持用户快速激活工程，点击用户工程区域或者示例DEMO区域工程文件夹到活动工程。
![激活一个工程.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213526183_激活一个工程.gif)

#### 5、移除工程
LuatIDE点击移除工程按钮只会移除配置文件，保留本地工程文件夹。
![移除一个工程.gif.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213537037_移除一个工程.gif.gif)

#### 6、删除工程
LuatIDE点击删除工程按钮会同时移除配置文件并删除本地工程文件夹。
![删除一个工程.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213550978_删除一个工程.gif)

#### 7、快速新建文件
LuatIDE支持一键快速新建自定义文件，用户点击快速新建文件按钮可直接新建undefined文件，按ctrl+s键可在任意位置新建任意格式的文件。
![快速新建自定义文件.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210713103631379_快速新建自定义文件.gif)

#### 8、永久删除工程内文件夹或文件
LuatIDE支持实时同步删除活动工程及用户工程内文件夹及文件夹，点击想要删除的工程文件夹或文件，确认删除即可。(注：删除文件夹或文件不可恢复，请谨慎操作)
![永久删除工程内文件夹或文件.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210713104254377_永久删除工程内文件夹或文件.gif)

#### 9、工程快速添加文件或文件夹
LuatIDE支持实时同步添加活动工程及用户工程内文件夹及文件夹，用户在想要导入的目录点击导入文件至活动工程按钮，然后选择导入文件或文件夹即可将想要导入的文件或文件夹导入至选中目录。
![工程快速新增文件或文件夹.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210713105521014_工程快速新增文件或文件夹.gif)
### 二、活动工程自定义配置功能
LuatIDE增加活动工程自定义配置功能，点击活动工程右侧的齿轮按钮支持添加文件、添加文件夹、配置core文件、配置lib库文件、配置模块型号/模拟器、显示配置文件等功能。

### 三、快速下载运行模块代码功能

LuatIDE 支持快速下载运行模块代码，可智能分析用户现有底包及代码状态，合理下载底包及脚本代码。用户可点击活动工程的Luat:Run File按钮或者在打开的活动工程脚本右键菜单点击Luat:Run File即可进入。

![快速下载模块代码.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213605532_快速下载模块代码.gif)

### 四、支持灵活单步调试模块代码
LuatIDE 支持灵活单步调试模块代码，用户可点击活动工程的Luat:Debug File按钮或者在打开的活动工程脚本右键菜单点击Luat:Debug File即可进入调试模式。支持显示模块局部变量及全局变量，并支持单步调试、单步跳过、单步跳出、重启调试等常见调试操作。

* 单步调试

![灵活调试模块代码.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213620205_灵活调试模块代码.gif)

* 重启调试

![重启调试模块代码.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213631118_重启调试模块代码.gif)

### 五、丰富的日志展示功能
LuatIDE支持丰富的日志展示功能，用户可以在任务终端实时观看插件运行日志及通过调试控制台查看lua脚本日志。
![重启调试模块代码.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213647180_重启调试模块代码.gif)
### 六、AT指令交互式环境
LuatIDE支持在调试控制台输入at指令并实时显示结果，如输入ati指令查看当前模块底包版本。
![AT指令交互式环境.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213701406_AT指令交互式环境.gif)
### 七、LuatIDE登录功能
LuatIDE为更好的服务用户，开放登录功能，用户可使用erp账号进行登录，后续将基于登录功能推出系列实用功能，敬请期待。
![LuatIDE快速登录.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210713105836259_LuatIDE快速登录.gif)
### 八、LuatIDE模拟器功能
LuatIDE支持模拟器功能，目前支持通过选择Icool项目，同时将模块型号切换为模拟器，即可体验模拟器功能
![icool.gif](https://cdn.openluat-luatcommunity.openluat.com/attachment/20211025114327369_icool.gif)

[to do list]

1、 支持鸿蒙（harmony）LiteOS的Luat/LuatOS调试

2、 支持Linux/mac端。

3、 支持适配多种模块型号

5、 支持lua内存动态显示

6、 代码编写支持跳转功能

7、 代码编写支持悬停显示api功能

8、 支持模块文件系统读写


等等，您也可以通过官方交流群或仓库内提issue向我们提出您想要的功能。