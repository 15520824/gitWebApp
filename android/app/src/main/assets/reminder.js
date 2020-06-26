
carddone.reminder.redraw = function(host){
    var dataReminder = contentModule.makeUser_calendarReminder();
    contentModule.reminderActivityLost(dataReminder.listReminderLost).then(function(value){
        ModalElement.close(-1);
        DOMElement.removeAllChildren(host.data_container);
        host.data_container.appendChild(value);
    });
};

carddone.reminder.init = function(host){
    if (!data_module.users || !data_module.companies || !data_module.contact){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.reminder.init(host);
        }, 50);
        return;
    }
    var condition = "";
    var time = new Date();
    var month = time.getMonth();
    var year = time.getFullYear();
    condition += "(month = " + month + " AND year = " + year + ") OR ";
    if (month == 11){
        condition += "(month = 0 AND year = " + (year + 1) + ")";
    }
    else {
        condition += "(month = " + (month + 1) + " AND year = " + year + ")";
    }
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "data_module_load_user_calendar"},
            {name: "condition", value: condition}
        ],
        func: function(success, message){
            if (success){
                if (message.substr(0, 2) == "ok"){
                    data_module.user_calendar = {};
                    data_module.user_calendar.items = EncodingClass.string.toVariable(message.substr(2));
                    data_module.user_calendar.getIndex = function(id){
                        for (var i = 0; i < data_module.user_calendar.items.length; i++){
                            if (data_module.user_calendar.items[i].id == id) return i;
                        }
                        return - 1;
                    };
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
                    host.data_container = DOMElement.div({attrs: {className: "cardsimpletableclass"}});
                    host.holder.addChild(host.frameList);
                    var singlePage = host.funcs.formReminderInit({
                        cmdbutton: cmdbutton,
                        data_container: host.data_container
                    });
                    host.frameList.addChild(singlePage);
                    singlePage.requestActive();
                    carddone.reminder.redraw(host);
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
    name: "Reminder",
    prerequisites: ["ModalElement", "FormClass"]
});
