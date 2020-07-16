
'use strict';

carddone.chats.generateDataChatContent = function(host, content){
    var userIndex;
    for (var i = 0; i < content.length; i++){
        userIndex = data_module.users.getByhomeid(content[i].userid);
        content[i].fullname = data_module.users.items[userIndex].fullname;
        if (content[i].userid == systemconfig.userid) content[i].type = "me";
        else content[i].type = "other";
        content[i].avatarSrc = data_module.users.items[userIndex].avatarSrc;
    }
};

carddone.chats.seenMess = function(host, sessionid, mess_seen_id){
    return new Promise(function(resolve, reject){
        var data = {
            sessionid: sessionid,
            mess_seen_id: mess_seen_id
        };
        FormClass.api_call({
            url: "chat_seen_message.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        host.database.chat_sessions.items[sessionIndex].mess_seen_id = mess_seen_id;
                        resolve(true);
                    }
                    else {
                        ModalElement.alert({message: message});
                    }
                }
                else {
                    console.log(message);
                }
            }
        });
    });
};

carddone.chats.deleteMessage = function(host, sessionid, localid){
    return new Promise(function(resolve, reject){
        var data = {
            localid: localid,
            sessionid: sessionid
        };
        FormClass.api_call({
            url: "chats_delete_message.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var lastMess = "";
                        var sIndex = host.database.chat_sessions.getIndex(sessionid);
                        for (var j = 0; j < host.database.chat_sessions.items[sIndex].content.length; j++){
                            if (host.database.chat_sessions.items[sIndex].content[j].localid == localid){
                                if (j > 0 && j == host.database.chat_sessions.items[sIndex].content.length - 1){
                                    lastMess = host.database.chat_sessions.items[sIndex].content[j-1];
                                }
                                host.database.chat_sessions.items[sIndex].content.splice(j, 1);
                                break;
                            }
                        }
                        resolve(lastMess);
                        var receiverids = [];
                        var userIndex;
                        for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                            if (host.database.chat_sessions.items[sIndex].membersIdList[i] == systemconfig.userid) continue;
                            userIndex = data_module.users.getByhomeid(host.database.chat_sessions.items[sIndex].membersIdList[i]);
                            if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                        }
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            tabid: host.holder.id,
                            type: "deletemessage",
                            localid: localid,
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sIndex].membersIdList,
                            randomId: randomId,
                            lastMess: lastMess
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

carddone.chats.editMessage = function(host, sessionid, localid, content){
    return new Promise(function(resolve, reject){
        var data = {
            localid: localid,
            sessionid: sessionid,
            content: content
        };
        FormClass.api_call({
            url: "chats_edit_message.php",
            params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var sIndex = host.database.chat_sessions.getIndex(sessionid);
                        var receiverids = [];
                        var userIndex;
                        for (var j = 0; j < host.database.chat_sessions.items[sIndex].content.length; j++){
                            if (host.database.chat_sessions.items[sIndex].content[j].localid == content.localid){
                                host.database.chat_sessions.items[sIndex].content[j].content = content.content;
                                host.database.chat_sessions.items[sIndex].content[j].isEdit = 1;
                            }
                        }
                        for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                            if (host.database.chat_sessions.items[sIndex].membersIdList[i] == systemconfig.userid) continue;
                            userIndex = data_module.users.getByhomeid(host.database.chat_sessions.items[sIndex].membersIdList[i]);
                            if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                        }
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        var dataDraw = {
                            tabid: host.holder.id,
                            type: "editmessage",
                            localid: localid,
                            content: content,
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sIndex].membersIdList,
                            randomId: randomId
                        };
                        resolve(dataDraw);
                        host.funcs.sendMessage(dataDraw);
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

carddone.chats.sendMess = function (host, sessionid, text, files, images, listIdLocal) {
    return new Promise(function (resolveMessage, rejectMessage) {
        var sIndex = host.database.chat_sessions.getIndex(sessionid);
        var allFilesReadAsync = files.concat(images).map(function (file) {
            return FormClass.readFileAsync(file);
        });
        Promise.all(allFilesReadAsync).then(function (files) {
            return files.map(function (file, i) {// chuyển dữ liệu có thể upload bằng api calll được
                var res = {
                    filename: file.name,
                    content: file.content
                };
                if (file.type.startsWith('image/')) {
                    res.type = "img";
                    res.name = "imageSlot" + i;
                }
                else {
                    res.type = "file";
                    res.name = "fileSlot" + i;
                }
                return res;
            });
        }).then(function (filesToUpload) {
            FormClass.api_call({
                url: "chats_save_message.php",
                params: [
                    {
                        name: "sessionid",
                        value: sessionid
                    },
                    {
                        name: "membersIdList",
                        value: EncodingClass.string.fromVariable(host.database.chat_sessions.items[sIndex].membersIdList)
                    },
                    {
                        name: "fullname",
                        value: systemconfig.fullname
                    },
                    {
                        name: "text",
                        value: text
                    },
                    {
                        name: "n",
                        value: filesToUpload.length
                    },
                    {name: "listIdLocal", value: EncodingClass.string.fromVariable(listIdLocal)}
                ],
                fileuploads: filesToUpload,
                func: function (success, message) {
                    console.log(message);
                    var drawMessage = function(failed){
                        var dataDraw = [];
                        dataDraw.sessionid = sessionid;
                        var userIndex = data_module.users.getByhomeid(systemconfig.userid);
                        for (var i = 0; i < filesToUpload.length; i++) {
                            if (filesToUpload[i].type == "img") {
                                dataDraw.push({
                                    localid: listIdLocal[i],
                                    content: filesToUpload[i].filename,
                                    userid: systemconfig.userid,
                                    fullname: data_module.users.items[userIndex].fullname,
                                    type: "me",
                                    content_type: "img",
                                    m_time: new Date(),
                                    failed: failed
                                });
                            }
                            else {
                                dataDraw.push({
                                    localid: listIdLocal[i],
                                    content: filesToUpload[i].filename,
                                    userid: systemconfig.userid,
                                    fullname: data_module.users.items[userIndex].fullname,
                                    type: "me",
                                    content_type: "file",
                                    m_time: new Date(),
                                    failed: failed
                                });
                            }
                        }
                        if (text != "") {
                            dataDraw.push({
                                localid: listIdLocal[listIdLocal.length - 1],
                                content: text,
                                userid: systemconfig.userid,
                                fullname: data_module.users.items[userIndex].fullname,
                                type: "me",
                                content_type: "text",
                                m_time: new Date(),
                                failed: failed
                            });
                        }
                        var receiverids = [];
                        var userIndex;
                        // console.log(host.database.chat_sessions.items[sIndex].membersIdList);
                        for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                            if (host.database.chat_sessions.items[sIndex].membersIdList[i] == systemconfig.userid) continue;
                            userIndex = data_module.users.getByhomeid(host.database.chat_sessions.items[sIndex].membersIdList[i]);
                            if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                        }
                        resolveMessage(dataDraw);
                        if (!failed){
                            var randomId = contentModule.generateRandom();
                            host.listMessRandomAccept.push(randomId);
                            host.funcs.sendMessage({
                                tabid: host.holder.id,
                                type: "addmessage",
                                dataDraw: dataDraw,
                                sessionid: sessionid,
                                listMember: host.database.chat_sessions.items[sIndex].membersIdList,
                                randomId: randomId
                            });
                        }
                    };
                    if (success) {
                        if (message.substr(0, 2) == "ok") {
                            drawMessage(false);
                        }
                        else {
                            ModalElement.alert({message: message});
                            // rejectMessage(message);
                        }
                    }
                    else {
                        drawMessage(true);
                    }
                }.bind(this)
            });

        }.bind(this));

    });
};

carddone.chats.loadOldMess = function(host, sessionid){
    return new Promise(function(resolve, reject){
        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
        if (host.database.chat_sessions.items[sessionIndex].archivedIdList.length == 0){
            resolve([]);
        }
        else {
            var archivedid = host.database.chat_sessions.items[sessionIndex].archivedIdList[0];
            ModalElement.show_loading();
            FormClass.api_call({
                url: "database_load.php",
                params: [
                    {name: "task", value: "chats_load_archived_chats_details"},
                    {name: "id", value: archivedid}
                ],
                func: function(success, message){
                    ModalElement.close(-1);
                    if (success){
                        if (message.substr(0, 2) == "ok"){
                            var st = EncodingClass.string.toVariable(message.substr(2));
                            var content = EncodingClass.string.toVariable(st.content);
                            carddone.chats.generateDataChatContent(host, content);
                            host.database.chat_sessions.items[sessionIndex].archivedIdList.splice(0, 1);
                            resolve(content);
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
        }
    });
};

carddone.chats.addSession = function(host, data){
    return new Promise(function(resolve, reject){
        data.listMember.unshift(systemconfig.userid);
        if (data.name == ""){
            var userIndex;
            if (data.listMember.length > 2){
                for (var i = 0; i < data.listMember.length; i++){
                    userIndex = data_module.users.getByhomeid(data.listMember[i]);
                    if (i > 0) data.name += ", ";
                    data.name += data_module.users.items[userIndex].fullname;
                }
            }
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "chats_add_session.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var sessionid = st.dataSession.id;
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        if (sessionIndex < 0){
                            host.database.chat_sessions.items.push(st.dataSession);
                            for (var i = 0; i < st.mids.length; i++){
                                host.database.chat_session_members.items.push({
                                    id: st.mids[i],
                                    userid: data.listMember[i],
                                    sessionid: sessionid,
                                    add_time: new Date(),
                                    mess_seen_id: 0
                                });
                            }
                            contentModule.makeChat_session_membersIndex(host);
                            sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                            host.database.chat_sessions.items[sessionIndex].company_contactName = "";
                            host.database.chat_sessions.items[sessionIndex].content = EncodingClass.string.toVariable(host.database.chat_sessions.items[sessionIndex].content);
                            host.database.chat_sessions.items[sessionIndex].archivedIdList = [];
                            var k, archcontent;
                            for (var i = 0; i < st.dataArchived.length; i++){
                                st.dataArchived[i].sessionIndex = k = host.database.chat_sessions.getIndex(st.dataArchived[i].sessionid);
                                if (st.dataArchived[i].content !== undefined){
                                    st.dataArchived[i].content = EncodingClass.string.toVariable(st.dataArchived[i].content);
                                    host.database.chat_sessions.items[k].content = st.dataArchived[i].content.concat(host.database.chat_sessions.items[k].content);
                                }
                                else {
                                    host.database.chat_sessions.items[k].archivedIdList.push(host.database.archived_chats.items.length);
                                }
                                host.database.archived_chats.items.push(st.dataArchived[i]);
                            }
                            host.database.chat_sessions.items[sessionIndex].membersIdList = data.listMember;
                            carddone.chats.generateDataChat(host, host.database.chat_sessions.items[sessionIndex]);
                        }
                        resolve({
                            item: host.database.chat_sessions.items[sessionIndex],
                            isAdd: st.isAdd
                        });
                        if (st.isAdd){
                            var receiverids = [];
                            var userIndex;
                            for (var i = 0; i < data.listMember.length; i++){
                                if (data.listMember[i] == systemconfig.userid) continue;
                                userIndex = data_module.users.getByhomeid(data.listMember[i]);
                                if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                            }
                            var randomId = contentModule.generateRandom();
                            host.listMessRandomAccept.push(randomId);
                            host.funcs.sendMessage({
                                tabid: host.holder.id,
                                type: "add_session",
                                dataSession: {
                                    id: host.database.chat_sessions.items[sessionIndex].id,
                                    name: host.database.chat_sessions.items[sessionIndex].name,
                                    cardid: 0,
                                    lasttime: new Date(),
                                    content: [],
                                    archivedIdList: []
                                },
                                listMember: data.listMember,
                                randomId: randomId
                            });
                        }
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

carddone.chats.changeAvatarGroup = function(host, sessionid, src){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "chat_change_avatar_group.php",
            params: [
                {name: "sessionid", value: sessionid},
                {name: "avatar", value: src},
                {name: "domainGoup_avatars",value: window.domainGoup_avatars}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var avatar = message.substr(2);
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        host.database.chat_sessions.items[sessionIndex].avatar = avatar;
                        // console.log(host.database.chat_sessions.items[sessionIndex]);
                        resolve();
                        // console.log(window.domain + window.domainGoup_avatars + avatar);
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            tabid: host.holder.id,
                            type: "change_group_avatar",
                            sessionid: sessionid,
                            avatarSrc: window.domainGoup_avatars + avatar,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            randomId: randomId
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

carddone.chats.changeNameGroup = function(host, sessionid, name){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "chat_change_name_group.php",
            params: [
                {name: "sessionid", value: sessionid},
                {name: "name", value: name}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        host.database.chat_sessions.items[sessionIndex].name = name;
                        resolve();
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            tabid: host.holder.id,
                            type: "change_group_name",
                            sessionid: sessionid,
                            name: name,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            randomId: randomId
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

carddone.chats.addMemberGroup = function(host, sessionid, listMember){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "chat_add_member_group.php",
            params: [
                {name: "sessionid", value: sessionid},
                {name: "listMember", value: EncodingClass.string.fromVariable(listMember)},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        // console.log(st);
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        host.database.chat_sessions.items[sessionIndex].membersIdList = host.database.chat_sessions.items[sessionIndex].membersIdList.concat(listMember);
                        st.newMess.fullname = systemconfig.fullname;
                        resolve(st.newMess);
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            tabid: host.holder.id,
                            type: "add_member_group",
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            listMemberAdd: listMember,
                            newMess: st.newMess,
                            userid: systemconfig.userid,
                            randomId: randomId
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

carddone.chats.generateDataChat = function(host, item){
    carddone.chats.generateDataChatContent(host, item.content);
    item.memberList = [];
    for (var i = 0; i < item.membersIdList.length; i++){
        var uIndex = data_module.users.getByhomeid(item.membersIdList[i]);
        if (uIndex < 0) continue;
        item.memberList.push({
            id: item.membersIdList[i],
            username: data_module.users.items[uIndex].username,
            fullname: data_module.users.items[uIndex].fullname,
            avatarSrc: data_module.users.items[uIndex].avatarSrc
        });
    }
    if (item.cardid > 0 || item.membersIdList.length > 2) {
        if (item.avatar !== "" && item.avatar !== undefined){
            item.avatarSrc = window.domainGoup_avatars + item.avatar;
        }
        else {
            item.avatarSrc = window.domainGoup_avatars + "group.png";
        }
    }
    else {
        for (var j = 0; j < item.membersIdList.length; j++){
            if (item.membersIdList[j] !== systemconfig.userid){
                var userIndex = data_module.users.getByhomeid(item.membersIdList[j]);
                item.avatarSrc = data_module.users.items[userIndex].avatarSrc;
                item.name = data_module.users.items[userIndex].fullname;
                break;
            }
        }
    }

    item.sendFunc = function(host, item){
        return function(text, files, images, listIdLocal){
            return new Promise(function(resolve, reject){
                carddone.chats.sendMess(host, item.id, text, files, images, listIdLocal).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.seenFunc = function(host, item){
        return function(messid){
            return new Promise(function(resolve, reject){
                carddone.chats.seenMess(host, item.id, messid).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.loadOldMessFunc = function(host, item){
        return function(){
            return new Promise(function(resolve, reject){
                carddone.chats.loadOldMess(host, item.id).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.editMessageFunc = function(host, item){
        return function(localid, content){
            return new Promise(function(resolve, reject){
                carddone.chats.editMessage(host, item.id, localid, content).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.deleteMessageFunc = function(host, item){
        return function(localid, content){
            return new Promise(function(resolve, reject){
                carddone.chats.deleteMessage(host, item.id, localid).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.changeAvatarGroupFunc = function(host, item){
        return function(src){
            return new Promise(function(resolve, reject){
                carddone.chats.changeAvatarGroup(host, item.id, src).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.changeNameGroupFunc = function(host, item){
        return function(name){
            return new Promise(function(resolve, reject){
                carddone.chats.changeNameGroup(host, item.id, name).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.addMemberGroupFunc = function(host, item){
        return function(listMember){
            return new Promise(function(resolve, reject){
                carddone.chats.addMemberGroup(host, item.id, listMember).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
};

carddone.chats.loadChat_sessionsOld = function(host){
    return new Promise(function(resolve, reject){
        if (host.isOver) return;
        ModalElement.show_loading();
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "chat_load_old_chat_sessions"},
                {name: "card_permission_list", value: EncodingClass.string.fromVariable(systemconfig.card_permission_list)},
                {name: "startNumber", value: host.database.chat_sessions.items.length},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var sessionDel = -1;
                        if (st.chat_sessions.length == 0) host.isOver = true;
                        for (var i = 0; i < st.chat_sessions.length; i++){
                            host.database.chat_sessions.items.push(st.chat_sessions[i]);
                        }
                        for (var i = 0; i < st.chat_session_members.length; i++){
                            host.database.chat_session_members.items.push(st.chat_session_members[i]);
                        }
                        for (var i = 0; i < st.archived_chats.length; i++){
                            host.database.archived_chats.items.push(st.chat_sessions[i]);
                        }
                        st.chat_sessions.getIndex = function(id){
                            for (var i = 0; i < st.chat_sessions.length; i++){
                                if (st.chat_sessions[i].id == id){
                                    return i;
                                }
                            }
                            return -1;
                        }
                        st.chat_sessions.getByCardid = function(cardid){
                            for (var i = 0; i < st.chat_sessions.length; i++){
                                if (st.chat_sessions[i].cardid == cardid){
                                    return i;
                                }
                            }
                            return -1;
                        }
                        //makeChat_session_membersIndex
                        for (var i = 0; i < st.chat_sessions.length; i++){
                            st.chat_sessions[i].membersIdList = [];
                            st.chat_sessions[i].mess_seen_id = 0;
                        }
                        var k;
                        for (var i = 0; i < st.chat_session_members.length; i++){
                            st.chat_session_members[i].sessionIndex = k = st.chat_sessions.getIndex(st.chat_session_members[i].sessionid);
                            if (k >= 0){
                                if (st.chat_session_members[i].userid == systemconfig.userid){
                                    if (st.chat_session_members[i].mess_seen_id == "") st.chat_sessions[k].mess_seen_id = 0;
                                    else st.chat_sessions[k].mess_seen_id = parseInt(st.chat_session_members[i].mess_seen_id, 10);
                                }
                                st.chat_sessions[k].membersIdList.push(st.chat_session_members[i].userid);
                            }
                        }
                        //makeChat_sessionsContent
                        for (var i = 0; i < st.chat_sessions.length; i++){
                            st.chat_sessions[i].content = EncodingClass.string.toVariable(st.chat_sessions[i].content);
                            st.chat_sessions[i].archivedIdList = [];
                            st.chat_sessions[i].company_contactName = "";
                        }
                        var k1, k2;
                        for (var i = 0; i < st.company_card.length; i++){
                            k1 = st.chat_sessions.getByCardid(st.company_card[i].hostid);
                            k2 = data_module.companies.getIndex(st.company_card[i].companyid);
                            if (k1 >= 0 && k2 >= 0){
                                st.chat_sessions[k1].company_contactName += " -- " + data_module.companies.items[k2].name;
                            }
                        }
                        for (var i = 0; i < st.contact_card.length; i++){
                            k1 = st.chat_sessions.getByCardid(st.contact_card[i].hostid);
                            k2 = data_module.contact.getIndex(st.contact_card[i].contactid);
                            if (k1 >= 0 && k2 >= 0){
                                st.chat_sessions[k1].company_contactName += " -- " + data_module.contact.items[k2].firstname + " " + data_module.contact.items[k2].lastname;
                            }
                        }
                        for (var i = 0; i < st.chat_sessions.length; i++){
                            st.chat_sessions[i].company_contactName = st.chat_sessions[i].company_contactName.substr(4);
                        }
                        var k, archcontent;
                        for (var i = 0; i < st.archived_chats.length; i++){
                            st.archived_chats[i].sessionIndex = k = st.chat_sessions.getIndex(st.archived_chats[i].sessionid);
                            if (st.archived_chats[i].content !== undefined){
                                st.archived_chats[i].content = EncodingClass.string.toVariable(st.archived_chats[i].content);
                                st.chat_sessions[k].content = st.archived_chats[i].content.concat(st.chat_sessions[k].content);
                            }
                            else {
                                st.chat_sessions[k].archivedIdList.push(st.archived_chats[i].id);
                            }
                        }
                        for (var i = 0; i < st.chat_sessions.length; i++){
                            carddone.chats.generateDataChat(host, st.chat_sessions[i]);
                        }
                        resolve(st.chat_sessions);
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

carddone.chats.loadChatSessionDetails = function(host, sessionid){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "chats_loads_session_details"},
                {name: "id", value: sessionid}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        if (host.database.chat_sessions.getIndex(st.dataSession.id) < 0){
                            host.database.chat_sessions.items.push(st.dataSession);
                            for (var i = 0; i < st.chat_session_members.length; i++){
                                host.database.chat_session_members.items.push(st.chat_session_members[i]);
                            }
                            contentModule.makeChat_session_membersIndex(host);
                            var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                            host.database.chat_sessions.items[sessionIndex].content = EncodingClass.string.toVariable(host.database.chat_sessions.items[sessionIndex].content);
                            host.database.chat_sessions.items[sessionIndex].archivedIdList = [];
                            var k, archcontent;
                            for (var i = 0; i < st.dataArchived.length; i++){
                                st.dataArchived[i].sessionIndex = k = host.database.chat_sessions.getIndex(st.dataArchived[i].sessionid);
                                if (st.dataArchived[i].content !== undefined){
                                    st.dataArchived[i].content = EncodingClass.string.toVariable(st.dataArchived[i].content);
                                    host.database.chat_sessions.items[k].content = st.dataArchived[i].content.concat(host.database.chat_sessions.items[k].content);
                                }
                                else {
                                    host.database.chat_sessions.items[k].archivedIdList.push(st.dataArchived[i].id);
                                }
                                host.database.archived_chats.items.push(st.dataArchived[i]);
                            }
                            carddone.chats.generateDataChat(host, host.database.chat_sessions.items[sessionIndex]);
                            resolve({
                                type: "add_session",
                                item: host.database.chat_sessions.items[sessionIndex]
                            });
                        }
                    }
                    else if (message == "data_null"){
                        return;
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

carddone.chats.init = function(host){
    return new Promise(function(rs, rj){
        if (!data_module.users || !data_module.companies || !data_module.contact){
            for (var i = 0; i < ModalElement.layerstatus.length; i++){
                if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
            }
            setTimeout(function(){
                carddone.chats.init(host);
            }, 50);
            return;
        }
        // console.log(host.holder.id);
        host.isOver = false;
        if (host.cardid === undefined) host.cardid = 0;
        host.listMessRandomAccept = [];
        ModalElement.show_loading();
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "chats_load_list"},
                {name: "cardid", value: host.cardid},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        host.database = {};
                        systemconfig.card_permission_list = st.card_permission_list;
                        delete st.card_permission_list;
                        contentModule.makeDatabaseContent(host.database, st);
                        contentModule.makeChat_session_membersIndex(host);
                        contentModule.makeChat_sessionsContent(host);
                        contentModule.makeAvatarUser();
                        console.log(host.database);
                        data_module.users.getByhomeid = function(homeid){
                            for (var i = 0; i < data_module.users.items.length; i++){
                                if (data_module.users.items[i].homeid == homeid){
                                    return i;
                                }
                            }
                            return -1;
                        };
                        for (var i = 0; i < host.database.chat_sessions.items.length; i++){
                            carddone.chats.generateDataChat(host, host.database.chat_sessions.items[i]);
                        }
                        host.database.chat_sessions.items.functionMessage = function(){
                            var temp = new Promise(function(resolve, reject){
                                new Promise(function(tempResolve,tempReject){
                                    host.resolveMessage = tempResolve;

                                }).then(function(message){
                                    var content = message.content;
                                    if (host.listMessRandomAccept.indexOf(content.randomId) >= 0) return;
                                    host.listMessRandomAccept.push(content.randomId);
                                    switch (content.type) {
                                        case "addmessage":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                                            if (sessionIndex < 0) {
                                                carddone.chats.loadChatSessionDetails(host, content.sessionid).then(function(value){
                                                    resolve(value);
                                                });
                                            }
                                            else {
                                                var uIndex;
                                                for (var i = 0; i < content.dataDraw.length; i++){
                                                    if (content.dataDraw[i].userid == systemconfig.userid){
                                                        content.dataDraw[i].type = "me";
                                                    }
                                                    else {
                                                        content.dataDraw[i].type = "other";
                                                        uIndex = data_module.users.getByhomeid(content.dataDraw[i].userid);
                                                        if (uIndex < 0) continue;
                                                        content.dataDraw[i].avatarSrc = data_module.users.items[uIndex].avatarSrc;
                                                    }
                                                }
                                                resolve({
                                                    type: "addmessage",
                                                    content: content
                                                });
                                            }
                                            break;
                                        case "add_session":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            carddone.chats.loadChatSessionDetails(host, content.dataSession.id).then(function(value){
                                                resolve(value);
                                            });
                                        case "say_hi":
                                            var userIndex = data_module.users.getByhomeid(content.userSend);
                                            if (userIndex < 0){
                                                console.log(content.userSend);
                                                return;
                                            }
                                            data_module.users.items[userIndex].clientid = message.senderinfo.clientid;
                                            this.send({
                                                content: {
                                                    type: "response",
                                                    userSend: systemconfig.userid
                                                },
                                                receivertype: "single",
                                                receiverid: message.senderinfo.clientid,
                                                onsent: function () {
                                                    // console.log("response");
                                                }
                                            });
                                            break;
                                        case "response":
                                            if (content.userSend == systemconfig.userid) return;
                                            var userIndex = data_module.users.getByhomeid(content.userSend);
                                            if (userIndex < 0){
                                                // console.log(content.userSend);
                                                return;
                                            }
                                            data_module.users.items[userIndex].clientid = message.senderinfo.clientid;
                                            break;
                                        case "editmessage":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                                            // console.log(sessionIndex, host.database.chat_sessions, content.sessionid);
                                            if (sessionIndex >= 0){
                                                for (var j = 0; j < host.database.chat_sessions.items[sessionIndex].content.length; j++){
                                                    if (host.database.chat_sessions.items[sessionIndex].content[j].localid == content.localid){
                                                        host.database.chat_sessions.items[sessionIndex].content[j].content = content.content;
                                                        host.database.chat_sessions.items[sessionIndex].content[j].isEdit = 1;
                                                    }
                                                }
                                                resolve({
                                                    type: "editmessage",
                                                    content: content
                                                });
                                            }
                                            break;
                                        case "deletemessage":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                                            if (sessionIndex >= 0){
                                                for (var j = 0; j < host.database.chat_sessions.items[sessionIndex].content.length; j++){
                                                    if (host.database.chat_sessions.items[sessionIndex].content[j].localid == content.localid){
                                                        host.database.chat_sessions.items[sessionIndex].content.splice(j, 1);
                                                    }
                                                }
                                                resolve({
                                                    type: "deletemessage",
                                                    content: content
                                                });
                                            }
                                            break;
                                        case "change_group_name":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                                            // console.log(sessionIndex);
                                            if (sessionIndex < 0) return;
                                            resolve(content);
                                            break;
                                        case "change_group_avatar":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                                            if (sessionIndex < 0) return;
                                            resolve(content);
                                            break;
                                        case "add_member_group":
                                            if (content.listMember.indexOf(systemconfig.userid) < 0) return;
                                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                                            if (sessionIndex < 0) {
                                                carddone.chats.loadChatSessionDetails(host, content.dataSession.id).then(function(value){
                                                    resolve(value);
                                                });
                                            }
                                            else {
                                                host.database.chat_sessions.items[sessionIndex].membersIdList = content.listMember;
                                                var uIndex;
                                                for (var i = 0; i < content.listMemberAdd.length; i++){
                                                    uIndex = data_module.users.getByhomeid(content.listMemberAdd[i]);
                                                    host.database.chat_sessions.items[sessionIndex].memberList.push({
                                                        id: content.listMemberAdd[i],
                                                        username: data_module.users.items[uIndex].username,
                                                        fullname: data_module.users.items[uIndex].fullname,
                                                        avatarSrc: data_module.users.items[uIndex].avatarSrc
                                                    });
                                                }
                                            }
                                            break;
                                        default:

                                        break;

                                    }
                                });
                            });
                            return temp;
                        }

                        host.database.chat_sessions.items.functionOpenChat = function(){
                            var temp = new Promise(function(resolve, reject){
                                new Promise(function(tempResolve,tempReject){
                                    host.resolveOpenChat = tempResolve;

                                }).then(function(message){
                                    console.log(message);
                                    resolve(message);
                                });
                            });
                            return temp;
                        }
                        host.database.chat_sessions.items.addgroupFunc = function(dataSess){
                            return new Promise(function(resolve, reject){
                                carddone.chats.addSession(host, dataSess).then(function(value){
                                    resolve(value);
                                });
                            });
                        };
                        host.database.chat_sessions.items.loadChat_sessionsOldFunc = function(){
                            return new Promise(function(resolve, reject){
                                carddone.chats.loadChat_sessionsOld(host).then(function(value){
                                    resolve(value);
                                });
                            });
                        };
                        var cmdbutton = {
                            close: function () {
                                carddone.menu.tabPanel.removeTab(host.holder.id);
                            }
                        };
                        var listUserAdd = [];
                        for (var i = 0; i < data_module.users.items.length; i++){
                            if (data_module.users.items[i].homeid == systemconfig.userid) continue;
                            listUserAdd.push({
                                value: data_module.users.items[i].homeid,
                                text: data_module.users.items[i].username + " (" + data_module.users.items[i].fullname + ")"
                            });
                        }
                        host.database.chat_sessions.items.listUserAdd = listUserAdd;
                        var openChat = false;
                        if (host.cardid > 0) {
                            openChat = true;
                            carddone.chats.generateDataChat(host, st.dataChatCard);
                        }
                        var usersList = [];
                        for (var i = 0; i < data_module.users.items.length; i++){
                            usersList.push({
                                id: data_module.users.items[i].homeid,
                                username: data_module.users.items[i].username,
                                fullname: data_module.users.items[i].fullname,
                                avatarSrc: data_module.users.items[i].avatarSrc
                            });
                        }
                        host.funcs.formChatsInit({
                            holder: host.holder,
                            cmdbutton: cmdbutton,
                            data: host.database.chat_sessions.items,
                            openChat: openChat,
                            sessionActive: st.dataChatCard,
                            usersList: usersList
                        });
                        if (host.cardid > 0){
                            if (host.database.chat_sessions.getIndex(st.dataChatCard.id) < 0){
                                host.database.chat_sessions.items.push(st.dataChatCard);
                            }
                        }
                        rs();
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
ModuleManagerClass.register({
    name: "Chats",
    prerequisites: ["ModalElement", "FormClass"]
});
