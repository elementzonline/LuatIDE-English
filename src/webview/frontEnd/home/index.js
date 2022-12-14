var isDisNewProjectHtml = false;
var isDisOpenProjectHtml = false;
// 宣传图片类表
const advImgList = [
  ["newImg1", "newUrl1"],
  ["newImg2", "newUrl2"],
  ["newImg3", "newUrl3"],
]

/* 隐藏新建工程[全局函数多文件调用] */
function gl_hideNewProject() {
  $(".newProjectHtml").hide();
}


/* 隐藏导入工程[全局函数多文件调用] */
function gl_hideOpenProject() {
  $(".openProjectHtml").hide();
}


/* 新建工程和打开工程 */
$(".newProject").on("click", function () {
  $(".newProjectHtml").show();
  gl_newProjectInit();
});

$(".openProject").on("click", function () {
  vscode.postMessage({
    command: 'openProjectWebview'
  });
});
$(".openLuatToolsProject").on("click", function () {
  vscode.postMessage({
    command: 'importLuatToolsProject'
  });
});


/* 技术支持 */
$(".header-publicBtn1").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "Tool source code"
  });
});
$(".footerBtn1").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "Tool source code"
  });
});
$(".header-publicBtn2").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "QQ"
  });
});
$(".footerBtn2").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "QQ"
  });
});
$(".header-publicBtn3").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "contact us"
  });
});
$(".footerBtn3").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "contact us"
  });
});
$(".header-publicBtnWiki").on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "LuatOSWiki"
  });
});
// 发送图片链接网站给vscode
$(function () {
  $('body').on('click', '.newUrl', function (item) {
    vscode.postMessage({
      command: "openExternalWeb",
      text: $(this).arrt("href")
    });
  });
})

/*****************************登录 ↓******************************/
/* 登录头像 */
$(".userBtn").on("click", function () {
  $(".loginModal").show();
});

/* 取消登录按钮 */
$(".login-cancel").on("click", function () {
  $(".loginModal").hide();
  clearLoginData();
});

/* 清除登录数据 */
function clearLoginData() {
  $("#username").val(null);
  $("#password").val(null);
}

//登录
$(".btLogin").on("click", function () {
  /* 发送登录信息 */
  // handleSubmit();
});

//没有账号按钮
let noAccBtn = $(".btNoAcc");
noAccBtn.on("click", function () {
  vscode.postMessage({
    command: "openExternalWeb",
    text: "注册"
  });
});

//忘记密码按钮
$(".btforgetPw").on("click", function () {
  clearLoginData();
  $(".loginModal").hide();
  $(".forgetModal").show();
  // TODO
  // handleOpenReset(true);
});
/*****************************登录 ↑******************************/

/*****************************忘记密码 ↓******************************/
function clearForgetPwData() {
  $("#forgetPw-phone").val(null);
  $("#forgetPw-code").val(null);
  $("#forgetPw-newPw").val(null);
  $("#forgetPw-verPw").val(null);
}

//发送验证码按钮
$(".forgitPw-sentVerCode").on("click", function () {
  // TODO发送验证码
  // handleCaptcha()
})

//取消重置密码按钮
$(".forgitPw-cancel").on("click", function () {
  clearForgetPwData()
  $(".forgetModal").hide();
  $(".loginModal").show();
})

//重置密码按钮
$(".forgitPw-sure").on("click", function () {
  // TODO发送重置密码命令
  // handleOpenReset(false);
})
/*****************************忘记密码 ↑******************************/

/*****************************数据交互 ↓******************************/
let host = 'http://114.55.242.59:10067';

function Alert(msg) {
  vscode.postMessage({
    command: "Alert",
    text: {
      "msg": msg,
    }
  });
}


//提交登录信息
function handleSubmit() {
  let dataObj = new FormData();
  let username = $("#username").val();
  let password = $("#password").val();
  if (!username.trim() || !password.trim()) {
    Alert('名称或密码不能为空！');
    return false;
  }
  dataObj.append("username", username)
  dataObj.append("password", password)
  var url = host + "/api/auth/login";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.send(dataObj);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let res = JSON.parse(xhr.responseText)
        if (res && res.code == 0) {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user_info', res.data.user);
          clearLoginData();
          vscode.postMessage({
            command: "user_token",
            text: {
              "user_token": res.data.token,
              "user_info": res.data.user,
            }
          })
          Command('login_success');
        }
      } else {
        var msg = null;
        try {
          msg = JSON.parse(xhr.responseText)["msg"];
          Alert(msg);
        } catch (e) {
          msg = "unknow";
        }
      }
    }
  };
}

