"use strict";
var task = {};
var database = {};
var language = "VN";
var prefixhome;

task.submitLogin = function() {
    var domain = document.getElementById("domain_input").value;
    window.domain = domain + "/carddone/";
    window.domainUser_avatars = domain + "/user_avatars/";
    window.domainGoup_avatars = domain + "/carddone/" + "/group_avatars/";
    window.domainCompany_logo = domain + "/company_logo/";
    var x = document.getElementById("username_input");
    var y = document.getElementById("password_input");
    var rememberme = document.getElementById("rememberme").checked;
    if ((x.value.trim() == "") || (y.value.trim() == "")) {
        ModalElement.alert({
            message: task.getLanguage("username_pass_is_empty")
        });
        return;
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "card_safelogin.php",
        params: [
            {name: "username", value: x.value.trim()},
            {name: "password", value: y.value.trim()},
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    window.session = message.substr(2);
                    if (rememberme) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({name:"getUserToken"}));
                        function GetToken(message){
                            var data = message.data;
                            if (data.name === "getUserToken"){
                                console.log(data.value);                                
                                window.userToken = data.value;
                                FormClass.api_call({
                                    url: "card_newlogin_save.php",
                                    params: [
                                        {name: "localString", value: window.userToken}
                                    ],
                                    func: function(success, message){
                                        if (success){
                                            if (message.substr(0,2) == "ok"){
                                                task.loadDatabase();
                                            }
                                            else {
                                                ModalElement.alert({message: message});
                                            }
                                        }
                                        else {
                                            ModalElement.alert({message: message});
                                        }
                                    }
                                });
                                window.removeEventListener("message",GetToken)
                            }
                        }
                        window.addEventListener("message", GetToken);
                    }
                    else {
                        task.loadDatabase();
                    }
                }
                else {
                    switch (message) {
                        case "password_incorrect":
                        document.getElementById("password_input").value = "";
                        ModalElement.alert({
                            message: task.getLanguage("password_incorrect"),
                            func: function(){
                                document.getElementById("password_input").focus();
                            }
                        });
                        break;
                        case "logged":
                        ModalElement.alert({
                            message: task.getLanguage("logged"),
                            func: function(){
                                task.loadDatabase();
                            }
                        });
                        break;
                        case "user_not_available":
                        ModalElement.alert({
                            message: task.getLanguage("user_not_available")
                        });
                        break;
                        case "username_incorrect":
                        ModalElement.alert({
                            message: task.getLanguage("username_incorrect"),
                            func: function(){
                                document.getElementById("username_input").focus();
                            }
                        });
                        break;
                        case "failed_service":
                        ModalElement.alert({
                            message: task.getLanguage("failed_service")
                        });
                        break;
                        default:
                        ModalElement.alert({
                            message: message
                        });
                        break;
                    }
                }
            }
            else {
                ModalElement.alert({
                    message: message
                });
            }
        }
    });
};

