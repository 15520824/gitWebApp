
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
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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
                        // var receiverids = [];
                        // var userIndex;
                        // for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                        //     if (host.database.chat_sessions.items[sIndex].membersIdList[i].userid == systemconfig.userid) continue;
                        //     userIndex = data_module.users.getByhomeid(host.database.chat_sessions.items[sIndex].membersIdList[i].userid);
                        //     if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                        // }
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "deletemessage",
                            localid: localid,
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sIndex].membersIdList,
                            randomId: randomId,
                            lastMess: lastMess
                        });
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
                    }
                    else {
                        // ModalElement.alert({message: message});
                    }
                }
                else {
                    // ModalElement.alert({message: message});
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
                        // var receiverids = [];
                        var userIndex;
                        for (var j = 0; j < host.database.chat_sessions.items[sIndex].content.length; j++){
                            if (host.database.chat_sessions.items[sIndex].content[j].localid == localid){
                                host.database.chat_sessions.items[sIndex].content[j].content = content;
                                host.database.chat_sessions.items[sIndex].content[j].isEdit = 1;
                            }
                        }
                        // for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                        //     if (host.database.chat_sessions.items[sIndex].membersIdList[i].userid == systemconfig.userid) continue;
                        //     userIndex = data_module.users.getByhomeid(host.database.chat_sessions.items[sIndex].membersIdList[i].userid);
                        //     if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                        // }
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        var dataDraw = {
                            messageType: "chat",
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
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
                    }
                    else {
                        ModalElement.alert({message: message});
                    }
                }
                else {
                    var dataDraw = {
                        tabid: host.holder.id,
                        type: "editmessage",
                        localid: localid,
                        content: content,
                        sessionid: sessionid,
                        randomId: randomId,
                        failed: true
                    };
                    resolve(dataDraw);
                }
            }
        });
    });
};

