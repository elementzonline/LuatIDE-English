let a = [
    "main.lua",
    "ghg.ll",
    "Res\\a.png",
    "Res\\v.png",
    "Res\\t.png",
    "Res\\e.png",
    "Res\\q.png",
    "Res\\jk.png",
    "Res\\UI\\a.lua",
    "Res\\UI\\b.lua",
    "Res\\UI\\v.lua",
    "TTd\\a.png",
    "TTd\\v.png",
    "TTd\\t.png",
    "TTd\\e.png",
    "TTd\\q.png",
    "TTd\\jk.png",
    "TTd\\UI\\a.lua",
    "TTd\\UI\\b.lua",
    "TTd\\UI\\v.lua",
    ".luatide\\json.json",
    ".luatide\\ui"
]

function createDirTree(dirArr) {
    let treeObj = {};
    let index = 0;
    let str;
    dirArr.forEach((e) => {
        if (!e.match(/^\.luatide/)) {
            index += 1;
            str = "f" + index.toString();
            if (e.includes("\\" || e.includes("/"))) {
                let arr = e.split("\\");
                let tem = "";
                for (let i = 0; i < arr.length - 1; i++){
                    let o = arr[i];
                    tem += "." + o;
                    eval("treeObj" + tem + " == undefined ? treeObj" + tem + " = {} : {}");
                }
                eval("treeObj" + tem + "['" + str + "']='" + arr[arr.length - 1] + "'");
            } else {
                treeObj[str] = e;
            }
        }
    });
    return treeObj;
}

console.log('[LOG - ]: ', JSON.stringify(createDirTree(a), null, "\t"));