task.getLanguage = function(text, value2){
    switch (language) {
        case "VN":
            switch (text) {
                case "login_your_account":
                    text = "Đăng nhập vào tài khoản của bạn";
                    break;
                case "username":
                    text = "Tên đăng nhập";
                    break;
                case "password":
                    text = "Mật khẩu";
                    break;
                case "forgot_password":
                    text = "Quên mật khẩu?";
                    break;
                case "rememberme":
                    text = "Duy trì đăng nhập";
                    break;
                case "login":
                    text = "Đăng nhập";
                    break;
                case "old_password":
                    text = "Mật khẩu cũ";
                    break;
                case "first_login":
                    text = "Đây là lần đăng nhập đầu tiên, vui lòng đổi mật khẩu của bạn để đảm bảo tính bảo mật.";
                    break;
                case "new_password":
                    text = "Mật khẩu mới";
                    break;
                case "confirm_password":
                    text = "Xác nhận mật khẩu";
                    break;
                case "username_pass_is_empty":
                    text = "Tên đăng nhập và mật khẩu không được để trống!";
                    break;
                case "password_incorrect":
                    text = "Mật khẩu không đúng";
                    break;
                case "logged":
                    text = "Tài khoản này đã được đăng nhập";
                    break;
                case "user_not_available":
                    text = "Tài khoản này đã ngừng hoạt động, để biết thêm chi tiết, vui lòng liên hệ ban quản trị";
                    break;
                case "username_incorrect":
                    text = "Tên đăng nhập không đúng";
                    break;
                case "failed_service":
                    text = "Bạn không được quyền truy cập dịch vụ này";
                    break;
                case "password_not_match":
                    text = "Xác nhận mật khẩu không khớp";
                    break;
                case "save":
                    text = "Lưu";
                    break;
                case "send":
                    text = "Gửi";
                    break;
                case "email_invalid":
                    text = "Email không hợp lệ";
                    break;
                case "invalid":
                    text = "không hợp lệ";
                    break;
                case "reinput_email":
                    text = "Nhập lại email";
                    break;
                case "not_existed_email":
                    text = "Không tồn tại email " + value2 + " trong hệ thống."
                    break;
                case "type_your_email":
                    text = "Nhập địa chỉ email của bạn."
                    break;
                case "please_type_your_email":
                    text = "Vui lòng nhập email của bạn"
                    break;
                case "resend":
                    text = "Gửi lại"
                    break;
                case "An_email_with_link_has_been_sent_to_the_address":
                    text = "Một email với đường link đã được gửi tới địa chỉ"
                    break;
                case "please_check_the_inbox_and_click_the_link_provided_to_reset_password":
                    text = "bạn vui lòng kiểm tra hộp thư và nhấp chuột vào đường link này để thiết lập lại mật khẩu."
                    break;
                case "If_you_don't_find_an_email_in_the_Inbox,_please_check_Junk_mail_box,_Spam_mail_box":
                    text = "Nếu không thấy email trong Inbox, bạn kiểm tra trong hộp thư Junk mail, spam mail hoặc hộp thư mail rác."
                    break;
                case "If_you_still_don't_receive_the_email,_please_click_the_button_below_to_resend_email":
                    text = "Nếu vẫn không thấy email bạn có thể yêu cầu gửi lại email."
                    break;
                case "click_login":
                    text = "Trình duyệt sẽ chuyển sang trang \"Đăng nhập \" trong 5 giây.  Click ";
                    break;
                case "here":
                    text = "vào đây";
                    break;
                case "if_wait_long_time":
                    text = " nếu bạn cảm thấy đợi lâu.";
                    break;
                case "link_expired":
                    text = "Link để thay đổi mật khẩu đã hết hạn, bạn nhập lại email để thay đổi mật khẩu";
                    break;
                case "domain":
                    text = "Link";
                    break;

            }
            break;
        case "EN":
            switch (text) {
                case "login_your_account":
                    text = "Login to your account";
                    break;
                case "username":
                    text = "Username";
                    break;
                case "password":
                    text = "Password";
                    break;
                case "forgot_password":
                    text = "Forgot password?";
                    break;
                case "rememberme":
                    text = "Keep me signed in";
                    break;
                case "login":
                    text = "Login";
                    break;
                case "old_password":
                    text = "Old password";
                    break;
                case "first_login":
                    text = "Please change your password upon first time login for security";
                    break;
                case "new_password":
                    text = "New password";
                    break;
                case "confirm_password":
                    text = "Confirm password";
                    break;
                case "username_pass_is_empty":
                    text = "Username and password can not left blank!";
                    break;
                case "password_incorrect":
                    text = "Password is incorrect";
                    break;
                case "logged":
                    text = "Account was logged";
                    break;
                case "user_not_available":
                    text = "This account has been deactived, for more information, please contact admin";
                    break;
                case "username_incorrect":
                    text = "Username is incorrect";
                    break;
                case "failed_service":
                    text = "failed_service";
                    break;
                case "password_not_match":
                    text = "Password not match";
                    break;
                case "save":
                    text = "Save";
                    break;
                case "send":
                    text = "Send";
                    break;
                case "email_invalid":
                    text = "Invalid email format";
                    break;
                case "invalid":
                    text = "invalid";
                    break;
                case "reinput_email":
                    text = "Retype email";
                    break;
                case "not_existed_email":
                    text = "Email " + value2 + " does not exist in the system."
                    break;
                case "resend":
                    text = "Resend"
                    break;
                case "An_email_with_link_has_been_sent_to_the_address":
                    text = "An email with link has been sent to the address"
                    break;
                case "please_check_the_inbox_and_click_the_link_provided_to_reset_password":
                    text = "please check the inbox and click the link provided to reset password."
                    break;
                case "If_you_don't_find_an_email_in_the_Inbox,_please_check_Junk_mail_box,_Spam_mail_box":
                    text = "If you don't find an email in the Inbox, please check Junk mail box, Spam mail box."
                    break;
                case "If_you_still_don't_receive_the_email,_please_click_the_button_below_to_resend_email":
                    text = " If you still don't receive the email, please click the button below to resend email."
                    break;
                case "click_login":
                    text = "The browser will direct to page \"Login\" in 5 seconds. Click ";
                    break;
                case "here":
                    text = "here";
                    break;
                case "if_wait_long_time":
                    text = " if you do not want to wait.";
                    break;
                case "link_expired":
                    text = "Link to change password has expired. Please re-enter your email to change password.";
                    break;

            }
            break;

    }
    return text;
};

