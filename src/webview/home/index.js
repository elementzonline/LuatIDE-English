//vscode全局宏
let Macro = false;

//用户名变量
let userName = $("#username");

//用户名账号提示
userName.on("focus", function () {
    $(this).attr("placeholder", "合宙 ERP 账号");
});
userName.on("blur", function () {
    $(this).attr("placeholder", "");
});

//弹窗bar按钮
let barBtn = $(".bar");
//登录弹窗按钮
let loginBtn = $("a.signinBar");
loginBtn.on("hover", function () {
    $(this).addClass('animateout');
    setTimeout(function () {
        $('a.signinBar').removeClass('animateout');
    }, 750);
});

//点击弹出登录框
loginBtn.on("click", function () {
    barBtn.hide();
    setTimeout(function () {
        $(".login").show();
    }, 400)
});

/*****************************登录 ↓******************************/
//清除登录数据
function clearLoginData() {
    $("#username").val(null);
    $("#password").val(null);
}

//登录
$(".btLogin").on("click", function () {
    // TODO
    handleSubmit();
})

//取消登录按钮
let cancelBtn = $(".btCancel");

cancelBtn.on("click", function () {
    barBtn.show();
    setTimeout(function () {
        $(".login").hide();
    }, 200)
    // TODO
    clearLoginData();
});

//没有账号按钮
let noAccBtn = $(".btNoAcc");

noAccBtn.on("click", function () {
    window.open("http://erp.openluat.com/login");
});

//忘记密码按钮
$(".btforgetPw").on("click", function () {
    $(".login").hide();
    $(".forgetPw").show();
    // TODO
    Macro ? handleOpenReset(true) : {};
    clearLoginData();
})
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
    // TODO
    //发送验证码
    Macro ? handleCaptcha() : {};
})

//取消重置密码按钮
$(".forgitPw-cancel").on("click", function () {
    barBtn.show();
    $(".forgetPw").hide();
    clearForgetPwData()
})

//重置密码按钮
$(".forgitPw-sure").on("click", function () {
    // TODO
    //发送重置密码命令
    Macro ? handleResetPasswords() : function () {
        handleOpenReset(false);
        barBtn.show();
        $(".forgetPw").hide();
    };
})
/*****************************忘记密码 ↑******************************/

/*****************************吐槽 ↓******************************/
//点击弹出吐槽框
$(".feedback").on("click", function () {
    barBtn.hide();
    setTimeout(function () {
        $(".feedback-box").show();
    }, 400)
});

//发送吐槽
$(".feedback-submit").on("click", function () {
    // TODO
    Macro ? sentComment() : {};
})

//取消吐槽
$(".feedback-cancel").on("click", function () {
    barBtn.show();
    setTimeout(function () {
        $(".feedback-box").hide();
    }, 200)
    //清除临时数据
    $(".feedback-phone").val(null);
    $(".feedback-input").val(null);
})
/*****************************吐槽 ↑******************************/

/*添加新闻页面信息*/
function updateNews(data) {
    for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        $(".news" + (i + 1)).attr("src", data[i]);
    }
}

updateNews(["http://cdn.openluat-luatcommunity.openluat.com/images/20210707171204573_luatideproject.png",
    "http://cdn.openluat-luatcommunity.openluat.com/images/20210707171215356_news_02 - \u526f\u672c.jpg",
    "http://cdn.openluat-luatcommunity.openluat.com/images/20210730171736579_v3102.jpg"
]);



/**********************************数据交互***********************************/
let host = 'http://114.55.242.59:10067';

const vscode = acquireVsCodeApi();

function Alert(msg) {
    vscode.postMessage({
        command: "Alert",
        text: {
            "msg": msg,
        }
    })
}
//发送命令
function Command(name) {
    vscode.postMessage({
        command: name,
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

//打开重置模态框
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

//发送验证码
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
                    Alert('验证码已发送！')
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

//重置密码
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
        Alert('密码需大于六位')
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

//发送吐槽信息
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
    dataObj.append("comment", comment)
    var url = host + "/api/auth/comment";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.send(dataObj);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let res = JSON.parse(xhr.responseText)
                if (res && res.code == 0) {
                    Alert('评论成功！')
                    barBtn.show();
                    setTimeout(function () {
                        $(".feedback-box").hide();
                    }, 200)
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