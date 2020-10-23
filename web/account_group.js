
carddone.account_group.deleteAccountGroup = function(host, id){
    return new Promise(function(resolve, reject){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "account_groups_delete.php",
            params: [{name: "id", value: id}],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var index = host.database.account_groups.getIndex(id);
                        host.database.account_groups.items.splice(index, 1);
                        resolve();
                        dbcache.refresh("account_groups");
                        dbcache.refresh("privilege_groups");
                        dbcache.refresh("privilege_group_details");
                        host.account_groupsDic = contentModule.makeDictionaryIndex(host.database.account_groups.items);
                    }
                    else if (message == "failed_used"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_txt_can_not_delete")
                        });
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
    });
};

carddone.account_group.deleteAccountGroupConfirm = function(host, id){
    return new Promise(function(resolve, reject){
        var index = host.database.account_groups.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_user_groups"),
            message: LanguageModule.text2("war_txt_detele", [host.database.account_groups.items[index].name]),
            onclick: function(sel){
                if (sel == 0){
                    carddone.account_group.deleteAccountGroup(host, id).then(function(value){
                        resolve(value);
                    });
                }
            }
        });
    });
};

carddone.account_group.addAccountGroupSubmit = function(host, id, type){
    return new Promise(function(resolve, reject){
        var ver = 0;
        var is_system = 0;
        var gindex = host.database.account_groups.items.length;
        var index = host.database.account_groups.getIndex(id);
        if (index >= 0){
            ver = host.database.account_groups.items[index].ver;
            is_system = host.database.account_groups.items[index].is_system;
            gindex = host.database.account_groups.items[index].gindex;
            if (id == -1) gindex = 0;
        }
        var data = host.AccountGroupEdit.getValue();
        if (!data) return;
        var listBoardAdd = [], listBoardDel = [], listCompany_ClassAdd = [], listCompany_ClassDel = [], idBoard = 0, idCompany_class = 0;
        for (var i = 0; i < host.database.privilege_groups.items.length; i++){
            switch (host.database.privilege_groups.items[i].type) {
                case "board":
                    idBoard = host.database.privilege_groups.items[i].id;
                    break;
                case "company_class":
                    idCompany_class = host.database.privilege_groups.items[i].id;
                    break;
            }
        }
        contentModule.listPriviledgeOfBoard.forEach(function(item){
            if (item == 5){
                if (host.priviledge_of_board[item] && !data.priviledge_of_board[item]){
                    listBoardDel.push({
                        attr: item,
                        privid: idBoard
                    });
                }
                else if (!host.priviledge_of_board[item] && data.priviledge_of_board[item]){
                    listBoardAdd.push({
                        privid: idBoard,
                        attr: item,
                        details: EncodingClass.string.fromVariable(data.priviledge_of_board[item])
                    });
                }
                else if (host.priviledge_of_board[item] && data.priviledge_of_board[item]){
                    if (EncodingClass.string.compare(host.priviledge_of_board[item], data.priviledge_of_board[item]) != 0){
                        listBoardDel.push({
                            privid: idBoard,
                            attr: item
                        });
                        listBoardAdd.push({
                            privid: idBoard,
                            attr: item,
                            details: EncodingClass.string.fromVariable(data.priviledge_of_board[item])
                        });
                    }
                }
            }
            else {
                if (host.priviledge_of_board[item] && !data.priviledge_of_board[item]){
                    listBoardDel.push({
                        attr: item,
                        privid: idBoard
                    });
                }
                else if (!host.priviledge_of_board[item] && data.priviledge_of_board[item]){
                    listBoardAdd.push({
                        privid: idBoard,
                        attr: item
                    });
                }
            }
        });
        contentModule.listPriviledgeOfCompany_Class.forEach(function(item){
            if (host.priviledge_of_company_class[item] && !data.priviledge_of_company_class[item]){
                listCompany_ClassDel.push({
                    attr: item,
                    privid: idCompany_class
                });
            }
            else if (!host.priviledge_of_company_class[item] && data.priviledge_of_company_class[item]){
                listCompany_ClassAdd.push({
                    privid: idCompany_class,
                    attr: item
                });
            }
        });
        var params = [
            {name: "data", value: EncodingClass.string.fromVariable({
                id: (id < 0)? 0 : id,
                name: data.name,
                available: data.available,
                comment: data.comment,
                ver: ver,
                is_system: is_system,
                gindex: gindex
            })},
            {name: "listBoardAdd", value: EncodingClass.string.fromVariable(listBoardAdd)},
            {name: "listBoardDel", value: EncodingClass.string.fromVariable(listBoardDel)},
            {name: "listCompany_ClassAdd", value: EncodingClass.string.fromVariable(listCompany_ClassAdd)},
            {name: "listCompany_ClassDel", value: EncodingClass.string.fromVariable(listCompany_ClassDel)},
            {name: "idBoard", value: idBoard},
            {name: "idCompany_class", value: idCompany_class}
        ];
        ModalElement.show_loading();
        FormClass.api_call({
            url: "account_group_save.php",
            params: params,
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        if (id == 0){
                            id = st.data.id;
                            host.id = id;
                            host.database.account_groups.items.push(st.data);
                        }
                        else if (id < 0){
                            var index = host.database.account_groups.getIndex(id);
                            host.database.account_groups.items[index] = st.data;
                            id = st.data.id;
                            host.id = id;
                            host.database.privilege_groups.items = host.database.privilege_groups.items.filter(function(elt){
                                return elt.groupid != -1;
                            });
                        }
                        else {
                            var index = host.database.account_groups.getIndex(id);
                            st.data.userid = host.database.account_groups.items[index].userid;
                            st.data.createdtime = host.database.account_groups.items[index].createdtime;
                            st.data.gindex = host.database.account_groups.items[index].gindex;
                            host.database.account_groups.items[index] = st.data;
                        }
                        if (!is_system) host.database.privilege_groups.items = st.privilege_groups;
                        else {
                            contentModule.makeAccountGroupPrivilegeSystem(host);
                        }
                        host.priviledge_of_board = EncodingClass.string.duplicate(data.priviledge_of_board);
                        host.priviledge_of_company_class = EncodingClass.string.duplicate(data.priviledge_of_company_class);
                        host.account_groupsDic = contentModule.makeDictionaryIndex(host.database.account_groups.items);
                        resolve(carddone.account_group.getCellAccountGroup(host, id));
                        if (type == 1){
                            while (host.frameList.getLength() > 1){
                                host.frameList.removeLast();
                            }
                        }
                        dbcache.refresh("account_groups");
                        dbcache.refresh("privilege_groups");
                        dbcache.refresh("privilege_group_details");
                    }
                    else if (message == "failed_id"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_data_is_null"),
                            func: function(){
                                dbcache.refresh("account_groups");
                                dbcache.refresh("privilege_groups");
                                dbcache.refresh("privilege_group_details");
                                while (host.frameList.getLength() > 1){
                                    host.frameList.removeLast();
                                }
                                carddone.account_group.init(host);
                            }
                        });
                    }
                    else if (message == "failed_ver"){
                        ModalElement.alert({
                            message: LanguageModule.text("war_text_evaluation_reload_data"),
                            func: function(){
                                dbcache.refresh("account_groups");
                                dbcache.refresh("privilege_groups");
                                dbcache.refresh("privilege_group_details");
                                carddone.account_group.preAddAccountGroup(host, id, resolve);
                            }
                        });
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
    });
};

