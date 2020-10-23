'use strict';

data_module.makeCache = function(){
    dbcache = DBCacheClass.open({
        accesskey: systemconfig.prefix,
        url: "dbcache_load.php"
    });
    dbcache.add("lists");
    dbcache.add("format");
    dbcache.add("typelists");
    dbcache.add("board_groups");
    dbcache.add("board_group_link");
    dbcache.add("list_member");
    dbcache.add("account_groups");
    dbcache.add("privilege_groups");
    dbcache.add("privilege_group_details");
    dbcache.add("company_class_member");
    dbcache.add("company_class");
    dbcache.add("field_list");
    dbcache.add("user_calendar");
    dbcache.add("nations");
    dbcache.add("cities");
    dbcache.add("districts");
    dbcache.add("company");
    dbcache.add("contact");
    dbcache.add("owner_company_contact");
    dbcache.add("dashboard");
    dbcache.add("company_card");
    dbcache.add("contact_card");
    dbcache.add("board_email_groups");
    dbcache.add("board_email_group_link");
    dbcache.add("card_email_groups");
    dbcache.add("knowledge");
    dbcache.add("attention_lists");
    dbcache.add("archived_lists");
    dbcache.add("objects");
    dbcache.add("obj_list");
    dbcache.add("chat_sessions");
    dbcache.add("chat_session_members");
    dbcache.add("archived_chats");
    dbcache.add("values");
    dbcache.add("report");
    dbcache.add("report_groups");
    dbcache.add("report_group_link");
    dbcache.add("field_company_class");
    dbcache.add("obj_company_contact");
    dbcache.add("knowledge_group_link");
    dbcache.add("knowledge_group");
};

data_module.parseValueId = function(str){
    var list = [];
    var startIndex = 0;
    while(startIndex < str.length){
        var index = str.indexOf("_", startIndex + 1);
        if (index == -1) break;
        var id = parseInt(str.substr(startIndex + 1, index - startIndex - 1), 10);
        list.push(id);
        startIndex = index;
    }
    return list;
};

data_module.makeDatabase = function(retval){
    var rs = {};
    rs.items = EncodingClass.string.duplicate(retval);
    rs.getIndex = function(id){
        for (var i = 0; i < rs.items.length; i++){
            if (rs.items[i].id == id) return i;
        }
        return -1;
    }
    return rs;
};

data_module.loadByConditionAsync = function(params){
    return new Promise(function(rs, rj){
        var oldCallback = params.callback;
        var newCallback = function(){
            var res;
            if (oldCallback) res = oldCallback.apply(this, arguments);
            rs(res);
        }
        params.callback = newCallback;
        dbcache.loadByCondition(params);
    })
};

data_module.loadByIdAsync = function(params){
    return new Promise(function(rs, rj){
        var oldCallback = params.callback;
        var newCallback = function(){
            var res;
            if (oldCallback) res = oldCallback.apply(this, arguments);
            rs(res);
        }
        params.callback = newCallback;
        dbcache.loadById(params);
    })
};

data_module.loadByIdArrayAsync = function(params){
    return new Promise(function(rs, rj){
        var oldCallback = params.callback;
        var newCallback = function(){
            var res;
            if (oldCallback) res = oldCallback.apply(this, arguments);
            rs(res);
        }
        params.callback = newCallback;
        dbcache.loadByIds(params);
    })
};
data_module.loadData = function(){
    var content = {dbname: ["users"]};
    var params = [
        {name: 'task', value: "data_module_load"},
        {name: 'dbnameList', value: EncodingClass.string.fromVariable(content.dbname)}
    ];
    FormClass.api_call({
        url: "database_load.php",
        params: params,
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var data = EncodingClass.string.toVariable(message.substr(2));
                    for (var idx = 0; idx < content.dbname.length; idx++){
                        data_module[content.dbname[idx]] = {
                            items: data[content.dbname[idx]],
                            getIndex: function(dbname){
                                return function(id){
                                    for (var i = 0; i < data_module[dbname].items.length; i++){
                                        if (data_module[dbname].items[i].id == id) return i;
                                    }
                                    return -1;
                                }
                            }(content.dbname[idx])
                        }
                        if (content.dbname[idx] == "users"){
                            data_module[content.dbname[idx]].getByhomeid = function(dbname){
                                return function(homeid){
                                    for (var i = 0; i < data_module[dbname].items.length; i++){
                                        if (data_module[dbname].items[i].homeid == homeid) return i;
                                    }
                                    return -1;
                                };
                            }(content.dbname[idx])
                            var holderForSort = data_module.users.items.map(function(item){
                                return {
                                    item: item,
                                    val: absol.string.nonAccentVietnamese(item.username.toLowerCase())
                                }
                            });
                            holderForSort.sort(function (a, b) {
                                var k;
                                if (a.item.privilege < b.item.privilege) return 1;
                                if (a.item.privilege > b.item.privilege) return -1;
                                if (b.val > a.val) return -1;
                                if (b.val < a.val) return 1;
                                return 0;
                            });
                            data_module.users.items = holderForSort.map(function(holder){
                                return holder.item;
                            });
                            contentModule.makeReportToUserThanhYen();
                        }
                    }
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    });
};