task.showLoginBox = function(){
    DOMElement.removeAllChildren(window.holderMain);
    window.holderMain.appendChild(DOMElement.div({
        attrs: {
            style: {
                paddingTop: "var(--tab-padding-top)",
                paddingLeft: "var(--tab-padding-left)",
                paddingRight: "var(--tab-padding-right)"
            }
        },
        children: [
            DOMElement.div({
                attrs: {
                    align: "center"
                },
                children: [DOMElement.img({
                    attrs: {
                        src: window.imageCompanyInit,
                        style: {
                            maxWidth: "90px",
                            maxHeight: "60px"
                        }
                    }
                })]
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: task.getLanguage("login_your_account")
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: task.getLanguage("domain")
            }),
            DOMElement.input({
                attrs: {
                    id: "domain_input",
                    className: "KPIsimpleInput",
                    type: "text",
                    style: {
                        width: "100%",
                        height: "40px"
                    },
                    value: "https://lab.daithangminh.vn/home_co"
                }
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: task.getLanguage("username")
            }),
            DOMElement.input({
                attrs: {
                    id: "username_input",
                    className: "KPIsimpleInput",
                    type: "text",
                    style: {
                        width: "100%",
                        height: "40px"
                    },
                    onkeydown: function(event, me){
                        if (event.keyCode == 13){
                            task.submitLogin();
                            me.blur();
                        }
                    },
                    value: "datpd"
                }
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: task.getLanguage("password")
            }),
            DOMElement.input({
                attrs: {
                    id: "password_input",
                    className: "KPIsimpleInput",
                    type: "password",
                    style: {
                        width: "100%",
                        height:"40px"
                    },
                    onkeydown: function(event, me){
                        if (event.keyCode == 13){
                            task.submitLogin();
                            me.blur();
                        }
                    },
                    value: "ducdatpham"
                }
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                children: [absol.buildDom({
                    tag: "checkbox",
                    id: "rememberme",
                    props: {
                        checked: true,
                        text: task.getLanguage("rememberme")
                    }
                })]
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit",
                    align: "center"
                },
                children: [absol.buildDom({
                    tag: "flexiconbutton",
                    style: {
                        minWidth: "var(--button-min-width)",
                        height: "var(--button-height)",
                        fontSize: "var(--button-title-font-size)",
                        fontWeight: "var(--button-title-font-weight)",
                        backgroundColor: "var(--button-background-color_4)"
                    },
                    on: {
                        click: function() {
                            task.submitLogin();
                        }
                    },
                    props:{
                        text: task.getLanguage("login")
                    }
                })]
            })
        ]
    }));
    document.getElementById("username_input").focus();
};

