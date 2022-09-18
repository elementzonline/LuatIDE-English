## Instructions for use
Luatide provides a powerful integrated development environment for Luat developers. The main functions are as follows:
-LUA code intelligent auxiliary and grammar inspection
-Profile fast download running module code
-Card the flexible single -step debugging module code
-The strong multi -engineering management function
-The rich log display function
-AT instruction interactive environmental function
-The comprehensive code example and demo program


## New Construction

& emsp; & emsp; The new project is the cornerstone of the follow -up operation of Luata. Luata supports users to create a new blank project from scratch. Users can click the new project button in the project wizard management panel to enter. At present, the configuration function items include six items including engineering name, engineering path, module model, LIB library selection, core file selection, and sample engineering selection.

& emsp; & emsp; of which engineering name, engineering path, and module model are required. Users at the project name can type the name of the new project. Users at the project path can choose the location of the project established. Users at the module model can choose to operate operations. Module model.

& emsp; & emsp; lib library selection, core file, and sample engineering check are options. Users do not choose to automatically use the default library and Core files. After setting, the project will be displayed in the user project list.

### 1. New blank project

& emsp; & emsp; The minimum new blank engineering requires users to choose specific engineering paths, custom engineering names, and engineering module models to create Luatide engineering containing main.lua in the specified location.

& emsp; & emsp; When you don't know what you want to do, you can choose a new blank project. Just fill in the corresponding information, the system will create the simplest HelloWorld project, there is nothing in it, only HelloWorld.

! [New blank engineering] (https://cdn.openluat-luatcommunity.openluat.com/images/202202161717588_code_frqnycolea.gif "new blank project"))))) New blank project)

### 2. New example engineering

& emsp; & emsp; New example project options, in addition to filling in all the information required for blank engineering, there is an additional option that is the ** example selection **.

! [Image.png] (https://cdn.openluat-luatcommmunity.openluat.com/images/2022022222232752_image.png))

& emsp; & emsp; Select the example system that you need, and the system will copy an example at the corresponding position. Users can directly modify the example program and complete their own application logic design.

! [Based on DEMO-based New Project] (https://cdn.openluat-luatcommmunity.openluat.com/images/20220216171844719_code_mqpspw8ki1.gif ") New Project New Project))


## Open the project

& emsp; & emsp; Luatide supports the rapid introduction of the user's existing projects to automatically generate projects to achieve rapid secondary development. Opening the project can be used in the following situations.

* Code developed using luattools
* Engineering documents shared by others (code of others)
*You need to change your own code to change a computer/change the path ** Use

& emsp; & emsp; click to open the project button
! [Image.png] (https://cdn.openluat-luatcommmunity.openluat.com/images/202202222235335_image.png))

& emsp; & emsp; just choose the corresponding code path when you open it to complete the project import. After the introduction is completed, it will show the successful project that has been introduced in the user engineering tab.

! [Image.png] (https://cdn.openluat-luatcommunity.openluat.com/images/202202222210317149_image.png))

! [Introduce LuAatide's configuration project .gif] (https://cdn.openluat-luatcommunity.openluat.com/images/202202222222211936453_In import luatide configuration project .gif)

## activation project

& emsp; & emsp; Luatide has designed a multi -engineering management system, and users can manage multiple projects at the same time. Because multiple projects exist at the same time, at the same time, they can only operate a certain project.

& emsp; & emsp; So we introduced the concept of activity engineering, and users need to complete the activation operation of the project before operating a specified project. Click the activation button on the target engineering in the user engineering tab to specify the current project as the activity engineering.
! [Image.png] (https://cdn.openluat-luatcommmunity.openluat.com/images/202202222222703996_image.png))

& emsp; & emsp; The activated engineering will be displayed in the activity engineering column, and users can directly operate the activation engineering (** Unreactive projects cannot change the project attributes **).

! [Image.png] (https://cdn.openluat-luatcommunity.openluat.com/images/202202222222754774_image.png))


& emsp; & emsp; gif demonstration see the figure below

! [Activation Project] (https://cdn.openluat-luatcommunity.openluat.com/images/20220216161723825_code_5FB14rhuti.gif "activation project")) activation project ")) activation project")

## engineering configuration

& emsp; & emsp; When the user finds that there is a problem with the core or lib selected when building the project, then you need to modify the configuration information of the project.

& emsp; & emsp; click the gear button on the right side of the activity project to support the adding files, adding folders, configuration Core files, configuration lib library files, configuration module models/simulator, display configuration file and other functions.

! [Image.png] (https://cdn.openluat-luatcommmunity.openluat.com/images/20220216170531326_image.png))

## removal project

& emsp; & emsp; luatide click the removal project button to remove the configuration file to retain the local engineering folder.

! [Remove Project] (https://cdn.openluat-luatcommunity.openluat.com/attachment/20220216172814399_code_nmrk3lb5iz.gif "Remove Project"))

## debugging interaction

### 1. Run

& emsp; & emsp; Luatide supports fast download running module code, which can intelligently analyze the existing base package and code status of the user, and reasonably download the base package and script code. Users can click the LUAT: Run File button or the right -click menu at the open activity engineering script. Click LUAT: Run File to enter.

### 2, debug

& emsp; & emsp; Luatide supports flexible single -step debugging module code. Users can click on the LUAT: Debug file button of the activity project or right -click luat: debug file to enter the debug mode. Support the display module local variables and global variables, and support common debugging operations such as single -step debugging, single -step skipping, single -step jumping, and restart debugging.

! [Flexible debug module code .gif] (https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213620205_ Flexible debug module code.gif)

### 2, AT instructions to send and receive

& emsp; & emsp; Luatide supports to enter the AT instructions in the debug console and display the results in real time. For example, enter the ATI instruction to view the current module bottom package version.

[AT instruction interactive environment .gif] (https://openluat-luatcommunity.oss-cn-hangzhou.aliyuncs.com/attachment/20210712213701406_AT instruction interactive environment .gif)

## Luatos simulator

& emsp; & emsp; Luatide supports the function of the Luatos-AIR simulator. Users can directly run the Luatos-AIR project on the simulator (do not support hardware debugging).

! [icool.gif] (https://cdn.openluat-luatcommunity.openluat.com/attachment/20211025114327369_icool.gif)

## ui designer

& emsp; & emsp; need to prepare UI projects that can run normally, and use LED components to modify the color in the example.

! [be3b0ad.gif] (https://cdn.openluat-luatcommunity.openluat.com/images/202202223204228_be3b0ad.gifif


[to do list]

1. LUAT/Luatos debug in Harmony Liteos

2. Support Linux/Mac.

3. Support and adapt to a variety of module models

5. Support LUA memory dynamic display

6. Code writing supports jumping function

7. Code writing supports suspension display API function

8. Support the module file system read and write


Wait, you can also ask us what you want through the official exchange group or in the warehouse.