carddone.account_group.addAccountGroup = function(host, id, resolve, resolveAdd){
    host.id = id;
    var index = host.database.account_groups.getIndex(id);
    if (index < 0){
        host.database.privilege_group_details = data_module.makeDatabase([]);
        host.database.privilege_groups = data_module.makeDatabase([]);
    }
    else {
        if (host.database.account_groups.items[index].is_system){
            host.database.privilege_group_details = data_module.makeDatabase([]);
            host.database.privilege_groups = data_module.makeDatabase([]);
            contentModule.makeAccountGroupPrivilegeSystem(host);
        }
    }
    console.log(host.database);
    var x = contentModule.makePriviledgeGroups(host);
    host.priviledge_of_company_class = x.priviledge_of_company_class;
    host.priviledge_of_board = x.priviledge_of_board;
    var cmdbutton = {
        close: function (event, me) {
            while (host.frameList.getLength() > 1){
                host.frameList.removeLast();
            }
        },
        save: function (event, me) {
            if (host.id == 0){
                carddone.account_group.addAccountGroupSubmit(host, host.id, 0).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.account_group.addAccountGroupSubmit(host, host.id, 0).then(function(x){
                    resolve(x);
                });
            }
        },
        save_close: function (event, me) {
            if (host.id == 0){
                carddone.account_group.addAccountGroupSubmit(host, host.id, 1).then(function(x){
                    resolveAdd(x);
                });
            }
            else {
                carddone.account_group.addAccountGroupSubmit(host, host.id, 1).then(function(x){
                    resolve(x);
                });
            }
        },
        delete: function (event, me) {
            carddone.account_group.deleteAccountGroupConfirm(host, host.id, 1).then(function(x){
                resolve(false);
                while (host.frameList.getLength() > 1){
                    host.frameList.removeLast();
                }
            });
        }
    };
    var listExc = [];
    if (index < 0) {
        var data = {
            id: 0,
            name: "",
            comment: "",
            available: true
        };
    }
    else {
        var data = {
            id: host.id,
            name: host.database.account_groups.items[index].name,
            comment: host.database.account_groups.items[index].comment,
            available: host.database.account_groups.items[index].available,
            createdtime: host.database.account_groups.items[index].createdtime,
            createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.account_groups.items[index].userid),
            is_system: host.database.account_groups.items[index].is_system
        };
    }
    data.priviledge_of_board = {};
    for (var i = 0; i < contentModule.listPriviledgeOfBoard.length; i++){
        if (contentModule.listPriviledgeOfBoard[i] != 5){
            data.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]] = {
                text: contentModule.getPriviledgeOfBoard(contentModule.listPriviledgeOfBoard[i]),
                checked: host.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]]
            };
        }
        else {
            data.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]] = {
                text: contentModule.getPriviledgeOfBoard(contentModule.listPriviledgeOfBoard[i])
            };
            if (host.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]]){
                data.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]].checked = true;
                data.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]].details = EncodingClass.string.duplicate(host.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]]);
            }
            else {
                data.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]].checked = false;
                data.priviledge_of_board[contentModule.listPriviledgeOfBoard[i]].details = [];
            }
        }
    };
    data.priviledge_of_company_class = {};
    for (var i = 0; i < contentModule.listPriviledgeOfCompany_Class.length; i++){
        data.priviledge_of_company_class[contentModule.listPriviledgeOfCompany_Class[i]] = {
            text: contentModule.getPriviledgeOfCompany_class(contentModule.listPriviledgeOfCompany_Class[i]),
            checked: host.priviledge_of_company_class[contentModule.listPriviledgeOfCompany_Class[i]]
        }
    };
    data.listGroups = [{value: 0, text: LanguageModule.text("txt_all")}];
    for (var i = 0; i < host.database.account_groups.items.length; i++){
        data.listGroups.push({
            value: host.database.account_groups.items[i].id,
            text: host.database.account_groups.items[i].name
        });
    }
    host.AccountGroupEdit = host.funcs.formAccountGroupEdit({
        cmdbutton: cmdbutton,
        data: data,
        type: (id == 0)? "add" : "edit",
        isPriv: (systemconfig.privSystem >= 2)
    });
    host.frameList.addChild(host.AccountGroupEdit);
    host.AccountGroupEdit.requestActive();
};

