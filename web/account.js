carddone.account.confirmPassword = function(host){
    var pass = host.password_confirm.value.trim();
    if (pass == "") {
        ModalElement.alert({
            message: LanguageModule.text("war_no_password"),
            func: function(){
                host.password_confirm.focus();
            }
        });
        return;
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "account_confirm_password.php",
        params: [
            {
                name: "pass",
                value: pass
            }
        ],
        func: function(success, message) {
            ModalElement.close(-1);
            if (success){
                if (message == "ok"){
                    ModalElement.close(1);
                    host.direct = 1;
                    carddone.account.init(host);
                }
                else if (message.substr(0,6) == "failed"){
                    DOMElement.removeAllChildren(host.notification);
                    host.notification.appendChild(DOMElement.div({
                        attrs: {style: {color: "red", paddingBottom: "5px"}},
                        text: LanguageModule.text("war_txt_password_incorrect")
                    }));
                    host.password_confirm.focus();
                    return;
                }
                else {
                    ModalElement.alert({
                        message: message
                    });
                    return;
                }
            }
            else {
                ModalElement.alert({
                    message: message
                });
                return;
            }
        }
    })
};

carddone.account.deleteAccount = function(host, id){

};

carddone.account.addAccountSubmit = function(host, id, type){
    return new Promise(function(resolve,reject){
        var selectedIndex = data_module.users.getIndex(id);
        var data = host.AccountEdit.getValue();
        if (!data) return;
        var params = [];
        for (param in data){
            params.push({name: param, value: data[param]});
        }
        if (id == 0){
            params.push({name: "id", value: 0});
            params.push({name: "homeid", value: 0});
        }
        else {
            params.push({name: "id", value: data_module.users.items[selectedIndex].id});
            params.push({name: "homeid", value: data_module.users.items[selectedIndex].homeid});
            params.push({name: "username", value: data_module.users.items[selectedIndex].username});
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "user_update.php",
            params: params,
            func: function(success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        if (selectedIndex < 0) {
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            data_module.users.items.push({
                                id: st.id,
                                fullname: data.fullname,
                                username: data.username,
                                password: data.password,
                                email: data.email,
                                privilege: data.priv,
                                access_time: new Date(),
                                comment: data.comment,
                                available: data.available,
                                language: data.language,
                                report_to: data.report_to,
                                descendanIdList: [],
                                childIndexList: [],
                                homeid: st.homeid
                            });
                            if (data.report_to > 0) contentModule.makeReportToUserThanhYen();
                            host.dataView.insertRow(host.funcs.formAccountGetRow(carddone.account.getCellAccount(host, id)));
                        }
                        else {
                            data_module.users.items[selectedIndex].fullname = data.fullname;
                            data_module.users.items[selectedIndex].comment =  data.comment;
                            data_module.users.items[selectedIndex].email =  data.email;
                            data_module.users.items[selectedIndex].privilege = data.priv;
                            data_module.users.items[selectedIndex].available = data.available;
                            data_module.users.items[selectedIndex].language = data.language;
                            if (data_module.users.items[selectedIndex].report_to != data.report_to){
                                data_module.users.items[selectedIndex].report_to = data.report_to;
                                contentModule.makeReportToUserThanhYen();
                            }
                            resolve(carddone.account.getCellAccount(host, id));
                        }
                        if (type == 0){
                            carddone.account.addAccount(host,id);
                        }
                        else {
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                    }
                    else  if (message.substr(0,5) == "check"){
                        var datau = EncodingClass.string.toVariable(message.substr(5));
                        ModalElement.question({
                            title: LanguageModule.text("war_title_confirm_account"),
                            message: LanguageModule.text2("war_txt_confirm_account", [datau.username, datau.fullname, datau.email, datau.comment]),
                            onclick: function (index) {
                                switch (index) {
                                    case 0:
                                    var param = {
                                        homeid: datau.id,
                                        available: data.available,
                                        privilege: data.priv,
                                        language: data.language,
                                        report_to: data.report_to
                                    };
                                    ModalElement.show_loading();
                                    FormClass.api_call({
                                        url: "user_linkaccount.php",
                                        params: [{name: "data", value:  EncodingClass.string.fromVariable(param)}],
                                        func: function(success, message) {
                                            ModalElement.close(-1);
                                            if (success){
                                                if (message.substr(0,2) == "ok"){
                                                    var id = parseInt(message.substr(2), 10);
                                                    data_module.users.items.push({
                                                        id: id,
                                                        fullname: datau.fullname,
                                                        username: datau.username,
                                                        password: datau.password,
                                                        email: datau.email,
                                                        privilege: data.priv,
                                                        access_time: new Date(),
                                                        comment: datau.comment,
                                                        available: data.available,
                                                        language: data.language,
                                                        homeid: datau.id,
                                                        report_to: data.report_to,
                                                        descendanIdList: []
                                                    });
                                                    if (data.report_to > 0) contentModule.makeReportToUserThanhYen();
                                                    host.dataView.insertRow(host.funcs.formAccountGetRow(carddone.account.getCellAccount(host, id)));
                                                    if (type == 0){
                                                        carddone.account.addAccount(host,id);
                                                    }
                                                    else {
                                                        while (host.frameList.getLength() > 1){
                                                            host.frameList.removeLast();
                                                        }
                                                    }
                                                }
                                                else {
                                                    ModalElement.alert({
                                                        message: message
                                                    });
                                                    return;
                                                }
                                            }
                                            else {
                                                ModalElement.alert({
                                                    message: message
                                                });
                                                return;
                                            }
                                        }
                                    })
                                    break;
                                    case 1:
                                    // do nothing
                                    break;
                                }
                            }
                        });
                        return;
                    }
                    else {
                        ModalElement.alert({
                            message: message
                        });
                        return;
                    }
                }
                else {
                    ModalElement.alert({
                        message: message
                    });
                    return;
                }
            }
        });
    });
};

