/*
 * @Author: your name
 * @Date: 2022-02-17 16:15:04
 * @LastEditTime: 2022-02-17 16:38:49
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \luatide\src\ndk\ndkConfig.ts
 */

import * as path from 'path';

export let appDataPath: string = path.join(<string>process.env['APPDATA'], "LuatIDE");
export let ndkPath: string = path.join(<string>process.env['APPDATA'], "LuatIDE", "luatos-ndk");
export let ndkExamplePath: string = path.join(<string>process.env['APPDATA'], "LuatIDE", "luatos-ndk","example");