carddone.account_group.preAddAccountGroup = function(host, id, resolve){
    ModalElement.show_loading();
    var promiseList = {};
    promiseList.account_groups = new Promise(function(rs, rj){
        dbcache.loadById({
           name: "account_groups",
           id: id,
           callback: function(retval){
               ModalElement.close(-1);
               if (retval === undefined){
                   ModalElement.alert({
                       message: LanguageModule.text("war_text_data_is_null"),
                       func: function(){
                           dbcache.refresh("account_groups");
                           carddone.account_group.init(host);
                       }
                   });
                   return;
               }
               var index = host.database.account_groups.getIndex(id);
               host.database.account_groups.items[index] = retval;
               rs();
           }
       });
    });
    promiseList.privilege_groups = data_module.loadByConditionAsync({
        name: "privilege_groups",
        cond: function(record){
            return record.groupid == id;
        },
        callback: function(retval){
            host.database.privilege_groups = data_module.makeDatabase(retval);
            var privilege_groupsDic = contentModule.makeDictionaryIndex(host.database.privilege_groups.items);
            return privilege_groupsDic;
        }
    });
    promiseList.privilege_group_details = promiseList.privilege_groups.then(function(dic){
        return data_module.loadByConditionAsync({
            name: "privilege_group_details",
            cond: function(record){
                return dic[record.privid] !== undefined;
            },
            callback: function(retval){
                host.database.privilege_group_details = data_module.makeDatabase(retval);
            }
        });
    });
    Promise.all([promiseList.account_groups, promiseList.privilege_group_details]).then(function(){
        carddone.account_group.addAccountGroup(host, id, resolve);
    });
};

carddone.account_group.restoreAccountGroup = function(host, id){
    return new Promise(function(resolve, reject){
        console.log(id);
    });
};