carddone.account.addAccount = function(host, id){
    return new Promise(function(resolve,reject){
        var index = data_module.users.getIndex(id);
        var cmdbutton = {
            close: function (event, me) {
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            },
            save: function (event, me) {
                carddone.account.addAccountSubmit(host, id, 0).then(function(x){
                    resolve(x);
                });
            },
            save_close: function (event, me) {
                carddone.account.addAccountSubmit(host, id, 1).then(function(x){
                    resolve(x);
                });
            }
        };
        var listExc = [];
        if(index < 0) {
            var data = {
                username: "",
                emailadd: "",
                fullname: "",
                privmode: 0,
                report_to: 0,
                comment: "",
                language: LanguageModule.defaultcode,
                activemode: true
            };
        }
        else {
            var data = {
                username: data_module.users.items[index].username,
                emailadd: data_module.users.items[index].email,
                fullname: data_module.users.items[index].fullname,
                privmode: data_module.users.items[index].privilege,
                report_to: data_module.users.items[index].report_to,
                comment: data_module.users.items[index].comment,
                language: data_module.users.items[index].language,
                activemode: data_module.users.items[index].available
            };
            listExc = data_module.users.items[index].descendanIdList;
        }
        data.languageList = contentModule.generateLanguageList();
        data.privmodeList = [
            {value: 0, text: LanguageModule.text("txt_user")},
            {value: 1, text: LanguageModule.text("txt_manager")},
            {value: 2, text: LanguageModule.text("txt_super_administrator")}
        ];
        data.report_toList = [{value: 0, text: LanguageModule.text("txt_no_select")}];
        for (var i = 0; i < data_module.users.items.length; i++){
            if (data_module.users.items[i].id == id) continue;
            if (listExc.indexOf(data_module.users.items[i].homeid) >= 0) continue;
            data.report_toList.push({value: data_module.users.items[i].homeid, text: data_module.users.items[i].username + " - " + data_module.users.items[i].fullname});
        }
        host.AccountEdit = host.funcs.formAccountEdit({
            cmdbutton: cmdbutton,
            data: data,
            type: (index < 0)? "add" : "edit"
        });
        host.frameList.addChild(host.AccountEdit);
        host.AccountEdit.requestActive();
    });
};

