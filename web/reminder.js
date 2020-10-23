
carddone.reminder.redraw = function(host){
    var dataReminder = contentModule.makeUser_calendarReminderThanhYen(host);
    if (dataReminder.listReminderLost.length == 0) {
        ModalElement.close(-1);
        return;
    }
    contentModule.reminderActivityLostThanhYen(host, dataReminder.listReminderLost).then(function(value){
        ModalElement.close(-1);
        DOMElement.removeAllChildren(host.data_container);
        host.data_container.appendChild(value);
    });
};

carddone.reminder.init = function(host){
    if (!data_module.users){
        for (var i = 0; i < ModalElement.layerstatus.length; i++){
            if ((ModalElement.layerstatus[i].index == -1) && (!ModalElement.layerstatus[i].visible)) ModalElement.show_loading();
        }
        setTimeout(function(){
            carddone.reminder.init(host);
        }, 50);
        return;
    }
    var time = new Date();
    var month = time.getMonth();
    var year = time.getFullYear();
    ModalElement.show_loading();
    var st = {
        nations: [],
        cities: [],
        districts: [],
        company_class: [],
        companies: [],
        contact: [],
        owner_company_contact: [],
        user_calendar: [],
        company_class_member: [],
        account_groups: [],
        privilege_groups: [],
        privilege_group_details: []
    }
    host.database = {};
    contentModule.makeDatabaseContent(host.database, st);
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
    host.database.company_class.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "company_class",
            cond: function (record) {
                return true;
            },
            callback: function (retval) {
                host.database.company_class.items = EncodingClass.string.duplicate(retval);
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
    host.database.user_calendar.sync = new Promise(function(resolve, reject){
        dbcache.loadByCondition({
            name: "user_calendar",
            cond: function (record) {
                if (record.userid != systemconfig.userid) return false;
                if (record.month == month && record.year == year) return true;
                if (month == 11){
                    if (record.month == 0 && record.year == year + 1) return true;
                }
                else {
                    if (record.month == month + 1 && record.year == year) return true;
                }
                return false;
            },
            callback: function (retval) {
                host.database.user_calendar.items = EncodingClass.string.duplicate(retval);
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
    Promise.all([
        host.database.nations.sync,
        host.database.cities.sync,
        host.database.districts.sync,
        host.database.companies.sync,
        host.database.company_class.sync,
        host.database.contact.sync,
        host.database.owner_company_contact.sync,
        host.database.company_class_member.sync,
        host.database.privilege_groups.sync,
        host.database.privilege_group_details.sync,
        host.database.account_groups.sync
    ]).then(function(){
        contentModule.makeAccountGroupPrivilegeSystem(host);
        contentModule.makeCitiesIndexThanhYen(host);
        contentModule.makeDistrictsIndexThanhYen(host);
        contentModule.makeOwnerCompanyContactThanhYen(host);
        contentModule.makeCompanyIndexThanhYen(host);
        contentModule.makeContactIndexThanhYen(host);
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
        host.data_container = DOMElement.div({});
        host.holder.addChild(host.frameList);
        var singlePage = host.funcs.formReminderInit({
            cmdbutton: cmdbutton,
            data_container: host.data_container
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        carddone.reminder.redraw(host);
    });
};
ModuleManagerClass.register({
    name: "Reminder",
    prerequisites: ["ModalElement", "FormClass"]
});
