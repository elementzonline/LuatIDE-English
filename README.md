## 使用说明
LuatIDE，为luat开发者提供强大的集成式开发环境，主要功能如下：
- lua代码智能辅助及语法检查
- 支持快速下载运行模块代码
- 支持灵活单步调试模块代码
- 强大的多工程管理功能
- 丰富的日志展示功能
- AT指令交互式环境功能
- 完善的代码示例与 demo 程序


## 新建工程

&emsp;&emsp;新建工程是LuatIDE后续操作的基石，LuatIDE支持用户从零开始新建空白工程，用户点击工程向导管理面板内的新建工程按钮即可进入。目前支持配置功能项包括工程名称、工程路径、模块型号、lib库选择、core文件选择、示例工程选择等六项。

&emsp;&emsp;其中工程名称、工程路径、模块型号为必填项，工程名称处用户可键入新建工程的名称，工程路径处用户可选择所建立工程的路径位置，模块型号处用户可选择将要操作的模块型号。

&emsp;&emsp;Lib库选择、core文件、示例工程勾选均为可选项，用户不选择将自动使用默认库及core文件。设置完毕后该工程将展示在用户工程列表中。

### 1、新建空白工程

&emsp;&emsp;新建空白工程最低要求用户选择具体的工程路径、自定义工程名称、工程模块型号后即可在指定位置创建含有main.lua的LuatIDE工程。

&emsp;&emsp;在你不知道自己要干啥的时候可以选择新建空白工程。只需填写相应的信息，系统就会新建一个最简单的HelloWorld工程，里面啥也没有，只有HelloWorld。

![新建空白工程](https://cdn.openluat-luatcommunity.openluat.com/images/20220216171517588_Code_fRQnYCOLea.gif "新建空白工程")

### 2、新建示例工程

&emsp;&emsp;新建示例工程选项，除了需要填写空白工程所需要的所有信息之外，还有一个额外选项就是就是**示例选择**。

![image.png](https://cdn.openluat-luatcommunity.openluat.com/images/20220222205232752_image.png)

&emsp;&emsp;选择自己需要的示例系程序，系统就会在对应的位置上拷贝一份示例，用户可直接在示例程序上修改，完成自己的应用逻辑设计。

![基于demo新建工程](https://cdn.openluat-luatcommunity.openluat.com/images/20220216171844719_Code_mqPsPW8Ki1.gif "基于demo新建工程")


## 打开工程

&emsp;&emsp;LuatIDE支持将用户已有项目快速导入自动生成工程，实现快速二次开发。打开工程可用于如下几种情况。

* 使用LuatTools开发的代码希望拿到LuatIDE中调试
* 其他人分享的工程文件（别人的代码）
* 自己的代码需要**换一台电脑/换一个路径**使用

&emsp;&emsp;点击打开工程按钮
![image.png](https://cdn.openluat-luatcommunity.openluat.com/images/20220222210235335_image.png)

&emsp;&emsp;打开时只需选择对应的代码路径即可完成工程的导入，导入完成后会在用户工程选项卡中展示已导入成功的工程。

![image.png](https://cdn.openluat-luatcommunity.openluat.com/images/20220222210317149_image.png)

![导入LuatIDE已配置工程.gif](https://cdn.openluat-luatcommunity.openluat.com/images/20220222211936453_导入LuatIDE已配置工程.gif)

## 激活工程

&emsp;&emsp;LuatIDE设计了一套多工程管理的系统，用户可同时管理多个工程。由于多个工程同时存在，但是同一时间又只能对某一个工程进行操作。

&emsp;&emsp;于是我们引入了活动工程的概念，用户在操作某个指定工程前需要先对工程完成激活的操作。点击用户工程选项卡中目标工程上的激活按钮即可指定当前工程为活动工程。
![image.png](https://cdn.openluat-luatcommunity.openluat.com/images/20220222212703996_image.png)

&emsp;&emsp;被激活的工程会展示在活动工程栏目，用户可直接对激活工程进行操作（**未激活的工程是不能更改工程属性的**）。

![image.png](https://cdn.openluat-luatcommunity.openluat.com/images/20220222212754774_image.png)


&emsp;&emsp;GIF演示见下图

![激活工程](https://cdn.openluat-luatcommunity.openluat.com/images/20220216172353825_Code_5FB14rhUTi.gif "激活工程")

## 工程配置

&emsp;&emsp;当用户发现建立工程时选择的core或者lib有问题时，那就需要对工程的配置信息进行修改。

&emsp;&emsp;点击活动工程右侧的齿轮按钮支持添加文件、添加文件夹、配置core文件、配置lib库文件、配置模块型号/模拟器、显示配置文件等功能。

![image.png](https://cdn.openluat-luatcommunity.openluat.com/images/20220216170531326_image.png)

## 移除工程

&emsp;&emsp;LuatIDE点击移除工程按钮只会移除配置文件，保留本地工程文件夹。

![移除工程](https://cdn.openluat-luatcommunity.openluat.com/attachment/20220216172814399_Code_nMrk3Lb5iz.gif "移除工程")

## 调试交互

### 1、运行

&emsp;&emsp;LuatIDE 支持快速下载运行模块代码，可智能分析用户现有底包及代码状态，合理下载底包及脚本代码。用户可点击活动工程的Luat:Run File按钮或者在打开的活动工程脚本右键菜单点击Luat:Run File即可进入。

### 2、调试

&emsp;&emsp;LuatIDE 支持灵活单步调试模块代码，用户可点击活动工程的Luat:Debug File按钮或者在打开的活动工程脚本右键菜单点击Luat:Debug File即可进入调试模式。支持显示模块局部变量及全局变量，并支持单步调试、单步跳过、单步跳出、重启调试等常见调试操作。

![灵活调试模块代码.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213620205_灵活调试模块代码.gif)

### 2、AT指令收发

&emsp;&emsp;LuatIDE支持在调试控制台输入at指令并实时显示结果，如输入ati指令查看当前模块底包版本。

![AT指令交互式环境.gif](https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213701406_AT指令交互式环境.gif)

## LuatOS模拟器

&emsp;&emsp;LuatIDE支持LuatOS-Air模拟器的功能，用户可将LuatOS-Air项目直接运行在模拟器上（不支持硬件调试）。

![icool.gif](https://cdn.openluat-luatcommunity.openluat.com/attachment/20211025114327369_icool.gif)

## UI设计器

&emsp;&emsp;需先准备可正常运行的ui工程，示例中使用LED组件修改颜色。

![be3b0ad.gif](https://cdn.openluat-luatcommunity.openluat.com/images/20220223204004228_be3b0ad.gif)


[to do list]

1、 支持鸿蒙（harmony）LiteOS的Luat/LuatOS调试

2、 支持Linux/mac端。

3、 支持适配多种模块型号

5、 支持lua内存动态显示

6、 代码编写支持跳转功能

7、 代码编写支持悬停显示api功能

8、 支持模块文件系统读写


等等，您也可以通过官方交流群或仓库内提issue向我们提出您想要的功能。