carddone.account.getCellAccount = function(host, id){
    var celldata;
    var nameDebug, report_toIndex;
    var index = data_module.users.getIndex(id);
    nameDebug = data_module.users.items[index].username;
    if (systemconfig.debugMode){
        nameDebug += "\n id: " + data_module.users.items[index].id + " (index: " + i + ")" + " (homeid: " + data_module.users.items[index].homeid + ")";
    }
    celldata = {
        username: nameDebug,
        fullname: data_module.users.items[index].fullname,
        email: data_module.users.items[index].email,
        time: contentModule.getTimeSend(data_module.users.items[index].access_time),
        timeSort: data_module.users.items[index].access_time.getTime()
    };
    report_toIndex = data_module.users.getByhomeid(data_module.users.items[index].report_to);
    if (report_toIndex < 0){
        celldata.reportTo = "";
    }
    else {
        celldata.reportTo = data_module.users.items[report_toIndex].username;
    }
    switch (data_module.users.items[index].privilege) {
        case 0:
            celldata.privilege = LanguageModule.text("txt_user");
            break;
        case 1:
            celldata.privilege = LanguageModule.text("txt_manager");
            break;
        case 2:
            celldata.privilege = LanguageModule.text("txt_super_administrator");
            break;

    }
    celldata.available = data_module.users.items[index].available;
    var languagevalue = "";
    for (var li = 0; li < LanguageModule.code.length; li++){
        if (data_module.users.items[index].language == LanguageModule.code[li].name){
            languagevalue = LanguageModule.code[li].value;
            break;
        }
    }
    celldata.language = languagevalue;
    celldata.comment = data_module.users.items[index].comment;
    celldata.func = {
        edit: function(){
            return new Promise(function(resolve,reject){
                carddone.account.addAccount(host, id).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.account.deleteAccount(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return celldata;
};

carddone.account.redraw = function(host){
    var data = [];
    for (var i = 0; i < data_module.users.items.length; i++) {
        data.push(carddone.account.getCellAccount(host, data_module.users.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formAccountContentData({
        content: data,
        inputsearchbox: host.inputsearchbox
    });
    host.data_container.appendChild(host.dataView);
};

carddone.account.init = function(host){
    if (host.direct == 0){
        host.password_confirm = host.funcs.input({
            type: "password",
            style: {
                width: "200px"
            },
            onkeydown: function(event){
                if (event.keyCode == 13) carddone.account.confirmPassword(host);
            }
        });
        host.notification = DOMElement.div({});
        host.funcs.formConfirmPassword({
            func: {
                ok: function(host){
                    return function(event, me){
                        carddone.account.confirmPassword(host);
                    }
                }(host),
                close: function(event,me) {
                    ModalElement.close();
                    carddone.menu.tabPanel.removeTab(host.holder.id);
                }
            },
            notification: host.notification,
            password_confirm: host.password_confirm
        });
        host.password_confirm.focus();
        return;
    }
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.account.init(host);
        }, 50);
        return;
    }
    if (!data_module.users.isMakeIndex){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.account.init(host);
        }, 50);
        return;
    }
    ModalElement.close(-1);
    host.inputsearchbox = absol.buildDom({
        tag:'searchcrosstextinput',
        style: {
            width: "var(--searchbox-width)"
        },
        props:{
            placeholder: LanguageModule.text("txt_search")
        }
    });
    var cmdbutton = {
        close: function () {
            carddone.menu.tabPanel.removeTab(host.holder.id);
        },
        add: function(event, me){
            carddone.account.addAccount(host, 0);
        }
    };
    host.data_container = DOMElement.div({attrs: {style: {marginBottom: "200px"}}});
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formAccountInit({
        cmdbutton: cmdbutton,
        data_container: host.data_container,
        inputsearchbox: host.inputsearchbox
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.account.redraw(host);
};
ModuleManagerClass.register({
    name: "Account",
    prerequisites: ["ModalElement", "FormClass"]
});