carddone.account_group.getCellAccountGroup = function(host, id){
    var celldata;
    var index = host.account_groupsDic[id];
    var celldata = {
        id: id,
        name: host.database.account_groups.items[index].name,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host.database.account_groups.items[index].userid),
        available: contentModule.availableName(host.database.account_groups.items[index].available),
        createdtime: host.database.account_groups.items[index].createdtime,
        lastmodifiedtime: host.database.account_groups.items[index].lastmodifiedtime,
        comment: host.database.account_groups.items[index].comment,
        isPriv: (systemconfig.privSystem >= 2),
        is_system: host.database.account_groups.items[index].is_system
    };
    celldata.func = {
        edit: function(resolve){
            if (host.database.account_groups.items[index].is_system){
                carddone.account_group.addAccountGroup(host, id, resolve);
            }
            else {
                carddone.account_group.preAddAccountGroup(host, id, resolve);
            }
        },
        restore: function(){
            return new Promise(function(resolve,reject){
                carddone.account_group.restoreAccountGroup(host, id).then(function(value){
                    resolve(value);
                });
            });
        },
        delete: function(){
            return new Promise(function(resolve,reject){
                carddone.account_group.deleteAccountGroupConfirm(host, id).then(function(value){
                    resolve(value);
                });
            });
        }
    };
    return celldata;
};

carddone.account_group.changeIndex = function(host, id, oldIndex, newIndex){
    if (oldIndex == newIndex) return;
    var data = [{
        id: host.database.account_groups.items[oldIndex].id,
        gindex: newIndex,
        name: host.database.account_groups.items[oldIndex].name
    }];
    if (oldIndex < newIndex){
        for (var i = oldIndex + 1; i < newIndex + 1; i++){
            data.push({
                id: host.database.account_groups.items[i].id,
                gindex: i - 1,
                name: host.database.account_groups.items[i].name
            });
        }
    }
    else {
        for (var i = newIndex; i < oldIndex; i++){
            data.push({
                id: host.database.account_groups.items[i].id,
                gindex: i + 1,
                name: host.database.account_groups.items[i].name
            });
        }
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "account_group_change_index.php",
        params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    host.database.account_groups.items[oldIndex].gindex = newIndex;
                    if (oldIndex < newIndex){
                        for (var i = oldIndex + 1; i < newIndex + 1; i++){
                            host.database.account_groups.items[i].gindex = i - 1;
                        }
                    }
                    else {
                        for (var i = newIndex; i < oldIndex; i++){
                            host.database.account_groups.items[i].gindex = i + 1;
                        }
                    }
                    host.database.account_groups.items.sort(function(a, b){
                        return a.gindex - b.gindex;
                    });
                    if (st.isAdd){
                        var index = host.database.account_groups.getIndex(-1);
                        host.database.account_groups.items[index].id = st.isAdd;
                    }
                    dbcache.refresh("account_groups");
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
};

carddone.account_group.redraw = function(host){
    var data = [];
    host.account_groupsDic = contentModule.makeDictionaryIndex(host.database.account_groups.items);
    for (var i = 0; i < host.database.account_groups.items.length; i++) {
        data.push(carddone.account_group.getCellAccountGroup(host, host.database.account_groups.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formAccountGroupContentData({
        content: data,
        inputsearchbox: host.inputsearchbox,
        changeIndexFunc: function(id, oldIndex, newIndex){
            carddone.account_group.changeIndex(host, id, oldIndex, newIndex)
        }
    });
    host.data_container.appendChild(host.dataView);
};

carddone.account_group.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.account_group.init(host);
        }, 50);
        return;
    }
    ModalElement.show_loading();
    host.database = {};
    dbcache.loadByCondition({
        name: "account_groups",
        cond: function(record){
            return true;
        },
        callback: function(retval){
            host.database.account_groups = data_module.makeDatabase(retval);
            contentModule.makeAccountGroupSystem(host);
            host.database.account_groups.items.sort(function(a, b){
                return a.gindex - b.gindex;
            });
            console.log(host.database.account_groups.items);
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
                    if (carddone.isMobile){
                        host.holder.selfRemove();
                        carddone.menu.loadPage(100);
                    }
                    else {
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    }
                }
            };
            if (systemconfig.privSystem >= 2){
                cmdbutton.add = function(event, me){
                    carddone.account_group.addAccountGroup(host, 0, function onSave(value){
                        host.newRecord = host.newRecord.updateCurrentRow(host.funcs.formAccountGroupGetRow(value));
                    }, function onAdd(value){
                        host.newRecord = host.dataView.insertRow(host.funcs.formAccountGroupGetRow(value));
                    });
                }
            }
            host.data_container = DOMElement.div({attrs: {style: {marginBottom: "200px"}}});
            host.holder.addChild(host.frameList);
            var singlePage = host.funcs.formAccountGroupInit({
                cmdbutton: cmdbutton,
                data_container: host.data_container,
                inputsearchbox: host.inputsearchbox
            });
            host.frameList.addChild(singlePage);
            singlePage.requestActive();
            carddone.account_group.redraw(host);
        }
    });
};
ModuleManagerClass.register({
    name: "AccountGroup",
    prerequisites: ["ModalElement", "FormClass"]
});