task.loadDatabase = function () {
    if (!ModalElement.isReady()) {
        setTimeout("task.loadDatabase();", 10);
        return;
    }
    FormClass.api_call({
        url: "loaddb.php",
        params: [],
        func: function(success, message) {
            if (success) {
                if (message.substr(0, 2) == "ok") {
                    var i, serviceid, companyid;
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    database.services = {};
                    database.services.items = st.services;
                    database.services.getIndex = function(id){
                        for (i = 0; i < database.services.items.length; i++){
                            if (database.services.items[i].id == id) return i;
                        }
                        return -1;
                    }
                    for (i = 0; i < database.services.items.length; i++){
                        switch (database.services.items[i].name) {
                            case "tit_home_bsc":
                                database.services.items[i].subDNS = "bsc";
                                database.services.items[i].srcimg = "../logo-bsc-1511.png";
                                database.services.items[i].srclink = "http://www.bsc2kpi.com";
                                break;
                            case "tit_home_card":
                                database.services.items[i].subDNS = "carddone";
                                database.services.items[i].srcimg = "../logo-card-15-11.png";
                                database.services.items[i].srclink = "http://www.bsc2kpi.com";
                                serviceid = database.services.items[i].id;
                                break;
                            case "tit_home_salary":
                                database.services.items[i].subDNS = "salary";
                                database.services.items[i].srcimg = "../logo-salarytek-1511.png";
                                database.services.items[i].srclink = "http://www.salarytek.com";
                                break;
                            case "tit_home_quickjd":
                                database.services.items[i].subDNS = "jd";
                                database.services.items[i].srcimg = "../Logo-QuickJD.png";
                                database.services.items[i].srclink = "http://www.quickjd.com";
                                break;
                            case "HR":
                                database.services.items[i].subDNS = "HR";
                                database.services.items[i].srcimg = "";
                                database.services.items[i].srclink = "";
                                break;
                            case "Accounting":
                                database.services.items[i].subDNS = "accounting";
                                database.services.items[i].srcimg = "";
                                database.services.items[i].srclink = "";
                                break;
                            case "tit_home_forms":
                                database.services.items[i].subDNS = "forms";
                                database.services.items[i].srcimg = "../logo_forms.png";
                                database.services.items[i].srclink = "http://www.forms.com";
                                break;
                            default:

                        }
                    }
                    database.register = {};
                    database.register.items = st.register;
                    database.register.getIndex = function(id){
                        for (i = 0; i < database.register.items.length; i++){
                            if (database.register.items[i].id == id) return i;
                        }
                        return -1;
                    }
                    database.register.items.sort(function(a,b){
                        return database.services.getIndex(a.serviceid) -database.services.getIndex(b.serviceid);
                    });
                    database.company = {};
                    database.company = st.company;
                    companyid = st.company.id;
                    if (database.company.config == ""){
                        database.company.address = "";
                        database.company.logo = "";
                        database.company.website = "";
                        database.company.email = "";
                    }
                    else {
                        database.company.config = EncodingClass.string.toVariable(database.company.config);
                        switch (database.company.config.ver) {
                            case 1:
                                database.company.address = database.company.config.address;
                                database.company.logo = database.company.config.logo;
                                database.company.website = database.company.config.website;
                                database.company.email = database.company.config.email;
                                break;
                            default:

                        }
                    }

                    //systemconfig
                    systemconfig.userid = st.dataUser.homeid;
                    systemconfig.username = st.dataUser.username;
                    systemconfig.fullname = st.dataUser.fullname;
                    systemconfig.available = st.dataUser.available;
                    systemconfig.serviceid = serviceid;
                    systemconfig.companyid = companyid;
                    systemconfig.privSystem = st.dataUser.privilege;
                    systemconfig.user_avatars = st.dataUser.avatar;
                    systemconfig.user_avatars = window.domainUser_avatars + systemconfig.user_avatars;
                    systemconfig.language = st.dataUser.language;
                    init();
                }
                else if (message.startsWith("not_logged_in")){
                    ModalElement.show_loading();
                    FormClass.api_call({
                        url: "card_login_quick.php",
                        params: [
                            {
                                name: "jughgfhjh",
                                value: t
                            }
                        ],
                        func: function(success, message) {
                            ModalElement.close(-1);
                            // console.log(message);
                            if (success){
                                if (message == "ok"){
                                    task.loadDatabase();
                                }
                                else {
                                    task.showLoginBox();
                                }
                            }
                            else {
                                task.showLoginBox();
                            }
                        }

                    });
                }
                else {
                    ModalElement.alert({
                        message: message,
                        func: function () {
                            setTimeout("task.loadDatabase();", 10);
                        }
                    });
                }
            }
            else {
                ModalElement.alert({
                    message: message,
                    func: function () {
                        setTimeout("task.loadDatabase();", 10);
                    }
                });
            }
        }
    });
}
ModuleManagerClass.register({
    name: "main",
    prerequisites: ["FormClass", "ModalElement", "Absol", "StorageClass"],
    trigger: function () {
        window.session = EncodingClass.string.fromVariable({});
        window.holderMain = DOMElement.div({
            attrs: {
                className: "bodyFrm",
                style: {
                    height: "100%"
                }
            }
        });
        if (carddone.isMobile){
            window.holderMain.appendChild(DOMElement.div({
                attrs: {
                    style: {
                        position: "relative",
                        height: "100%",
                        width: "100%"
                    }
                },
                children: [
                    DOMElement.img({
                        attrs: {
                            className: "card-mobile-image-service-init",
                            src: window.imageServiceInit
                        }
                    }),
                    DOMElement.img({
                        attrs: {
                            className: "card-mobile-image-company-init",
                            src: window.imageCompanyInit
                        }
                    })
                ]
            }));
        }
        document.body.appendChild(DOMElement.div({
            attrs: {
                className: "mainFrm",
                style: {
                    font: "var(--font)",
                    height: "100%"
                }
            },
            children: [window.holderMain]
        }));
        if (window.isApp){
            task.showLoginBox();
        }
        else {
            task.loadDatabase();
        }
    }
});
