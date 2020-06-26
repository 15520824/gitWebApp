
carddone.knowledge.openCard = function(host, cardid){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "knowledge_load_by_card"},
            {name: "id", value: cardid}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    carddone.menu.loadPage(11, content);
                }
                else if (message == "failed_cardid"){
                    ModalElement.alert({message: LanguageModule.text("war_txt_card_was_deleted")});
                }
                else if (message == "failed_priv"){
                    ModalElement.alert({message: LanguageModule.text("war_txt_no_privilege_card")});
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

carddone.knowledge.viewKnowledge = function(host, id){
    var index = host.database.knowledge.getIndex(id);
    var cardid = host.database.knowledge.items[index].cardid;
    var cmdbutton = {
        close: function () {
            host.frameList.removeLast();
        },
        openCard: function () {
            carddone.knowledge.openCard(host, cardid);
        }
    };
    var data = host.database.knowledge.items[index];
    var singlePage = host.funcs.formKnowledgeView({
        cmdbutton: cmdbutton,
        data: data
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.knowledge.getCellKnowledge = function(host, id){
    var index = host.database.knowledge.getIndex(id);
    var func = {
        view: function(){
            carddone.knowledge.viewKnowledge(host, id);
        }
    };
    var groupName = [];
    var ni;
    for (var i = 0; i < host.database.knowledge.items[index].groupIndexList.length; i++){
        ni = host.database.knowledge.items[index].groupIndexList[i];
        groupName.push(host.database.knowledge_groups.items[ni].name + "_" + host.database.knowledge_groups.items[ni].id);
    }
    return {
        name: host.database.knowledge.items[index].name,
        description: host.database.knowledge.items[index].description,
        tag: host.database.knowledge.items[index].tag,
        groupName: groupName,
        createdby: contentModule.getUsernameByhomeidFromDataModule(host, host.database.knowledge.items[index].userid),
        available: contentModule.availableName(host.database.knowledge.items[index].available),
        func: func
    };
};

carddone.knowledge.redraw = function(host){
    var data = [];
    for (var i = 0; i < host.database.knowledge.items.length; i++){
        data.push(carddone.knowledge.getCellKnowledge(host, host.database.knowledge.items[i].id));
    }
    DOMElement.removeAllChildren(host.data_container);
    host.dataView = host.funcs.formKnowledgeContentData({
        data: data,
        inputsearchbox: host.inputsearchbox,
        knowledge_group_select: host.knowledge_group_select
    });
    host.data_container.appendChild(host.dataView);
};

carddone.knowledge.drawData = function(host, content){
    if (!host.dataView){
        setTimeout(function(){
            carddone.knowledge.drawData(host, content);
        }, 50);
        return;
    }
    var celldata;
    for (var i = 0; i < content.knowledge.length; i++){
        celldata = carddone.knowledge.getCellKnowledge(host, content.knowledge[i].id);
        if (host.dataView.data.length > 50){
            host.dataView.data.push(host.funcs.formKnowledgeGetRow(celldata));
        }
        else {
            host.dataView.insertRow(host.funcs.formKnowledgeGetRow(celldata));
        }
    }
    host.dataView.updatePagination(undefined, false);
    carddone.knowledge.loadData(host);
};

carddone.knowledge.loadData = function(host){
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "knowledge_load_list2"},
            {name: "start", value: host.database.knowledge.items.length}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var content = EncodingClass.string.toVariable(message.substr(2));
                    if (content.knowledge.length == 0){
                        host.dataView.addInputSearch(host.inputsearchbox);
                        host.dataView.addFilter(host.knowledge_group_select, 3);
                        return;
                    }
                    contentModule.makeKnowledgeContentData(host, content);
                    host.database.knowledge.items = host.database.knowledge.items.concat(content.knowledge);
                    host.database.knowledge_group_link.items = host.database.knowledge_group_link.items.concat(content.knowledge_group_link);
                    carddone.knowledge.drawData(host, content);
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

carddone.knowledge.init = function(host){
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "knowledge_load_list"},
            {name: "start", value: 0}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    host.database = {};
                    var content = {
                        knowledge: EncodingClass.string.duplicate(st.knowledge),
                        knowledge_group_link: EncodingClass.string.duplicate(st.knowledge_group_link)
                    };
                    contentModule.makeDatabaseContent(host.database, st);
                    contentModule.makeKnowledgeGroupIndex(host);
                    contentModule.makeKnowledgeContentData(host, content);
                    contentModule.makeDatabaseContent(host.database, content);
                    carddone.knowledge.loadData(host);
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
                        close: function(host){
                            return function (event, me) {
                                if (carddone.isMobile){
                                    host.holder.selfRemove();
                                    carddone.menu.loadPage(100);
                                }
                                else {
                                    carddone.menu.tabPanel.removeTab(host.holder.id);
                                }
                            }
                        } (host),
                        add: function(host){
                            return function (event, me) {
                                carddone.knowledge.addKnowledge(host, 0);
                            }
                        } (host)
                    };
                    function getGroupItem(id){
                        var index = host.database.knowledge_groups.getIndex(id);
                        var items = [], ni;
                        for (var i = 0; i < host.database.knowledge_groups.items[index].childrenIndexList.length; i++){
                            ni = host.database.knowledge_groups.items[index].childrenIndexList[i];
                            items.push(getGroupItem(host.database.knowledge_groups.items[ni].id));
                        }
                        return {
                            value: host.database.knowledge_groups.items[index].name + "_" + id,
                            text: host.database.knowledge_groups.items[index].name,
                            items: items
                        };
                    };
                    var listGroup = [{value: 0, text: LanguageModule.text("txt_all")}];
                    for (var i = 0; i < host.database.knowledge_groups.items.length; i++){
                        if (host.database.knowledge_groups.items[i].parentid > 0) continue;
                        listGroup.push(getGroupItem(host.database.knowledge_groups.items[i].id));
                    }
                    host.knowledge_group_select = absol.buildDom({
                        tag: "selecttreemenu",
                        style: {
                            verticalAlign: "middle"
                        },
                        props: {
                            items: listGroup
                        }
                    });
                    host.data_container = DOMElement.div({
                        attrs: {
                            className: "cardsimpletableclass row2colors cardtablehover"
                        }
                    });
                    host.holder.addChild(host.frameList);
                    var singlePage = host.funcs.formKnowledgeInit({
                        cmdbutton: cmdbutton,
                        data_container: host.data_container,
                        inputsearchbox: host.inputsearchbox,
                        knowledge_group_select: host.knowledge_group_select
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.knowledge.redraw(host);
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
ModuleManagerClass.register({
    name: "Knowledge",
    prerequisites: ["ModalElement", "FormClass"]
});