carddone.chats.sendMess = function (host, sessionid, text, files, images, listIdLocal) {
    return new Promise(function (resolveMessage, rejectMessage) {
        var sIndex = host.database.chat_sessions.getIndex(sessionid);
        if (sIndex < 0){
            if (host.dataChatCard.id == sessionid){
                host.database.chat_sessions.items.unshift(host.dataChatCard);
                sIndex = 0;
            }
            else {
                console.log("failes_sessionid");
                return;
            }
        }
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
            var membersIdList = [];
            for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                membersIdList.push(host.database.chat_sessions.items[sIndex].membersIdList[i].userid);
            }
            FormClass.api_call({
                url: "chats_save_message.php",
                params: [
                    {
                        name: "sessionid",
                        value: sessionid
                    },
                    {
                        name: "membersIdList",
                        value: EncodingClass.string.fromVariable(membersIdList)
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
                    {
                        name: "domain",
                        value: window.domain
                    },
                    {name: "listIdLocal", value: EncodingClass.string.fromVariable(listIdLocal)}
                ],
                fileuploads: filesToUpload,
                func: function (success, message) {
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
                        // var receiverids = [];
                        var userIndex;
                        // for (var i = 0; i < host.database.chat_sessions.items[sIndex].membersIdList.length; i++){
                        //     if (host.database.chat_sessions.items[sIndex].membersIdList[i].userid == systemconfig.userid) continue;
                        //     userIndex = data_module.users.getByhomeid(host.database.chat_sessions.items[sIndex].membersIdList[i].userid);
                        //     if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                        // }
                        resolveMessage(dataDraw);
                        if (!failed){
                            host.database.chat_sessions.items[sIndex].content = host.database.chat_sessions.items[sIndex].content.concat(dataDraw);
                            host.database.chat_sessions.items[sIndex].lasttime = new Date();
                            var randomId = contentModule.generateRandom();
                            host.listMessRandomAccept.push(randomId);
                            host.funcs.sendMessage({
                                messageType: "chat",
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
                            drawMessage();
                            dbcache.refresh("chat_sessions");
                            dbcache.refresh("chat_session_members");
                            dbcache.refresh("archived_chats");
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
        var item;
        if (sessionIndex < 0){
            item = host.dataChatCard;
        }
        else {
            item = host.database.chat_sessions.items[sessionIndex];
        }
        if (item.archivedIdList.length == 0){
            resolve([]);
        }
        else {
            var archivedid = item.archivedIdList[0];
            ModalElement.show_loading();
            dbcache.loadById({
                name: "archived_chats",
                id: archivedid,
                callback: function(retval){
                    if (retval === undefined){
                        ModalElement.alert({message: "failed_archived_chats"});
                        return;
                    }
                    else {
                        var content = EncodingClass.string.duplicate(retval);
                        carddone.chats.generateDataChatContent(host, content);
                        item.content = content.concat(item.content);
                        item.archivedIdList.splice(0, 1);
                        resolve(content);
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
        var localid = (new Date()).getTime();
        FormClass.api_call({
            url: "chats_add_session.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)},
                {name: "localid", value: localid}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        console.log(st);
                        var sessionid = st.dataSession.id;
                        var tempIndex = host.database.chat_sessions.getIndex(sessionid);
                        if (tempIndex >= 0){
                            if (host.database.chat_sessions.items[tempIndex].isdelete !== undefined && host.database.chat_sessions.items[tempIndex].isdelete) host.database.chat_sessions.items.splice(tempIndex, 1);
                            for (var i = host.database.chat_session_members.items.length - 1; i >= 0; i--){
                                if (host.database.chat_session_members.items[i].sessionid == sessionid) host.database.chat_session_members.items.splice(i, 1);
                            }
                        }
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        if (sessionIndex < 0){
                            host.database.chat_sessions.items.push(st.dataSession);
                            for (var i = 0; i < st.members.length; i++){
                                host.database.chat_session_members.items.push(st.members[i]);
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
                            host.database.chat_sessions.items[sessionIndex].membersIdList = [];
                            var privilege = 0;
                            if (data.listMember.length > 2) host.database.chat_sessions.items[sessionIndex].privilege = 2;
                            for (var i = 0; i < data.listMember.length; i++){
                                if (data.listMember.length > 2){
                                    privilege = (systemconfig.userid == data.listMember[i])? 2 : 0;
                                }
                                host.database.chat_sessions.items[sessionIndex].membersIdList.push({
                                    userid: data.listMember[i],
                                    privilege: privilege
                                });
                            }
                            if (host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                                var content = [];
                                for (var j = host.database.chat_sessions.items[sessionIndex].content.length - 1; j >= 0; j--){
                                    if (host.database.chat_sessions.items[sessionIndex].content[j].localid > host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                                        content.unshift(host.database.chat_sessions.items[sessionIndex].content[j]);
                                    }
                                    else if (host.database.chat_sessions.items[sessionIndex].content[j].localid <= host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                                        host.database.chat_sessions.items[sessionIndex].archivedIdList = [];
                                        break;
                                    }
                                }
                                host.database.chat_sessions.items[sessionIndex].content = content;
                            }
                            carddone.chats.generateDataChat(host, host.database.chat_sessions.items[sessionIndex]);
                        }
                        resolve({
                            item: host.database.chat_sessions.items[sessionIndex],
                            isAdd: st.isAdd
                        });
                        if (st.isAdd){
                            // var receiverids = [];
                            var userIndex;
                            // for (var i = 0; i < data.listMember.length; i++){
                            //     if (data.listMember[i] == systemconfig.userid) continue;
                            //     userIndex = data_module.users.getByhomeid(data.listMember[i]);
                            //     if (data_module.users.items[userIndex].clientid !== undefined) receiverids.push(data_module.users.items[userIndex].clientid);
                            // }
                            var randomId = contentModule.generateRandom();
                            host.listMessRandomAccept.push(randomId);
                            host.funcs.sendMessage({
                                messageType: "chat",
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
                                listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                                randomId: randomId
                            });
                        }
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "change_group_avatar",
                            sessionid: sessionid,
                            avatarSrc: window.domainGoup_avatars + avatar,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            randomId: randomId
                        });
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "change_group_name",
                            sessionid: sessionid,
                            name: name,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            randomId: randomId
                        });
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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
                        for (var i = 0; i < listMember.length; i++){
                            host.database.chat_sessions.items[sessionIndex].membersIdList.push({
                                userid: listMember[i],
                                privilege: 0
                            });
                        }
                        st.newMess.fullname = systemconfig.fullname;
                        if (st.newMess.userid == systemconfig.userid) st.newMess.type = "me";
                        else st.newMess.type = "other";
                        host.database.chat_sessions.items[sessionIndex].content.push(st.newMess);
                        resolve(st.newMess);
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "add_member_group",
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            listMemberAdd: listMember,
                            newMess: st.newMess,
                            userid: systemconfig.userid,
                            randomId: randomId
                        });
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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

carddone.chats.removeMemberGroup = function(host, sessionid, userid){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "chat_remove_member_group.php",
            params: [
                {name: "sessionid", value: sessionid},
                {name: "userRemove", value: userid},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "remove_member_group",
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sessionIndex].membersIdList,
                            userRemove: userid,
                            newMess: st.newMess,
                            userid: systemconfig.userid,
                            randomId: randomId
                        });
                        for (var i = 0; i < host.database.chat_sessions.items[sessionIndex].membersIdList.length; i++){
                            if (host.database.chat_sessions.items[sessionIndex].membersIdList[i].userid == userid){
                                host.database.chat_sessions.items[sessionIndex].membersIdList.splice(i, 1);
                                break;
                            }
                        }
                        st.newMess.fullname = systemconfig.fullname;
                        if (st.newMess.userid == systemconfig.userid) st.newMess.type = "me";
                        else st.newMess.type = "other";
                        host.database.chat_sessions.items[sessionIndex].content.push(st.newMess);
                        resolve(st.newMess);
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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

carddone.chats.deleteGroup = function(host, sessionid){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "chats_delete_group.php",
            params: [{name: "sessionid", value: sessionid}],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        host.database.chat_sessions.items[sessionIndex].isdelete = true;//làm dấu chỉ xóa nội dung chat
                        resolve();
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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

carddone.chats.leaveGroup = function(host, sessionid){
    return new Promise(function(resolve, reject){
        FormClass.api_call({
            url: "chats_leave_group.php",
            params: [
                {name: "sessionid", value: sessionid},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var sIndex = host.database.chat_sessions.getIndex(sessionid);
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "leave_group",
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sIndex].membersIdList,
                            userLeave: systemconfig.userid,
                            newMess: st.newMess,
                            userid: systemconfig.userid,
                            randomId: randomId
                        });
                        host.database.chat_sessions.items.splice(sIndex, 1);
                        for (var i = host.database.chat_session_members.items.length -1; i >= 0; i--){
                            if (host.database.chat_session_members.items[i].sessionid == sessionid) host.database.chat_session_members.items.splice(i, 1);
                        }
                        resolve();
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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

carddone.chats.dissolveGroup = function(host, sessionid){
    return new Promise(function(success, message){
        FormClass.api_call({
            url: "chats_dissolve_group.php",
            params: [
                {name: "sessionid", value: sessionid}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var sIndex = host.database.chat_sessions.getIndex(sessionid);
                        var randomId = contentModule.generateRandom();
                        host.listMessRandomAccept.push(randomId);
                        host.funcs.sendMessage({
                            messageType: "chat",
                            tabid: host.holder.id,
                            type: "dissolve_group",
                            sessionid: sessionid,
                            listMember: host.database.chat_sessions.items[sIndex].membersIdList,
                            userid: systemconfig.userid,
                            randomId: randomId
                        });
                        host.database.chat_sessions.items.splice(sIndex, 1);
                        for (var i = host.database.chat_session_members.items.length -1; i >= 0; i--){
                            if (host.database.chat_session_members.items[i].sessionid == sessionid) host.database.chat_session_members.items.splice(i, 1);
                        }
                        resolve();
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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
        var uIndex = data_module.users.getByhomeid(item.membersIdList[i].userid);
        if (uIndex < 0) continue;
        item.memberList.push({
            id: item.membersIdList[i].userid,
            username: data_module.users.items[uIndex].username,
            fullname: data_module.users.items[uIndex].fullname,
            avatarSrc: data_module.users.items[uIndex].avatarSrc,
            privilege: item.membersIdList[i].privilege
        });
    }
    var isGroup = false;
    if (item.memberList.length > 2) isGroup = true;
    else {
        for (var x = 0; x < item.memberList.length; x++){
            if (item.memberList[x].privilege >= 2){
                isGroup = true;
                break;
            }
        }
    }
    if (item.cardid > 0 || isGroup) {
        if (item.avatar !== "" && item.avatar !== undefined){
            item.avatarSrc = window.domainGoup_avatars + item.avatar;
        }
        else {
            item.avatarSrc = window.domainGoup_avatars + "group.png";
        }
    }
    else {
        for (var j = 0; j < item.membersIdList.length; j++){
            if (item.membersIdList[j].userid !== systemconfig.userid){
                var userIndex = data_module.users.getByhomeid(item.membersIdList[j].userid);
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
    item.removeMemberFunc = function(host, item){
        return function(userid){
            return new Promise(function(resolve, reject){
                carddone.chats.removeMemberGroup(host, item.id, userid).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.deleteFunc = function(host, item){
        return function(){
            return new Promise(function(resolve, reject){
                carddone.chats.deleteGroup(host, item.id).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.leaveFunc = function(host, item){
        return function(){
            return new Promise(function(resolve, reject){
                carddone.chats.leaveGroup(host, item.id).then(function(value){
                    resolve(value);
                });
            });
        }
    }(host, item);
    item.dissolveFunc = function(host, item){
        return function(){
            return new Promise(function(resolve, reject){
                carddone.chats.dissolveGroup(host, item.id).then(function(value){
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
        carddone.chats.loadChat_sessionsList(host, host.database.chat_sessions.items.length).then(function(value){
            ModalElement.close(-1);
            var st = EncodingClass.string.duplicate(value);
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
                st.chat_sessions[i].start_mess_id = 0;
            }
            var k;
            for (var i = 0; i < st.chat_session_members.length; i++){
                st.chat_session_members[i].sessionIndex = k = st.chat_sessions.getIndex(st.chat_session_members[i].sessionid);
                if (k >= 0){
                    if (st.chat_session_members[i].userid == systemconfig.userid){
                        if (st.chat_session_members[i].mess_seen_id != "") st.chat_sessions[k].mess_seen_id = parseInt(st.chat_session_members[i].mess_seen_id, 10);
                        if (st.chat_session_members[i].start_mess_id != "") st.chat_sessions[k].start_mess_id = parseInt(st.chat_session_members[i].start_mess_id, 10);
                        st.chat_sessions[k].privilege = st.chat_session_members[i].privilege;
                    }
                    st.chat_sessions[k].membersIdList.push({
                        userid: st.chat_session_members[i].userid,
                        privilege: st.chat_session_members[i].privilege
                    });
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
                k2 = host.database.companies.getIndex(st.company_card[i].companyid);
                if (k1 >= 0 && k2 >= 0){
                    if (host.database.companies.items[k2].permission > 0){
                        st.chat_sessions[k1].company_contactName += " -- " + host.database.companies.items[k2].name;
                    }
                }
            }
            for (var i = 0; i < st.contact_card.length; i++){
                k1 = st.chat_sessions.getByCardid(st.contact_card[i].hostid);
                k2 = host.database.contact.getIndex(st.contact_card[i].contactid);
                if (k1 >= 0 && k2 >= 0){
                    if (host.database.contact.items[k2].permission > 0){
                        st.chat_sessions[k1].company_contactName += " -- " + host.database.contact.items[k2].firstname + " " + host.database.contact.items[k2].lastname;
                    }
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
            var content;
            for (var i = 0; i < st.chat_sessions.length; i++){
                if (st.chat_sessions[i].start_mess_id == 0) continue;
                content = [];
                for (var j = st.chat_sessions[i].content.length - 1; j >= 0; j--){
                    if (st.chat_sessions[i].content[j].localid > st.chat_sessions[i].start_mess_id) {
                        content.unshift(st.chat_sessions[i].content[j]);
                    }
                    else if (st.chat_sessions[i].content[j].localid <= st.chat_sessions[i].start_mess_id) {
                        st.chat_sessions[i].archivedIdList = [];
                        break;
                    }
                }
                st.chat_sessions[i].content = content;
            }
            for (var i = 0; i < st.chat_sessions.length; i++){
                carddone.chats.generateDataChat(host, st.chat_sessions[i]);
            }
            resolve(st.chat_sessions);
        });
    });
};

carddone.chats.loadChatSessionDetails = function(host, sessionid){
    return new Promise(function(resolve, reject){
        var promiseList = {};
        var st = {};
        promiseList.chat_sessions = new Promise(function(rs, rj){
            dbcache.loadById({
                name: "chat_sessions",
                id: sessionid,
                callback: function(retval){
                    if (retval === undefined){
                        ModalElement.alert({message: "data_null"});
                        return;
                    }
                    else {
                        st.dataSession = EncodingClass.string.duplicate(retval);
                        rs();
                    }
                }
            });
        });
        promiseList.chat_session_members = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "chat_session_members",
                cond: function(record){
                    return record.sessionid == sessionid;
                },
                callback: function(retval){
                    st.chat_session_members = EncodingClass.string.duplicate(retval);
                    rs();
                }
            });
        });
        promiseList.archived_chats = new Promise(function(rs, rj){
            dbcache.loadByCondition({
                name: "archived_chats",
                cond: function(record){
                    return record.sessionid == sessionid;
                },
                callback: function(retval){
                    st.dataArchived = EncodingClass.string.duplicate(retval);
                    st.dataArchived.sort(function(a, b){
                        return b.id - a.id;
                    });
                    rs();
                }
            });
        });
        Promise.all([promiseList.chat_sessions, promiseList.chat_session_members, promiseList.archived_chats]).then(function(){
            var tempIndex = host.database.chat_sessions.getIndex(sessionid);
            if (tempIndex >= 0){
                if (host.database.chat_sessions.items[tempIndex].isdelete !== undefined && host.database.chat_sessions.items[tempIndex].isdelete) host.database.chat_sessions.items.splice(tempIndex, 1);
                for (var i = host.database.chat_session_members.items.length - 1; i >= 0; i--){
                    if (host.database.chat_session_members.items[i].sessionid == sessionid) host.database.chat_session_members.items.splice(i, 1);
                }
            }
            if (host.database.chat_sessions.getIndex(st.dataSession.id) < 0){
                host.database.chat_sessions.items.unshift(st.dataSession);
                var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                host.database.chat_sessions.items[sessionIndex].mess_seen_id = 0;
                host.database.chat_sessions.items[sessionIndex].start_mess_id = 0;
                for (var i = 0; i < st.chat_session_members.length; i++){
                    host.database.chat_session_members.items.push(st.chat_session_members[i]);
                    if (st.chat_session_members[i].userid == systemconfig.userid){
                        if (st.chat_session_members[i].mess_seen_id != "") host.database.chat_sessions.items[sessionIndex].mess_seen_id = parseInt(st.chat_session_members[i].mess_seen_id, 10);
                        if (st.chat_session_members[i].start_mess_id != "") host.database.chat_sessions.items[sessionIndex].start_mess_id = parseInt(st.chat_session_members[i].start_mess_id, 10);
                    }
                }
                contentModule.makeChat_session_membersIndex(host);
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
                if (host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                    var content = [];
                    for (var j = host.database.chat_sessions.items[sessionIndex].content.length - 1; j >= 0; j--){
                        if (host.database.chat_sessions.items[sessionIndex].content[j].localid > host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                            content.unshift(host.database.chat_sessions.items[sessionIndex].content[j]);
                        }
                        else if (host.database.chat_sessions.items[sessionIndex].content[j].localid <= host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                            host.database.chat_sessions.items[sessionIndex].archivedIdList = [];
                            break;
                        }
                    }
                    host.database.chat_sessions.items[sessionIndex].content = content;
                }
                carddone.chats.generateDataChat(host, host.database.chat_sessions.items[sessionIndex]);
                console.log(host.database.chat_sessions.items[sessionIndex]);
                resolve({
                    type: "add_session",
                    item: host.database.chat_sessions.items[sessionIndex]
                });
            }
        });
    });
};

carddone.chats.checkIsMember = function(listMember){
    for (var i = 0; i < listMember.length; i++){
        if (listMember[i].userid == systemconfig.userid) return true;
    }
    return false;
};

carddone.chats.openNewChatFromCard = function(host, cardid){
    var ex = -1;
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        if (host.database.chat_sessions.items[i].cardid == cardid){
            ex = i;
            break;
        }
    }
    if (ex < 0){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "chats_loads_session_details_by_cardid"},
                {name: "cardid", value: cardid},
                {name: "localid", value: (new Date()).getTime()}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        console.log(st);
                        carddone.chats.generateDataChat(host, st.dataChatCard);
                        if (st.type == "new"){
                            host.dataChatCard = st.dataChatCard;
                            host.resolveMessage({
                                content: {
                                    tabid: host.holder.id,
                                    type: "add_session_2",
                                    item: host.database.chat_sessions.items[0],
                                    listMember: host.database.chat_sessions.items[0].membersIdList,
                                    randomId: contentModule.generateRandom(),
                                }
                            });
                        }
                        else {
                            host.dataChatCard = st.dataChatCard;
                            host.resolveMessage({
                                content: {
                                    randomId: contentModule.generateRandom(),
                                    type: "activechatbox",
                                    dataSession: host.dataChatCard
                                }
                            });
                        }
                        dbcache.refresh("chat_sessions");
                        dbcache.refresh("chat_session_members");
                        dbcache.refresh("archived_chats");
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
    else {
        host.resolveMessage({
            content: {
                randomId: contentModule.generateRandom(),
                type: "activechatbox",
                dataSession: host.database.chat_sessions.items[ex]
            }
        });
    }
};

carddone.chats.reloadChat = function(host){
    host.database.chat_sessions.items.sort(function(a, b){
        return b.lasttime.getTime() - a.lasttime.getTime();
    });
    host.reloadChatList = [];
    for (var i = 0; i < host.database.chat_sessions.items.length; i++){
        host.reloadChatList.push(host.database.chat_sessions.items[i].id);
    }
    var reloadChatFunc = function(){
        if (host.reloadChatList.length == 0) {
            return;
        }
        var sessionid = host.reloadChatList[0];
        var sIndex = host.database.chat_sessions.getIndex(sessionid);
        var countArchive = 1;
        if (sIndex >= 0){
            countArchive = parseInt(host.database.chat_sessions.items[sIndex].content.length/100, 10);
        }
        if (countArchive == 0) countArchive = 1;
        FormClass.api_call({
            url: "database_load.php",
            params: [
                {name: "task", value: "chats_loads_session_details"},
                {name: "id", value: sessionid},
                {name: "countArchive", value: countArchive}
            ],
            func: function(success, message){
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var sessionIndex = host.database.chat_sessions.getIndex(sessionid);
                        host.database.chat_sessions.items[sessionIndex].content = st.dataSession.content;
                        host.database.chat_sessions.items[sessionIndex].lasttime = st.dataSession.lasttime;
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
                        if (host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                            var content = [];
                            for (var j = host.database.chat_sessions.items[sessionIndex].content.length - 1; j >= 0; j--){
                                if (host.database.chat_sessions.items[sessionIndex].content[j].localid > host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                                    content.unshift(host.database.chat_sessions.items[sessionIndex].content[j]);
                                }
                                else if (host.database.chat_sessions.items[sessionIndex].content[j].localid <= host.database.chat_sessions.items[sessionIndex].start_mess_id) {
                                    host.database.chat_sessions.items[sessionIndex].archivedIdList = [];
                                    break;
                                }
                            }
                            host.database.chat_sessions.items[sessionIndex].content = content;
                        }
                        carddone.chats.generateDataChatContent(host, host.database.chat_sessions.items[sessionIndex].content);
                        host.resolveMessage({
                            content: {
                                randomId: contentModule.generateRandom(),
                                type: "reloadChat",
                                dataSession: host.database.chat_sessions.items[sessionIndex]
                            }
                        });
                        host.reloadChatList.shift();
                        reloadChatFunc();
                    }
                    else if (message == "data_null"){
                        host.reloadChatList.shift();
                        reloadChatFunc();
                    }
                    else {
                        console.log(message);
                    }
                }
                else {
                    reloadChatFunc();
                    console.log(message);
                }
            }
        });
    };
    reloadChatFunc();
};

carddone.chats.redraw = function(host){
    return new Promise(function(rs, rj){
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
                    dbcache.refresh("chat_sessions");
                    dbcache.refresh("chat_session_members");
                    dbcache.refresh("archived_chats");
                    switch (content.type) {
                        case "addmessage":
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            if (sessionIndex < 0) {
                                carddone.chats.loadChatSessionDetails(host, content.sessionid).then(function(value){
                                    resolve(value);
                                });
                            }
                            else if (host.database.chat_sessions.items[sessionIndex].isdelete !== undefined && host.database.chat_sessions.items[sessionIndex].isdelete){
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
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            carddone.chats.loadChatSessionDetails(host, content.dataSession.id).then(function(value){
                                resolve(value);
                            });
                            break;
                        case "add_session_2":
                            resolve({
                                type: "add_session",
                                item: content.item,
                                active: true
                            });
                            break;
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
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
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
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
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
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            // console.log(sessionIndex);
                            if (sessionIndex < 0) return;
                            resolve(content);
                            break;
                        case "change_group_avatar":
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            if (sessionIndex < 0) return;
                            resolve(content);
                            break;
                        case "add_member_group":
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            if (sessionIndex < 0) {
                                carddone.chats.loadChatSessionDetails(host, content.sessionid).then(function(value){
                                    resolve(value);
                                });
                            }
                            else if (host.database.chat_sessions.items[sessionIndex].isdelete !== undefined && host.database.chat_sessions.items[sessionIndex].isdelete){
                                carddone.chats.loadChatSessionDetails(host, content.sessionid).then(function(value){
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
                                        avatarSrc: data_module.users.items[uIndex].avatarSrc,
                                        privilege: 0
                                    });
                                }
                                if (content.newMess.userid == systemconfig.userid) content.newMess.type = "me";
                                else content.newMess.type = "other";
                                resolve({
                                    type: "addmessage",
                                    content: {
                                        sessionid: content.sessionid,
                                        dataDraw: [content.newMess]
                                    }
                                });
                            }
                            break;
                        case "remove_member_group":
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            if (sessionIndex >= 0) {
                                if (content.userRemove == systemconfig.userid){
                                    host.database.chat_sessions.items.splice(sessionIndex, 1);
                                    for (var i = host.database.chat_session_members.items.length -1; i >= 0; i--){
                                        if (host.database.chat_session_members.items[i].sessionid == content.sessionid) host.database.chat_session_members.items.splice(i, 1);
                                    }
                                    resolve({
                                        type: "remove_group",
                                        content: content.sessionid
                                    });
                                }
                                else {
                                    for (var i = 0; i < host.database.chat_sessions.items[sessionIndex].membersIdList.length; i++){
                                        if (host.database.chat_sessions.items[sessionIndex].membersIdList[i].userid == content.userLeave){
                                            host.database.chat_sessions.items[sessionIndex].membersIdList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    for (var i = 0; i < host.database.chat_sessions.items[sessionIndex].memberList.length; i++){
                                        if (host.database.chat_sessions.items[sessionIndex].memberList[i].id == content.userRemove){
                                            host.database.chat_sessions.items[sessionIndex].memberList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    if (content.newMess.userid == systemconfig.userid) content.newMess.type = "me";
                                    else content.newMess.type = "other";
                                    resolve({
                                        type: "addmessage",
                                        content: {
                                            sessionid: content.sessionid,
                                            dataDraw: [content.newMess]
                                        }
                                    });
                                }
                            }
                            break;
                        case "leave_group":
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            if (sessionIndex >= 0) {
                                if (content.userLeave == systemconfig.userid){
                                    host.database.chat_sessions.items.splice(sessionIndex, 1);
                                    for (var i = host.database.chat_session_members.items.length -1; i >= 0; i--){
                                        if (host.database.chat_session_members.items[i].sessionid == content.sessionid) host.database.chat_session_members.items.splice(i, 1);
                                    }
                                    resolve({
                                        type: "remove_group",
                                        content: content.sessionid
                                    });
                                }
                                else {
                                    for (var i = 0; i < host.database.chat_sessions.items[sessionIndex].membersIdList.length; i++){
                                        if (host.database.chat_sessions.items[sessionIndex].membersIdList[i].userid == content.userLeave){
                                            host.database.chat_sessions.items[sessionIndex].membersIdList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    for (var i = 0; i < host.database.chat_sessions.items[sessionIndex].memberList.length; i++){
                                        if (host.database.chat_sessions.items[sessionIndex].memberList[i].id == content.userLeave){
                                            host.database.chat_sessions.items[sessionIndex].memberList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    if (content.newMess.userid == systemconfig.userid) content.newMess.type = "me";
                                    else content.newMess.type = "other";
                                    resolve({
                                        type: "addmessage",
                                        content: {
                                            sessionid: content.sessionid,
                                            dataDraw: [content.newMess]
                                        }
                                    });
                                }
                            }
                            break;
                        case "dissolve_group":
                            if (!carddone.chats.checkIsMember(content.listMember)) return;
                            var sessionIndex = host.database.chat_sessions.getIndex(content.sessionid);
                            if (sessionIndex >= 0) {
                                host.database.chat_sessions.items.splice(sessionIndex, 1);
                                for (var i = host.database.chat_session_members.items.length -1; i >= 0; i--){
                                    if (host.database.chat_session_members.items[i].sessionid == content.sessionid) host.database.chat_session_members.items.splice(i, 1);
                                }
                                resolve({
                                    type: "remove_group",
                                    content: content.sessionid
                                });
                            }
                            break;
                        case "activechatbox":
                            resolve(content);
                            break;
                        case "reloadChat":
                            resolve(content);
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
            carddone.chats.generateDataChat(host, host.dataChatCard);
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
        console.log(host.dataChatCard);
        host.funcs.formChatsInit({
            holder: host.holder,
            cmdbutton: cmdbutton,
            data: host.database.chat_sessions.items,
            openChat: openChat,
            sessionActive: host.dataChatCard,
            usersList: usersList
        });
        if (carddone.isMobile){
            if (host.dataChatCard !== undefined){
                host.resolveMessage({
                    content: {
                        randomId: contentModule.generateRandom(),
                        type: "activechatbox",
                        dataSession: host.dataChatCard
                    }
                });
            }
        }
        rs();
    });
};

carddone.chats.loadChatByCardId = function(host, cardid){
    return new Promise(function(rs, rj){
        if (host.cardid > 0){
            dbcache.loadByCondition({
                name: "chat_sessions",
                cond: function(record){
                    return record.cardid == host.cardid;
                },
                callback: function(retval){
                    if (retval.length == 0){
                        FormClass.api_call({
                            url: "database_load.php",
                            params: [
                                {name: "task", value: "chats_loads_session_details_by_cardid"},
                                {name: "cardid", value: host.cardid},
                                {name: "localid", value: (new Date().getTime())}
                            ],
                            func: function(success, message){
                                if (success){
                                    if (message.substr(0, 2) == "ok"){
                                        var st = EncodingClass.string.toVariable(message.substr(2));
                                        host.dataChatCard = st.dataChatCard;
                                        rs(true);
                                        dbcache.refresh("chat_sessions");
                                        dbcache.refresh("chat_session_members");
                                        dbcache.refresh("archived_chats");
                                    }
                                    else {
                                        ModalElement.alert({message: message});
                                        rs(false);
                                    }
                                }
                                else {
                                    ModalElement.alert({message: message});
                                    rs(false);
                                }
                            }
                        });
                    }
                    else {
                        var sessionid = retval[0].id;
                        host.dataChatCard = EncodingClass.string.duplicate(retval[0]);
                        host.dataChatCard.content = EncodingClass.string.toVariable(host.dataChatCard.content);
                        dbcache.loadByCondition({
                            name: "chat_session_members",
                            cond: function(record){
                                return record.userid == systemconfig.userid && record.sessionid == sessionid;
                            },
                            callback: function(retval){
                                var t_func = function(){
                                    return new Promise(function(rs, rj){
                                        host.dataChatCard.archivedIdList = [];
                                        dbcache.loadByCondition({
                                            name: "archived_chats",
                                            cond: function(record){
                                                return record.sessionid == sessionid;
                                            },
                                            callback: function(retval){
                                                retval.sort(function(a, b){
                                                    return b.id - a.id;
                                                });
                                                for (var i = 0; i < retval.length; i++){
                                                    if (i == 0){
                                                        host.dataChatCard.content = EncodingClass.string.toVariable(retval[i].content.concat(host.dataChatCard.content));
                                                    }
                                                    else {
                                                        host.dataChatCard.archivedIdList.push(retval[i].id);
                                                    }
                                                }
                                                host.dataChatCard.membersIdList = [];
                                                dbcache.loadByCondition({
                                                    name: "chat_session_members",
                                                    cond: function(record){
                                                        return record.sessionid == sessionid;
                                                    },
                                                    callback: function(retval){
                                                        for (var i = 0; i < retval.length; i++){
                                                            host.dataChatCard.membersIdList.push(retval[i].userid);
                                                            if (retval[i].userid == systemconfig.userid){
                                                                host.dataChatCard.mess_seen_id = parseInt(retval[i].mess_seen_id), 10;
                                                            }
                                                        }
                                                        rs(true);
                                                    }
                                                })
                                            }
                                        })
                                    });
                                };
                                if (retval.length == 0){
                                    FormClass.api_call({
                                        url: "database_load.php",
                                        params: [
                                            {name: "task", value: "chat_add_member_to_group"},
                                            {name: "sessionid", value: sessionid},
                                            {name: "localid", value: (new Date()).getTime()}
                                        ],
                                        func: function(success, message){
                                            if (success){
                                                if (message.substr(0, 2) == "ok"){
                                                    var st = EncodingClass.string.toVariable(message.substr(2));
                                                    host.dataChatCard.content = st.contentChat;
                                                    host.dataChatCard.lasttime = new Date();
                                                    dbcache.refresh("chat_session_members");
                                                    dbcache.refresh("chat_sessions");
                                                    rs(t_func());
                                                }
                                                else {
                                                    ModalElement.alert({message: message});
                                                    rs(false);
                                                }
                                            }
                                            else {
                                                ModalElement.alert({message: message});
                                                rs(false);
                                            }
                                        }
                                    });
                                }
                                else {
                                    rs(t_func());
                                }
                            }
                        });
                    }
                }
            });
        }
        else {
            rs(true);
        }
    });
};

carddone.chats.loadChat_sessionsList = function(host, startIndex){
    return new Promise(function(rs, rj){
        var promiseList = {};
        promiseList.chat_session_members = data_module.loadByConditionAsync({
            name: "chat_session_members",
            cond: function(record){
                return record.userid == systemconfig.userid;
            },
            callback: function(retval){
                return retval;
            }
        });
        var chat_sessions = [];
        var sessionDic = {};
        var cardDic = {};
        promiseList.chat_sessions = promiseList.chat_session_members.then(function(value){
            return new Promise(function(resolve, reject){
                value.forEach(function(elt){
                    sessionDic[elt.sessionid] = true;
                });
                dbcache.loadByCondition({
                    name: "chat_sessions",
                    cond: function(record){
                        if (record.cardid > 0){
                            if (systemconfig.card_permission_list.indexOf(record.cardid) >= 0) return true;
                            else return false;
                        }
                        else {
                            if (sessionDic[record.id]) return true;
                            else return false;
                        }
                    },
                    callback: function(retval){
                        var a_func = function(){
                            var sessionDic = {};
                            for (var i = 0; i < chat_sessions.length; i++){
                                sessionDic[chat_sessions[i].id] = true;
                                if (chat_sessions[i].cardid > 0) cardDic[chat_sessions[i].cardid] = true;
                            }
                            resolve(sessionDic);
                        };
                        retval.sort(function(a, b){
                            return b.lasttime.getTime() - a.lasttime.getTime();
                        });
                        for (var i = 0; i < retval.length; i++){
                            if (i > 15) break;
                            chat_sessions.push(retval[i]);
                        }
                        var listSessionMemberAdd = [];
                        for (var i = 0; i < chat_sessions.length; i++){
                            if (sessionDic[chat_sessions[i].id] === undefined) listSessionMemberAdd.push(chat_sessions[i].id);
                        }
                        if (listSessionMemberAdd.length > 0){
                            FormClass.api_call({
                                url: "database_load.php",
                                params: [
                                    {name: "task", value: "chat_add_member_to_many_groups"},
                                    {name: "sessionidList", value: EncodingClass.string.fromVariable(listSessionMemberAdd)},
                                    {name: "localid", value: (new Date()).getTime()}
                                ],
                                func: function(success, message){
                                    if (success){
                                        if (message.substr(0, 2) == "ok"){
                                            var st = EncodingClass.string.toVariable(message.substr(2));
                                            dbcache.refresh("chat_session_members");
                                            dbcache.refresh("chat_sessions");
                                            sessionDic = {};
                                            for (var i = 0; i < chat_sessions.length; i++){
                                                sessionDic[chat_sessions[i].id] = i;
                                            }
                                            for (var i = 0; i < st.contentChat.length; i++){
                                                if (sessionDic[st.contentChat[i].id] !== undefined){
                                                    chat_sessions[sessionDic[st.contentChat[i].id]].content = st.contentChat[i].content;
                                                    chat_sessions[sessionDic[st.contentChat[i].id]].lasttime = new Date();
                                                }
                                            }
                                            a_func();
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
                        else {
                            a_func();
                        }
                    }
                });
            });
        });
        var chat_session_members, archived_chats, company_card, contact_card;
        promiseList.chat_sessions.then(function(sessionDic){
            promiseList.chat_session_members = data_module.loadByConditionAsync({
                name: "chat_session_members",
                cond: function(record){
                    return sessionDic[record.sessionid];
                },
                callback: function(retval){
                    chat_session_members = retval;
                }
            });
            promiseList.archived_chats = data_module.loadByConditionAsync({
                name: "archived_chats",
                cond: function(record){
                    return sessionDic[record.sessionid];
                },
                callback: function(retval){
                    archived_chats = retval;
                    archived_chats.sort(function(a, b){
                        return b.id - a.id;
                    });
                }
            });
            promiseList.company_card = data_module.loadByConditionAsync({
                name: "company_card",
                cond: function(record){
                    return cardDic[record.hostid];
                },
                callback: function(retval){
                    company_card = retval;
                }
            });
            promiseList.contact_card = data_module.loadByConditionAsync({
                name: "contact_card",
                cond: function(record){
                    return cardDic[record.hostid];
                },
                callback: function(retval){
                    contact_card = retval;
                }
            });
            Promise.all([promiseList.contact_card, promiseList.company_card, promiseList.chat_session_members, promiseList.archived_chats]).then(function(){
                rs({
                    chat_sessions: chat_sessions,
                    chat_session_members: chat_session_members,
                    archived_chats: archived_chats,
                    company_card: company_card,
                    contact_card: contact_card
                });
            });
        });
    });
};

carddone.chats.init2 = function(host){
    return new Promise(function(rs, rj){
        host.isOver = false;
        if (host.cardid === undefined) host.cardid = 0;
        host.listMessRandomAccept = [];
        ModalElement.show_loading();
        carddone.chats.loadChatByCardId(host, host.cardid).then(function(value){
            if (!value) return;
            carddone.chats.loadChat_sessionsList(host, 0).then(function(value){
                ModalElement.close(-1);
                var st = EncodingClass.string.duplicate(value);
                contentModule.makeDatabaseContent(host.database, st);
                contentModule.makeChat_session_membersIndex(host);
                contentModule.makeChat_sessionsContent(host);
                contentModule.makeAvatarUser(host);
                rs(carddone.chats.redraw(host));
            });
        });
    });
};

carddone.chats.init = function(host){
    return new Promise(function(rs, rj){
        if (!data_module.users){
            for (var i = 0; i < ModalElement.layerstatus.length; i++){
                if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
            }
            setTimeout(function(){
                rs(carddone.chats.init(host));
            }, 50);
            return;
        }
        else {
            absol.require('emojipicker').assetRoot = "https://keeview.com/emoji";
            absol.require('messageinput').iconAssetRoot  = "https://keeview.com/vivid_exticons";
            ModalElement.show_loading();
            var st = {
                companies: [],
                contact: [],
                owner_company_contact: [],
                nations: [],
                cities: [],
                districts: [],
                company_class: [],
                company_class_member: [],
                account_groups: [],
                privilege_groups: [],
                privilege_group_details: [],
                list_member: []
            };
            host.database = {};
            contentModule.makeDatabaseContent(host.database, st);
            host.database.nations.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "nations",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.nations.items = retval;
                        resolve();
                    }
                });
            });
            host.database.cities.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "cities",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.cities.items = retval;
                        resolve();
                    }
                });
            });
            host.database.districts.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "districts",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.districts.items = retval;
                        resolve();
                    }
                });
            });
            host.database.company_class.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "districts",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.company_class.items = retval;
                        resolve();
                    }
                });
            });
            host.database.companies.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "company",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.companies.items = retval;
                        resolve();
                    }
                });
            });
            host.database.contact.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "contact",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.contact.items = retval;
                        resolve();
                    }
                });
            });
            host.database.owner_company_contact.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "owner_company_contact",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.owner_company_contact.items = retval;
                        resolve();
                    }
                });
            });
            host.database.company_class_member.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "company_class_member",
                    cond: function (record) {
                        return record.userid == systemconfig.userid;
                    },
                    callback: function (retval) {
                        host.database.company_class_member.items = EncodingClass.string.duplicate(retval);
                        resolve();
                    }
                });
            });
            host.database.account_groups.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "account_groups",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.account_groups.items = EncodingClass.string.duplicate(retval);
                        resolve();
                    }
                });
            });
            host.database.privilege_groups.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "privilege_groups",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.privilege_groups.items = EncodingClass.string.duplicate(retval);
                        resolve();
                    }
                });
            });
            host.database.privilege_group_details.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "privilege_group_details",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        host.database.privilege_group_details.items = EncodingClass.string.duplicate(retval);
                        resolve();
                    }
                });
            });
            host.database.list_member.sync = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "list_member",
                    cond: function (record) {
                        return record.userid == systemconfig.userid;
                    },
                    callback: function (retval) {
                        host.database.list_member.items = EncodingClass.string.duplicate(retval);
                        resolve();
                    }
                });
            });
            var listAll;
            var listsPromise = new Promise(function(resolve, reject){
                dbcache.loadByCondition({
                    name: "lists",
                    cond: function (record) {
                        return true;
                    },
                    callback: function (retval) {
                        listAll = EncodingClass.string.duplicate(retval);
                        resolve();
                    }
                });
            });
            Promise.all([
                host.database.companies.sync,
                host.database.contact.sync,
                host.database.owner_company_contact.sync,
                host.database.nations.sync,
                host.database.cities.sync,
                host.database.districts.sync,
                host.database.company_class.sync,
                host.database.company_class_member.sync,
                host.database.privilege_groups.sync,
                host.database.privilege_group_details.sync,
                host.database.account_groups.sync,
                host.database.list_member.sync,
                listsPromise
            ]).then(function(){
                delete host.database.companies.sync;
                delete host.database.contact.sync;
                delete host.database.owner_company_contact.sync;
                delete host.database.nations.sync;
                delete host.database.cities.sync;
                delete host.database.districts.sync;
                delete host.database.company_class.sync;
                delete host.database.company_class_member.sync;
                delete host.database.privilege_groups.sync;
                delete host.database.privilege_group_details.sync;
                delete host.database.account_groups.sync;
                delete host.database.list_member.sync;
                contentModule.makeAccountGroupPrivilegeSystem(host);
                contentModule.makeCitiesIndexThanhYen(host);
                contentModule.makeDistrictsIndexThanhYen(host);
                contentModule.makeOwnerCompanyContactThanhYen(host);
                contentModule.makeCompanyIndexThanhYen(host);
                contentModule.makeContactIndexThanhYen(host);
                var boardPrivsDic = {};
                for (var i = 0; i < host.database.list_member.items.length; i++){
                    boardPrivsDic[host.database.list_member.items[i].listid] = host.database.list_member.items[i].type;
                }
                var listsDic1 = {};
                for (var i = 0; i < listAll.length; i++){
                    if (listAll[i].type != "list") continue;
                    if (boardPrivsDic[listAll[i].parentid] !== undefined) {
                        listsDic1[listAll[i].id] = boardPrivsDic[listAll[i].parentid];
                    }
                }
                var listsDic2 = {};
                for (var i = 0; i < listAll.length; i++){
                    if (listAll[i].type != "list") continue;
                    if (listsDic1[listAll[i].parentid] !== undefined) listsDic2[listAll[i].id] = listsDic1[listAll[i].parentid];
                }
                var cards = [];
                for (var i = 0; i < listAll.length; i++){
                    if (listAll[i].type != "card") continue;
                    if (listsDic2[listAll[i].parentid] !== undefined) {
                        listAll[i].permissionId = listsDic2[listAll[i].parentid];
                        cards.push(listAll[i]);
                    }
                }
                var account_groupsDic = {};
                for (var i = 0; i < host.database.account_groups.items.length; i++){
                    account_groupsDic[host.database.account_groups.items[i].id] = host.database.account_groups.items[i].privOfBoard;
                }
                systemconfig.card_permission_list = [];
                for (var i = 0; i < cards.length; i++){
                    if (cards[i].userid == systemconfig.userid || cards[i].owner == systemconfig.userid){
                        systemconfig.card_permission_list.push(cards[i].id);
                    }
                    else if (account_groupsDic[cards[i].permissionId] !== undefined) if (account_groupsDic[cards[i].permissionId][3]){
                        systemconfig.card_permission_list.push(cards[i].id);
                    }
                }
                rs(carddone.chats.init2(host));
            });
        }
    });
};
ModuleManagerClass.register({
    name: "Chats",
    prerequisites: ["ModalElement", "FormClass"]
});
