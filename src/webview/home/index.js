
/* 激活 VsCode 通信 */
const vscode = acquireVsCodeApi();


/* 新建工程和打开工程 */
$(".newProject").on("click", function () {
  vscode.postMessage({
      command: 'openNewProjectWebview'
  });
});

$(".openProject").on("click", function () {
  vscode.postMessage({
      command: 'openProjectWebview'
  });
});

/*****************************登录 ↓******************************/
/* 登录 */
$(".userBtn").on("click", function () {
  $(".loginModal").show();
});

/* 取消登录按钮 */
$(".btCancel").on("click", function () {
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
  handleSubmit();
})

//没有账号按钮
let noAccBtn = $(".btNoAcc");
noAccBtn.on("click", function () {
  // TODO打开网页链接
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
  })
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

/* 改变主题样式 */ 
function changeThemeColor(style){
  if (style === "light"){
    document.documentElement.style.setProperty("--default-bgColor", 'white');
    document.documentElement.style.setProperty("--default-fontColor", 'black');
    document.documentElement.style.setProperty("--default-borderColor", '2px solid black');
    document.documentElement.style.setProperty("--default-hoverColor", 'rgb(18, 194, 141)');
    document.documentElement.style.setProperty("--default-modalBgColor", 'rgb(255, 255, 255, 0.8)');
  }else{
    document.documentElement.style.setProperty("--default-bgColor", 'rgb(37, 37, 38)');
    document.documentElement.style.setProperty("--default-fontColor", 'white');
    document.documentElement.style.setProperty("--default-borderColor", '2px solid white');
    document.documentElement.style.setProperty("--default-hoverColor", 'rgb(15, 204, 109)');
    document.documentElement.style.setProperty("--default-modalBgColor", 'rgb(0, 0, 0, 0.5)');
  }
}


/* 获取vscode端发送的数据 */
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.command) {
    case "switchTheme":
      changeThemeColor(message.text);
      break;
    case "loginVerifyData":
      break;
    case "openNewProjectWebview":
      break;
    case "openProjectWebview":
      break;
    case "":
      break;
    default:
      break;
  }
});