let phone = $("#forgetPw-phone");
let code = $("#forgetPw-code");
let passwd1 = $("#forgetPw-newPw");
let passwd2 = $("#forgetPw-verPw");

/* 打开重置模态框 */
function handleOpenReset(status) {
  if (!status) {
    //清空表单内容
    phone.val(null);
    code.val(null);
    passwd1.val(null);
    passwd2.val(null);
  } else {
    event.stopPropagation();
  }
}

/* 发送验证码 */
function handleCaptcha() {
  let dataObj = new FormData();
  let phone = $("#forgetPw-phone").val();
  if (!phone.trim()) {
    Alert("手机号码不能为空");
    return false;
  }
  if (!(/^1[3|4|5|7|8][0-9]{9}$/.test(phone.trim()))) {
    Alert("手机号码有误，请重填");
    return false;
  }
  dataObj.append("phone", phone)
  var url = host + "/api/auth/captcha";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.send(dataObj);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let res = JSON.parse(xhr.responseText)
        if (res && res.code == 0) {
          Alert('验证码已发送！');
        }
      } else {
        var msg = null;
        try {
          msg = JSON.parse(xhr.responseText)["msg"];
          Alert(msg);
        } catch (e) {
          msg = "unknow";
        }
      }
    }
  };
}

/* 重置密码 */
function handleResetPasswords() {
  let dataObj = new FormData();
  let tPhone = phone.val();
  let tCode = code.val();
  let password1 = passwd1.val();
  let password2 = passwd2.val();
  if (password1.trim() !== password2.trim()) {
    Alert('两次密码不一致');
    return false;
  }
  if (password1.length < 6) {
    Alert('密码需大于六位');
    return false;
  }
  dataObj.append("phone", tPhone)
  dataObj.append("new_password", password1)
  dataObj.append("verification_code", tCode)
  var url = host + "/api/auth/reset_password";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.send(dataObj);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let res = JSON.parse(xhr.responseText)
        if (res && res.code == 0) {
          Alert('修改成功！')
          //关闭模态框
          handleOpenReset(false);
          barBtn.show();
          $(".forgetPw").hide();
        }
      } else {
        var msg = null;
        try {
          msg = JSON.parse(xhr.responseText)["msg"];
          Alert(msg);
        } catch (e) {
          msg = "unknow";
        }
      }
    }
  };
}

/* 发送吐槽信息 */
function sentComment() {
  let dataObj = new FormData();
  let temPhone = $(".feedback-phone").val();
  let comment = $(".feedback-input").val();
  if (!temPhone.trim()) {
    Alert("手机号码不能为空");
    return false;
  }
  if (!(/^1[3|4|5|7|8][0-9]{9}$/.test(temPhone.trim()))) {
    Alert("手机号码有误，请重填");
    return false;
  }
  dataObj.append("comment", comment);
  var url = host + "/api/auth/comment";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.send(dataObj);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let res = JSON.parse(xhr.responseText);
        if (res && res.code == 0) {
          Alert('评论成功！');
          barBtn.show();
          setTimeout(function () {
            $(".feedback-box").hide();
          }, 200);
        }
      } else {
        var msg = null;
        try {
          msg = JSON.parse(xhr.responseText)["msg"];
          Alert(msg);
        } catch (e) {
          msg = "unknow";
        }
      }
    }
  };
}

/* 获取 IDE 的版本号 */
function gl_getIdeVersion(version) {
  $(".ideVersion").text(version);
}

/* 获取最新的新闻广告信息 */
function gl_getAdvertisementInfo(newsInfo) {
  let index = 0;
  for (let key in newsInfo) {
    if (advImgList[index][0]) {
      // 获取图片和图片链接对象
      let temImg = $("." + advImgList[index][0]);
      let temImgUrl = $("." + advImgList[index][1]);
      temImg.attr("src", newsInfo[key][0]);
      temImgUrl.attr("href", newsInfo[key][1]);
      index += 1;
    }
  }
}
