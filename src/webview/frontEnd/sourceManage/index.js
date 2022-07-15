//激活 VsCode 通信
const vscode = acquireVsCodeApi();

/* 发送界面已准备完毕给vscode */
vscode.postMessage({
    command: "homePageReady"
});
let testdata = {};
let downloadSourceList = [];
let unInstallSourceList = [];
let testvue;
/* 获取vscode端发送的数据 */
window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
        case 'ttt':
          testvue.loadData();
          break;
        case 'hello2':
          testvue.tableData = message.text;
          break;
        case 'hello':
            testdata = message.text;
            testvue = new Vue({
              el: '#app',
              data: {
                  tableData:testdata,
                  downloadSourceLength:0,
                  unInstallSourceLength:0
         },
          created() {},
          methods: {
            downloadSourceClick(){
              // 清除所有勾选框
              if (this.downloadSourceLength!==0) {
                vscode.postMessage(
                  {
                    command:"downloadSourceList",
                    text:downloadSourceList
                  }
                );
                this.$refs.multipleTable.clearSelection();
                // this.tableData=[{
                //   id:'工具链11',
                //   name:'888',
                //   size: '',
                //   state:'',
                //   desc: '',    
                // }];
              // this.downloadSourceLength = 1;
              // this.unSourceLength =2;
                  
                // this.$forceUpdate();
              }
            },
            unInstallSourceClick(){
              if (this.unInstallSourceLength!==0) {
                vscode.postMessage(
                  {
                    command:"uninstallSourceList",
                    text:unInstallSourceList
                  }
                );
                this.$refs.multipleTable.clearSelection();
              }
            },
            selectable(row,index){
                const list2 = ["板级支持包","工具链"];
                if(list2.indexOf(row.name)!==-1 || index===0){
                    return false;
                }else{
                  return true;
                }
              },
            setChildren(children, type) {
              // 编辑多个子层级
              children.map(j => {
                this.toggleSelection(j, type);
                if (j.children) {
                  this.setChildren(j.children, type);
                }
              });
            },
            // 选中父节点时，子节点一起选中取消
            select(selection, row) {
              // const downloadSourceList = [];
              // const unInstallSourceList = [];
              console.log("length",selection.length);
              // selectionHandler(selection,downloadSourceList,unInstallSourceList);
              const hasSelect = selection.some(el => {
                return row.id === el.id;
              });
              if (hasSelect) {
                if (row.children) {
                  // 解决子组件没有被勾选到
                  this.setChildren(row.children, true);
                }
              } else {
                if (row.children) {
                  this.setChildren(row.children, false);
                }
              }
            },
            toggleSelection(row, select) {
              if (row) {
                this.$nextTick(() => {
                  this.$refs.multipleTable &&
                    this.$refs.multipleTable.toggleRowSelection(row, select);
                });
              }
            },
            // 选择全部
            selectAll(selection) {
              // tabledata第一层只要有在selection里面就是全选
              const isSelect = selection.some(el => {
                const tableDataIds = this.tableData.map(j => j.id);
                return tableDataIds.includes(el.id);
              });
              // tableDate第一层只要有不在selection里面就是全不选
              const isCancel = !this.tableData.every(el => {
                const selectIds = selection.map(j => j.id);
                return selectIds.includes(el.id);
              });
              if (isSelect) {
                selection.map(el => {
                  if (el.children) {
                    // 解决子组件没有被勾选到
                    this.setChildren(el.children, true);
                  }
                });
              }
              if (isCancel) {
                this.tableData.map(el => {
                  if (el.children) {
                    // 解决子组件没有被勾选到
                    this.setChildren(el.children, false);
                  }
                });
              }
            },
            selectionChange(selection) {
              downloadSourceList = [];
              unInstallSourceList = [];
              console.log(selection);
              for (let i = 0; i < selection.length; i++) {
                const element = selection[i];
                if (element.state==="Not Installed") {
                  downloadSourceList.push(element);
                }
                else if(element.state==="Installed"){
                  unInstallSourceList.push(element);
                }
              }
              this.downloadSourceLength = downloadSourceList.length;
              this.unInstallSourceLength = unInstallSourceList.length;
            },
            async loadSearch(row, treeNode, resolve) {
              const loadData = {
                id:'工具链11',
                name:'工具链',
                size: '',
                state:'',
                desc: '',
                children: [{
                      id:'ui设计器11',
                      name:'UI设计器',
                      size: '',
                      state:'Installed',
                      desc: ''
                  },
                  {
                      id:'ui设计器12',
                      name:'NDK',
                      size: '',
                      state:'Not Installed',
                      desc: ''
                  }
                  ]
                  };
              await setTimeout(() => {
                resolve(loadData);
              }, 2000);
              await this.setNewRowData(row, loadData);
            },
            setNewRowData(row, loadData) {
              row.children = loadData;
            },
          }
          });
            break;
    
        default:
            break;
    }
});
