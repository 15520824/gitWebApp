carddone.menu.index = 0;
carddone.menu.heightFooter = 30;
carddone.menu.distanceButtonForm = "10px";


if (carddone.isMobile){
    carddone.menu.tabPanel = absol.buildDom({
        tag: "frameview",
        class: ["main-tabview", 'am-application-frameview']
    });
    carddone.menu.staticFrameTaskIds = [4, 7, 101, 100];
    carddone.menu.staticFrameTaskIcons = ['span.mdi.mdi-file-table-outline', 'span.mdi.mdi-chat-outline', 'span.mdi.mdi-bell-outline', 'span.mdi.mdi-menu'];
    carddone.menu.mobileTabbar = absol.buildDom({
        tag: 'mbottomtabbar',
        class: 'am-application-tabbar',
        props: {
            items: carddone.menu.staticFrameTaskIcons.map(function (icon, i) {
                return {
                    icon: icon,
                    value: carddone.menu.staticFrameTaskIds[i]//,
                    // counter: app.tabActivities.counter
                }
            })
        },
        on: {
            change: function(){
                var value = this.value;
                carddone.menu.loadPage(value);
            }
        }
    });


    carddone.menu.showMobileTabbar = function (flag) {
        var appDiv = carddone.menu.layoutInit;
        var current = appDiv.containsClass('am-show-tabbar');
        if (current == flag) return;
        if (flag) {
            appDiv.addClass('am-show-tabbar');
        }
        else {
            appDiv.removeClass('am-show-tabbar');
        }
        absol.Dom.updateResizeSystem();
    };
}
else {
    carddone.menu.tabPanel = absol.buildDom({
        tag: "tabview",
        class: "main-tabview",
        on: {
            activetab: function(event, me){
                if (event.holder.tabFrame.boardid){
                    data_module.boardActive = event.holder.tabFrame.boardid;
                }
            }
        }
    });
}

carddone.menu.loadPagePC = function (taskid, hostid, hostid2) {
    var holder, host;
    holder = absol.buildDom({
        tag: "tabframe",
        style: {
            backgroundColor: "white"
        }
    });
    host = {
        holder: holder,
        frameList: absol.buildDom({
            tag: "frameview",
            class: "main-frame-view",
            style: {
                width: "100%",
                height: "100%"
            }
        })
    };
    switch (taskid) {
        case 1:
            host.direct = 0;
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                okButton: theme.okButton,
                formConfirmPassword: theme.formConfirmPassword,
                formPersonalProfile: theme.formPersonalProfile,
                input: theme.input
            };
            holder.name = LanguageModule.text("txt_personal_profile");
            carddone.menu.tabPanel.addChild(holder);
            carddone.menu.showProfile(host);
            break;
        case 2:
            host.direct = 1;
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                formConfirmPassword: theme.formConfirmPassword,
                formAccountInit: theme.formAccountInit,
                formAccountContentData: theme.formAccountContentData,
                formAccountGetRow: theme.formAccountGetRow,
                formAccountEdit: theme.formAccountEdit,
                input: theme.input
            }
            holder.name = LanguageModule.text("txt_user");
            carddone.menu.tabPanel.addChild(holder);
            carddone.account.init(host);
            break;
        case 3:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formDatatypesInit: theme.formDatatypesInit,
                formTypeContentData: theme.formTypeContentData,
                formDataTypesEdit: theme.formDataTypesEdit,
                formDataTypesDataStructure: theme.formDataTypesDataStructure,
                formDataTypesDataStructureGetRow: theme.formDataTypesDataStructureGetRow
            }
            holder.name = LanguageModule.text("txt_datatypes");
            carddone.menu.tabPanel.addChild(holder);
            carddone.datatypes.init(host);
            break;
        case 4:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                boardInitForm: theme.boardInitForm,
                boardContentDataForm: theme.boardContentDataForm,
                boardEditForm: theme.boardEditForm
            }
            holder.name = LanguageModule.text("txt_boards");
            carddone.menu.tabPanel.addChild(holder);
            carddone.boards.init(host);
            break;
        case 6:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                formObjectsInit: theme.formObjectsInit,
                formObjectsEdit: theme.formObjectsEdit,
                input: theme.input,
                formObjectsGetCategory: theme.formObjectsGetCategory,
                formObjectContentData: theme.formObjectContentData,
                formObjectGetRow: theme.formObjectGetRow
            }
            holder.name = LanguageModule.text("txt_object");
            carddone.menu.tabPanel.addChild(holder);
            carddone.objects.init(host);
            break;
        case 7:
            host.funcs = {
                closeButton:  theme.closeButton,
                formChatsInit: theme.formChatsInit,
                sendMessage: carddone.sendMessageFunc
            }
            host.cardid = hostid;
            holder.name = LanguageModule.text("txt_chat");
            carddone.menu.tabPanel.addChild(holder);
            carddone.chats.init(host).then(function(value){
                if (hostid2 !== undefined) host.resolveOpenChat(hostid2);
            });
            carddone.listTabChat.push(host);
            holder.on("remove", function(event){
                for (var i = 0; i < carddone.listTabChat.length; i++){
                    if (carddone.listTabChat[i].holder.id == this.id){
                        carddone.listTabChat.splice(i, 1);
                        break;
                    }
                }
            });
            break;
        case 8:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                saveAsButton: theme.saveAsButton,
                exportButton: theme.exportButton,
                viewReportButton: theme.viewReportButton,
                input: theme.input,
                formReportListLayout: theme.formReportListLayout,
                editReportForm: theme.editReportForm
            }
            holder.name = LanguageModule.text("txt_my_report");
            carddone.menu.tabPanel.addChild(holder);
            carddone.my_report.init(host);
            break;
        case 9:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formChatsInit: theme.formChatsInit
            }
            holder.name = LanguageModule.text("txt_public_report");
            carddone.menu.tabPanel.addChild(holder);
            console.log(987654321);
            // carddone.public_report.init(host);
            break;
        case 10:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formCategoryInit: theme.formCategoryInit,
                formCategoryContentData: theme.formCategoryContentData,
                formCategoryEdit: theme.formCategoryEdit,
                formCategoryGetRow: theme.formCategoryGetRow
            }
            holder.name = LanguageModule.text("txt_category");
            carddone.menu.tabPanel.addChild(holder);
            carddone.category.init(host);
            break;
        case 11:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                moveButton: theme.moveButton,
                archiveButton: theme.archiveButton,
                deleteButton: theme.deleteButton,
                input: theme.input,
                cardInitForm: theme.cardInitForm,
                cardEditForm: theme.cardEditForm,
                cardAddTaskForm: theme.cardAddTaskForm,
                cardAddMeetingForm: theme.cardAddMeetingForm,
                cardAddNoteForm: theme.cardAddNoteForm,
                cardAddCallForm: theme.cardAddCallForm,
                cardAddWaitForm: theme.cardAddWaitForm,
                cardAddCheckListForm: theme.cardAddCheckListForm,
                cardAddFieldForm: theme.cardAddFieldForm,
                cardAddFileForm: theme.cardAddFileForm,
                formKnowledgeEdit: theme.formKnowledgeEdit,
                moveCard: theme.moveCard
            }
            holder.name = LanguageModule.text("txt_cards");
            carddone.menu.tabPanel.addChild(holder);
            carddone.cards.init(host, hostid.boardid).then(function(){
                if (hostid.cardid) {
                    var editActivity = function(){
                        if (!hostid.objid) return;
                        switch (hostid.type) {
                            case 'task':
                                if (hostid.permission == 'view') return;
                                carddone.cards.addTaskForm(host, hostid.cardid, hostid.objid);
                                break;
                            case 'meeting':
                                if (hostid.permission == 'view') return;
                                carddone.cards.addMeetingForm(host, hostid.cardid, hostid.objid);
                                break;
                            case 'call':
                                if (hostid.permission == 'view') return;
                                carddone.cards.addCallForm(host, hostid.cardid, hostid.objid);
                                break;
                            case 'checklist':
                                if (hostid.permission == 'view') return;
                                carddone.cards.addCheckListForm(host, hostid.cardid, hostid.objid);
                                break;
                            default:
                        }
                    }
                    if (data_module.cardList[hostid.cardid].content){
                        carddone.cards.prevEditCard(host, hostid.listid, hostid.cardid).then(editActivity);
                    }
                    else {
                        data_module.pendingData[data_module.cardList[hostid.cardid].heapIndex].onLoad.push(function(){
                            carddone.cards.prevEditCard(host, hostid.listid, hostid.cardid).then(editActivity);
                        });
                        data_module.dataManager[-100] = {
                            startIndex: data_module.cardList[hostid.cardid].heapIndex,
                            endIndex: data_module.cardList[hostid.cardid].heapIndex + 1
                        };
                        data_module.boardArray.push(-100);
                        data_module.boardActive = -100;
                    }
                }
            });
            break;
        case 12:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input
            }
            holder.name = LanguageModule.text("txt_activities");
            carddone.menu.tabPanel.addChild(holder);
            carddone.activities.init(host);
            break;
        case 13:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formNationsInit: theme.formNationsInit,
                formNationsContentData: theme.formNationsContentData,
                formNationEdit: theme.formNationEdit,
                formNationGetRow: theme.formNationGetRow
            }
            holder.name = LanguageModule.text("txt_nations");
            carddone.menu.tabPanel.addChild(holder);
            carddone.nations.init(host);
            break;
        case 14:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formCitiesInit: theme.formCitiesInit,
                formCitiesContentData: theme.formCitiesContentData,
                formCitiesEdit: theme.formCitiesEdit,
                formCitiesGetRow: theme.formCitiesGetRow
            }
            holder.name = LanguageModule.text("txt_city");
            carddone.menu.tabPanel.addChild(holder);
            carddone.cities.init(host);
            break;
        case 15:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formCompanyInit: theme.formCompanyInit,
                formCompanyContentData: theme.formCompanyContentData,
                formCompanyEdit: theme.formCompanyEdit,
                formContactEdit: theme.formContactEdit,
                formCompanyGetRow: theme.formCompanyGetRow,
                formContactGetRow: theme.formContactGetRow,
                formContactContentData: theme.formContactContentData
            }
            holder.name = LanguageModule.text("txt_company");
            carddone.menu.tabPanel.addChild(holder);
            carddone.company.init(host);
            break;
        case 16:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formContactInit: theme.formContactInit,
                formContactContentData: theme.formContactContentData,
                formContactEdit: theme.formContactEdit,
                formContactGetRow: theme.formContactGetRow
            }
            holder.name = LanguageModule.text("txt_contact");
            carddone.menu.tabPanel.addChild(holder);
            carddone.contact.init(host);
            break;
        case 17:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formCompany_classInit: theme.formCompany_classInit,
                formCompany_classContentData: theme.formCompany_classContentData,
                formCompany_classEdit: theme.formCompany_classEdit,
                formCompany_classGetRow: theme.formCompany_classGetRow
            }
            holder.name = LanguageModule.text("txt_company_class");
            carddone.menu.tabPanel.addChild(holder);
            carddone.company_class.init(host);
            break;
        case 18:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                masterBoardInitForm: theme.masterBoardInitForm,
                masterBoardEditForm: theme.masterBoardEditForm
            }
            holder.name = LanguageModule.text("txt_master_board");
            carddone.menu.tabPanel.addChild(holder);
            carddone.master_board.init(host, hostid);
            break;
        case 19:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                accountGroupInitForm: theme.accountGroupInitForm,
                accountGroupEditForm: theme.accountGroupEditForm
            }
            holder.name = LanguageModule.text("txt_account_group");
            carddone.menu.tabPanel.addChild(holder);
            carddone.account_group.init(host);
            break;
        case 20:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formKnowledgeGroupsInit: theme.formKnowledgeGroupsInit,
                formKnowledgeGroupsContentData: theme.formKnowledgeGroupsContentData,
                formKnowledgeGroupsEdit: theme.formKnowledgeGroupsEdit,
                formKnowledgeGroupsGetRow: theme.formKnowledgeGroupsGetRow
            };
            holder.name = LanguageModule.text("txt_knowledge_group");
            carddone.menu.tabPanel.addChild(holder);
            carddone.knowledge_groups.init(host);
            break;
        case 21:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formKnowledgeInit: theme.formKnowledgeInit,
                formKnowledgeContentData: theme.formKnowledgeContentData,
                formKnowledgeGetRow: theme.formKnowledgeGetRow,
                formKnowledgeView: theme.formKnowledgeView
            };
            holder.name = LanguageModule.text("txt_knowledge");
            carddone.menu.tabPanel.addChild(holder);
            carddone.knowledge.init(host);
            break;
        case 22:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formDistrictsInit: theme.formDistrictsInit,
                formDistrictsContentData: theme.formDistrictsContentData,
                formDistrictsEdit: theme.formDistrictsEdit,
                formDistrictsGetRow: theme.formDistrictsGetRow
            };
            holder.name = LanguageModule.text("txt_district");
            carddone.menu.tabPanel.addChild(holder);
            carddone.districts.init(host);
            break;
        case 23:
            host.funcs = {
                formMy_calendarInit: theme.formMy_calendarInit
            };
            holder.name = LanguageModule.text("txt_calendar");
            carddone.menu.tabPanel.addChild(holder);
            carddone.my_calendar.init(host);
            break;
        case 24:
            host.funcs = {
                formActivitiesInit: theme.formActivitiesInit,
                formActivitiesContentData: theme.formActivitiesContentData
            };
            holder.name = LanguageModule.text("txt_activity");
            carddone.menu.tabPanel.addChild(holder);
            carddone.activities.init(host);
            break;
        case 25:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formBoardGroupsInit: theme.formBoardGroupsInit,
                formBoardGroupsContentData: theme.formBoardGroupsContentData,
                formBoardGroupsEdit: theme.formBoardGroupsEdit,
                formBoardGroupsGetRow: theme.formBoardGroupsGetRow
            }
            holder.name = LanguageModule.text("txt_board_groups");
            carddone.menu.tabPanel.addChild(holder);
            carddone.board_groups.init(host);
            break;
        case 26:
            host.funcs = {
                closeButton:  theme.closeButton,
                saveButton: theme.saveButton,
                saveCloseButton: theme.saveCloseButton,
                addButton: theme.addButton,
                okButton: theme.okButton,
                input: theme.input,
                formReportGroupsInit: theme.formReportGroupsInit,
                formReportGroupsContentData: theme.formReportGroupsContentData,
                formReportGroupsEdit: theme.formReportGroupsEdit,
                formReportGroupsGetRow: theme.formReportGroupsGetRow
            }
            holder.name = LanguageModule.text("txt_report_groups");
            carddone.menu.tabPanel.addChild(holder);
            carddone.report_groups.init(host);
            break;
        case 27:
            host.funcs = {
                formReminderInit: theme.formReminderInit
            }
            holder.name = LanguageModule.text("txt_reminder");
            carddone.menu.tabPanel.addChild(holder);
            carddone.reminder.init(host);
            break;
        default:
            holder.innerHTML = "under construction (" + taskid + ")";
            break;
    }
};


carddone.menu.staticFrameTasks = {};

carddone.menu.showMenu = function(host){
    var profile = absol.buildDom({
        tag: 'mtinyprofileblock',
        props:{
            avatarSrc: systemconfig.user_avatars,
            name: systemconfig.username,
            desc: systemconfig.fullname
        },
        on:{
            click: function(){
                //todo: view profile
            }
        }
    });
    profile.$avatar.id = "user_avatar_img";
    host.holder.addChild(profile);
    host.holder.addChild(absol.buildDom({
        style:{
            height: 'calc(100% - 5.42857142857em)',
            overflowY: 'auto'
        },
        child: [carddone.menu.menuHeader]
    }));
};

carddone.menu.showNotification = function(host){

};

carddone.menu.loadPageMobile = function (taskid, hostid) {
    return new Promise(function(resolveMes, rejectMes){
        var holder;
        if (carddone.menu.staticFrameTaskIds.indexOf(taskid) >= 0 && carddone.menu.staticFrameTasks[taskid]){
            holder = carddone.menu.staticFrameTasks[taskid].holder;
            holder.requestActive();
            carddone.menu.mobileTabbar.value = taskid;
            carddone.menu.showMobileTabbar(true);
            resolveMes();
            return ;
        }
        holder = absol.buildDom({
            tag: "tabframe",
            style: {
                backgroundColor: "white"
            }
        });
        var frameList =  absol.buildDom({
            tag: "frameview",
            class: "main-frame-view",
            style: {
                width: "100%",
                height: "100%"
            }
        });
        var host = {
            holder: holder,
            frameList: frameList
        };
        carddone.menu.staticFrameTasks[taskid] = host;
        carddone.menu.tabPanel.addChild(holder);
        holder.requestActive();
        switch (taskid) {
            case 100:
                host.funcs = {
                    menuHeader: theme.menuHeader
                };
                carddone.menu.showMenu(host);
                break;
            case 101:
                host.funcs = {};
                carddone.menu.showNotification(host);
                break;
            case 1:
                host.direct = 0;
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    okButton: theme.okButton,
                    formConfirmPassword: theme.formConfirmPassword,
                    formPersonalProfile: theme.formPersonalProfile,
                    input: theme.input
                };
                carddone.menu.showProfile(host);
                break;
            case 2:
                host.direct = 1;
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    formConfirmPassword: theme.formConfirmPassword,
                    formAccountInit: theme.formAccountInit,
                    formAccountContentData: theme.formAccountContentData,
                    formAccountEdit: theme.formAccountEdit,
                    input: theme.input
                }
                carddone.account.init(host);
                break;
            case 3:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formDatatypesInit: theme.formDatatypesInit,
                    formTypeContentData: theme.formTypeContentData,
                    formDataTypesEdit: theme.formDataTypesEdit,
                    formDataTypesDataStructure: theme.formDataTypesDataStructure,
                    formDataTypesDataStructureGetRow: theme.formDataTypesDataStructureGetRow
                }
                carddone.datatypes.init(host);
                break;
            case 4:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    boardInitForm: theme.boardInitForm,
                    boardContentDataForm: theme.boardContentDataForm,
                    boardEditForm: theme.boardEditForm
                }
                carddone.boards.init(host);
                break;
            case 6:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    formObjectsInit: theme.formObjectsInit,
                    formObjectsEdit: theme.formObjectsEdit,
                    input: theme.input,
                    formObjectsGetCategory: theme.formObjectsGetCategory,
                    formObjectContentData: theme.formObjectContentData,
                    formObjectGetRow: theme.formObjectGetRow
                }
                carddone.objects.init(host);
                break;
            case 7:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    formChatsInit: theme.formChatsInit,
                    sendMessage: carddone.sendMessageFunc
                }
                host.cardid = hostid;
                carddone.listTabChat.push(host);
                carddone.chats.init(host).then(function(value){
                    resolveMes();
                });
                break;
            case 8:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    saveAsButton: theme.saveAsButton,
                    exportButton: theme.exportButton,
                    viewReportButton: theme.viewReportButton,
                    input: theme.input,
                    formReportListLayout: theme.formReportListLayout,
                    editReportForm: theme.editReportForm
                }
                carddone.my_report.init(host);
                break;
            case 9:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formChatsInit: theme.formChatsInit
                }
                console.log(987654321);
                // carddone.public_report.init(host);
                break;
            case 10:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formCategoryInit: theme.formCategoryInit,
                    formCategoryContentData: theme.formCategoryContentData,
                    formCategoryEdit: theme.formCategoryEdit,
                    formCategoryGetRow: theme.formCategoryGetRow
                }
                carddone.category.init(host);
                break;
            case 11:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    moveButton: theme.moveButton,
                    archiveButton: theme.archiveButton,
                    deleteButton: theme.deleteButton,
                    input: theme.input,
                    cardInitForm: theme.cardInitForm,
                    cardEditForm: theme.cardEditForm,
                    cardAddTaskForm: theme.cardAddTaskForm,
                    cardAddMeetingForm: theme.cardAddMeetingForm,
                    cardAddNoteForm: theme.cardAddNoteForm,
                    cardAddCallForm: theme.cardAddCallForm,
                    cardAddWaitForm: theme.cardAddWaitForm,
                    cardAddCheckListForm: theme.cardAddCheckListForm,
                    cardAddFieldForm: theme.cardAddFieldForm,
                    formKnowledgeEdit: theme.formKnowledgeEdit
                }
                carddone.cards.init(host, hostid.boardid);
                break;
            case 13:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formNationsInit: theme.formNationsInit,
                    formNationsContentData: theme.formNationsContentData,
                    formNationEdit: theme.formNationEdit,
                    formNationGetRow: theme.formNationGetRow
                }
                carddone.nations.init(host);
                break;
            case 14:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formCitiesInit: theme.formCitiesInit,
                    formCitiesContentData: theme.formCitiesContentData,
                    formCitiesEdit: theme.formCitiesEdit,
                    formCitiesGetRow: theme.formCitiesGetRow
                }
                carddone.cities.init(host);
                break;
            case 15:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formCompanyInit: theme.formCompanyInit,
                    formCompanyContentData: theme.formCompanyContentData,
                    formCompanyEdit: theme.formCompanyEdit,
                    formContactEdit: theme.formContactEdit,
                    formCompanyGetRow: theme.formCompanyGetRow,
                    formContactGetRow: theme.formContactGetRow,
                    formContactContentData: theme.formContactContentData
                }
                carddone.company.init(host);
                break;
            case 16:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formContactInit: theme.formContactInit,
                    formContactContentData: theme.formContactContentData,
                    formContactEdit: theme.formContactEdit,
                    formContactGetRow: theme.formContactGetRow
                }
                carddone.contact.init(host);
                break;
            case 17:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formCompany_classInit: theme.formCompany_classInit,
                    formCompany_classContentData: theme.formCompany_classContentData,
                    formCompany_classEdit: theme.formCompany_classEdit,
                    formCompany_classGetRow: theme.formCompany_classGetRow
                }
                carddone.company_class.init(host);
                break;
            case 18:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    masterBoardInitForm: theme.masterBoardInitForm,
                    masterBoardEditForm: theme.masterBoardEditForm
                }
                carddone.master_board.init(host, hostid);
                break;
            case 19:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    accountGroupInitForm: theme.accountGroupInitForm,
                    accountGroupEditForm: theme.accountGroupEditForm
                }
                carddone.account_group.init(host);
                break;
            case 20:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formKnowledgeGroupsInit: theme.formKnowledgeGroupsInit,
                    formKnowledgeGroupsContentData: theme.formKnowledgeGroupsContentData,
                    formKnowledgeGroupsEdit: theme.formKnowledgeGroupsEdit,
                    formKnowledgeGroupsGetRow: theme.formKnowledgeGroupsGetRow
                };
                carddone.knowledge_groups.init(host);
                break;
            case 21:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formKnowledgeInit: theme.formKnowledgeInit,
                    formKnowledgeContentData: theme.formKnowledgeContentData,
                    formKnowledgeGetRow: theme.formKnowledgeGetRow,
                    formKnowledgeView: theme.formKnowledgeView
                };
                carddone.knowledge.init(host);
                break;
            case 22:
                host.funcs = {
                    closeButton:  theme.closeButton,
                    saveButton: theme.saveButton,
                    saveCloseButton: theme.saveCloseButton,
                    addButton: theme.addButton,
                    okButton: theme.okButton,
                    input: theme.input,
                    formDistrictsInit: theme.formDistrictsInit,
                    formDistrictsContentData: theme.formDistrictsContentData,
                    formDistrictsEdit: theme.formDistrictsEdit,
                    formDistrictsGetRow: theme.formDistrictsGetRow
                }
                carddone.districts.init(host);
                break;
            case 23:
                host.funcs = {
                    formMy_calendarInit: theme.formMy_calendarInit
                }
                carddone.my_calendar.init(host);
                break;
            case 24:
                host.funcs = {
                    formActivitiesInit: theme.formActivitiesInit,
                    formActivitiesContentData: theme.formActivitiesContentData
                }
                carddone.activities.init(host);
                break;
            case 25:
                host.funcs = {
                    formBoardGroupsInit: theme.formBoardGroupsInit,
                    formBoardGroupsContentData: theme.formBoardGroupsContentData,
                    formBoardGroupsEdit: theme.formBoardGroupsEdit,
                    formBoardGroupsGetRow: theme.formBoardGroupsGetRow
                }
                carddone.board_groups.init(host);
                break;
            case 27:
                host.funcs = {
                    formReminderInit: theme.formReminderInit
                }
                carddone.reminder.init(host);
                break;
            default:
                holder.innerHTML = "under construction (" + taskid + ")";
                break;
        }

        if (carddone.menu.staticFrameTaskIds.indexOf(taskid)>=0){
            carddone.menu.mobileTabbar.value = taskid;
            carddone.menu.showMobileTabbar(true);
        }
        else {
            carddone.menu.showMobileTabbar(false);
        }
    });
};

carddone.menu.nonAccentVietnamese = function (s) {
    return s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "")
    .replace(/\u02C6|\u0306|\u031B/g, "");
};

absol.coreDom.install("singlepagenfooter", function SinglePageNFooter(){
    var res = absol._({
        tag:'singlepage'
        // ,
        // child:[
        //     carddone.menu.footer()
        // ]
    }, true);
    return res;
});

carddone.menu.footer = function(){
    return DOMElement.div({
        attrs: {
            className: "absol-single-page-footer",
            style: {
                backgroundColor: "#f7f6f6",
                height: "30px"
            }
        },
        children: [DOMElement.table({
            attrs: {style: {height: carddone.menu.heightFooter + "px",width: "100%"}},
            data: [[
                {attrs: {style: {width: "20px"}}},
                {
                    children: [DOMElement.table({
                        attrs: {style: {width: "100%"}},
                        data: [
                            [{text:"Copyright © 2018, SoftAView Company, All rights reserved"}]
                        ]
                    })]
                },
                {attrs: {style: {width: "10px"}}},
                {
                    attrs: {align: "right",style: {width: "150px"}},
                    children: [DOMElement.table({
                        data: [[
                            {
                                attrs: {style: {whiteSpace: "nowrap"}},
                                children: [DOMElement.a({
                                    attrs:{
                                        style:{
                                            cursor: "pointer"
                                        }
                                    },
                                    text: LanguageModule.text("txt_about")
                                })]
                            },
                            {
                                attrs: {style: {whiteSpace: "nowrap",paddingLeft: "10px"}},
                                children: [DOMElement.a({
                                    attrs:{
                                        style:{
                                            cursor: "pointer"
                                        }
                                    },
                                    text: LanguageModule.text("txt_contact")
                                })]
                            },
                            {
                                attrs: {style: {whiteSpace: "nowrap",paddingLeft: "10px"}},
                                children: [DOMElement.a({
                                    attrs:{
                                        style:{
                                            cursor: "pointer"
                                        }
                                    },
                                    text: LanguageModule.text("txt_service_account")
                                })]
                            }
                        ]]
                    })]
                },
                {attrs: {style: {width: "20px"}}}
            ]]
        })]
    });
};

carddone.menu.confirmPassword = function(host){
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
                    carddone.menu.showProfile(host);
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

carddone.menu.showProfile = function (host) {
    ModalElement.show_loading();
    FormClass.api_call({
        url: "database_load.php",
        params: [
            {name: "task", value: "menu_user_profile"},
            {name: "id", value: systemconfig.userid}
        ],
        func: function(success, message){
            ModalElement.close(-1);
            if (success){
                if (message.substr(0, 2) == "ok"){
                    host.dataUser = EncodingClass.string.toVariable(message.substr(2));
                    DOMElement.removeAllChildren(host.holder);
                    var cmdbutton = {
                        close: function () {
                            if (carddone.isMobile){
                                host.holder.selfRemove();
                                carddone.menu.loadPage(100);
                            }
                            else {
                                carddone.menu.tabPanel.removeTab(host.holder.id);
                            }
                        },
                        save: function(){
                            carddone.menu.userprofile_update_submit(host, 0);
                        },
                        save_close: function(){
                            carddone.menu.userprofile_update_submit(host, 1);
                        }
                    };
                    host.personal_profileEdit = host.funcs.formPersonalProfile({
                        cmdbutton: cmdbutton,
                        data: {
                            user_avatars: systemconfig.user_avatars,
                            username: host.dataUser.username,
                            fullname: host.dataUser.fullname,
                            email: host.dataUser.email,
                            language: LanguageModule.defaultcode,
                            languageList: contentModule.generateLanguageList(),
                            comment: host.dataUser.comment
                        },
                    });
                    host.holder.addChild(host.personal_profileEdit);
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

carddone.menu.userprofile_update_submit = function (host, typesubmit) {
    var params = [], homeid = systemconfig.userid;
    var data = host.personal_profileEdit.getValue();
    if (data.newpassword !== undefined){
        params.push({name: "oldpassword",value: data.oldpassword});
        params.push({name: "newpassword",value: data.newpassword});
    }
    if (data.user_avatars !== undefined) params.push({name: "avatar",value: data.user_avatars});
    params.push({name: "fullname",value: data.fullname});
    params.push({name: "email",value: data.email});
    params.push({name: "comment", value: data.comment});
    params.push({name: "language",value: data.language});
    ModalElement.show_loading();
    FormClass.api_call({
        url: "user_update2.php",
        params: params,
        func: function(success, message) {
            ModalElement.close(-1);
            if (success) {
                if (message.substr(0, 2) == "ok") {
                    if (data.user_avatars !== undefined){
                        systemconfig.user_avatars = data.user_avatars;
                        document.getElementById("user_avatar_img").style.backgroundImage = "url(" + data.user_avatars + ")";
                    }
                    if (data.language != LanguageModule.defaultcode) {
                        location.reload(true);
                        return;
                    }
                    if (typesubmit == 1){
                        carddone.menu.tabPanel.removeTab(host.holder.id);
                    }
                }
                else if (message == "war_txt_failed_email" || message == "war_txt_failed_password"){
                    ModalElement.alert({
                        message: LanguageModule.text(message)
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
};

carddone.menu.logout = function(){
    if (window.isApp){
        ModalElement.show_loading();
        FormClass.api_call({
            url: "logout_app.php",
            params: [
                {name: "storage", value: window.userToken},
                {name: "cookie", value: getCookie("carddone_user")}
            ],
            func: function(success, message) {
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0,2) == "ok"){
                        window.ReactNativeWebView.postMessage(JSON.stringify({name: "reload"}));
                        function GetToken(message){
                            window.removeEventListener("message",GetToken);
                        };
                        window.addEventListener("message", GetToken);
                    }
                    else {
                        ModalElement.alert({
                            message: message,
                            class: "button-black-gray"
                        });
                    }
                }
                else {
                    ModalElement.alert({
                        message: message,
                        class: "button-black-gray"
                    });
                }
            }
        });
    }
    else {
        ModalElement.show_loading();
        FormClass.api_call({
            url: "logout.php",
            params: [],
            func: function(success, message) {
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0,2) == "ok"){
                        window.location.href = window.location.href;
                    }
                    else {
                        ModalElement.alert({
                            message: message,
                            class: "button-black-gray"
                        });
                    }
                }
                else {
                    ModalElement.alert({
                        message: message,
                        class: "button-black-gray"
                    });
                }
            }
        });
    }

}

carddone.menu.showMenuTab = function(){
    var box = document.getElementById("box_menutab");
    if (box.style.visibility == "hidden"){
        box.style.visibility = "visible";
        setTimeout(function () {
           absol.$('body').once('click', function(){
               box.style.visibility = "hidden";
           }, false);
        }, 100);
    }
    else {
        box.style.visibility = "hidden";
    }
};

carddone.menu.toggleSupportOnline = function(holder, iBridge){
    var box = document.getElementById("box_support");
    if (box.style.visibility == "hidden"){
        box.style.visibility = "visible";
        iBridge.invoke('focus');
        iBridge.invoke('maximize');
    }
    else {
        box.style.visibility = "hidden";
        iBridge.invoke('minimize');
    }
};

carddone.menu.removeNotificationQueue = function(content){
    if (!systemconfig.userHasApp) return;
    var data = {
        sessionid: content.sessionid,
        localid: content.dataDraw[content.dataDraw.length - 1].localid
    };
    FormClass.api_call({
        url: "chat_remove_notitication_queue.php",
        params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
        func: function(success, message){
            if (success){
                if (message.substr(0,2) == "ok"){
                    console.log("success removeNotificationQueue: ", content);
                }
                else {
                    console.log("Failed removeNotificationQueue: " + message);
                }
            }
            else {
                console.log("Failed removeNotificationQueue: " + message);
            }
        }
    });
};

carddone.menu.openChatMobile = function(sessionid){
    console.log("wait");
    if (carddone.listTabChat.length == 0 || !carddone.listTabChat.status){
        setTimeout(function(){
            carddone.menu.openChatMobile(sessionid);
        }, 100);
        return;
    }
    console.log(777777777777);
    carddone.listTabChat[0].resolveOpenChat(sessionid);
};

carddone.menu.init = function(holder){
    if (carddone.isMobile){
        carddone.menu.loadPage = carddone.menu.loadPageMobile;
    }
    else {
        carddone.menu.loadPage = carddone.menu.loadPagePC;
    }
    var triggerFunc = function(){
        var h,h1;
        var companyConfig = database.company;
        var homehref;
        homehref = window.location.origin + "/";
        var homepath = window.location.pathname.substr(1);
        var x0 = homepath.indexOf("/");
        homehref += homepath.substr(0,x0 + 1);
        var serviceActiveList = [];
        for (var i = 0; i < database.register.items.length; i++){
            var serviceId = database.register.items[i].serviceid;
            var serviceIndex = database.services.getIndex(serviceId);
            var tempDate = new Date();
            if ((database.services.items[serviceIndex].target == "") && (database.services.items[serviceIndex].prefix == "")) continue;
            database.services.items[serviceIndex].avai = 1;
            serviceActiveList.push({
                link: homehref + database.services.items[serviceIndex].subDNS,
                logo: database.services.items[serviceIndex].srcimg,
                name: LanguageModule.text(database.services.items[serviceIndex].name)
            });
        }
        var serviceInactiveList = [];
        for (i = 0; i < database.services.items.length; i++){
            if ((database.services.items[i].name == "carddone_library") && (database.services.items[i].prefix == "")) continue;
            if ((database.services.items[i].target == "") && (database.services.items[i].prefix == "")) continue;
            if (database.services.items[i].avai != 1){
                serviceInactiveList.push({
                    logo: database.services.items[i].srcimg,
                    name: LanguageModule.text(database.services.items[i].name)
                });
            }
        }
        var support_online_iframe = document.createElement("iframe");
        support_online_iframe.style.border = "none";
        var iBridge = IFrameBridge.fromIFrame(support_online_iframe);
        var userid = systemconfig.userid;
        var companyid = systemconfig.companyid;
        var serviceid = systemconfig.serviceid;
        support_online_iframe.src = "https://" + window.location.host + "/online_support/ui_customer_chatbox.php?userid="+ userid +"&&companyid=" +companyid+ "&&serviceid=" + serviceid;
        support_online_iframe.style.width = "100%";
        support_online_iframe.style.height = "100%";
        support_online_iframe.style.border = "none";
        iBridge.on('minimize', function(){
            var box = document.getElementById("box_support");
            if (box) box.style.visibility = "hidden";
        });
        iBridge.on('seen', function(){
            var box = document.getElementById("number_message_no_seen");
            DOMElement.removeAllChildren(box);
        });
        iBridge.on('newmess', function(number){
            var box = document.getElementById("number_message_no_seen");
            DOMElement.removeAllChildren(box);
            box.appendChild(DOMElement.div({
                attrs: {
                    className: "button-number"
                },
                text: number
            }));
        });
        var support_online = DOMElement.div({
            attrs: {
                style: {
                    height: "50px",
                    width: "200px",
                    backgroundColor: "#c9f1fd",
                    cursor: "pointer",
                    lineHeight: "50px",
                    textAlign: "center",
                    position: "relative"
                },
                onclick: function(){
                    carddone.menu.toggleSupportOnline(holder, iBridge);
                }
            }
        });
        iBridge.on('change_type_online', function(type_online){
            DOMElement.removeAllChildren(support_online);
            switch (type_online) {
                case -1:
                    support_online.appendChild(DOMElement.span({
                        text: "Ngoài giờ làm việc"
                    }));
                    break;
                case 0:
                    support_online.appendChild(DOMElement.span({
                        text: LanguageModule.text("txt_online_support")
                    }));
                    break;
                default:

            }
        });
        window.iBridge = iBridge;
        DOMElement.removeAllChildren(holder);
        var checkIdIsTabChat = function(id){
            for (var i = 0; i < carddone.listTabChat.length; i++){
                if (carddone.listTabChat[i].holder.id == id){
                    return carddone.listTabChat[i];
                }
            }
            return null;
        };
        var notifyMePC = function(content){
            console.log(content);
            var noticontent, title = "Carddone";
            title = contentModule.getUsernameFullnameByhomeid(data_module.users, content.userid);
            switch (content.dataDraw[content.dataDraw.length - 1].content_type) {
                case "text":
                case "file":
                    noticontent = content.dataDraw[content.dataDraw.length - 1].content;
                    break;
                case "img":
                    noticontent = "[photo]";
                    break;
                default:
                    noticontent = "";

            }
            if (!("Notification" in window)) {
                alert("This browser does not support system notifications");
            }
            else if (Notification.permission === "granted") {
                var notification = new Notification(title, {
                    body: noticontent,
                    image: "https://www.google.com/search?q=image&rlz=1C1CHBF_enVN819VN819&sxsrf=ALeKk008K94DLKwX8J5baWt_VbyLi6bPNQ:1594883944456&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj1ld7XndHqAhWabn0KHaWfC5AQ_AUoAXoECAwQAw&biw=1920&bih=937#imgrc=saXt3gObqm30jM",
                    data: {
                        content: content
                    },
                    icon: "../images2/carddone_favicon.ico"
                });
            }
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if (permission === "granted") {
                        var notification = new Notification(title, {
                            body: noticontent,
                            image: "https://www.google.com/search?q=image&rlz=1C1CHBF_enVN819VN819&sxsrf=ALeKk008K94DLKwX8J5baWt_VbyLi6bPNQ:1594883944456&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj1ld7XndHqAhWabn0KHaWfC5AQ_AUoAXoECAwQAw&biw=1920&bih=937#imgrc=saXt3gObqm30jM",
                            data: {
                                content: content
                            },
                            icon: "../images2/carddone_favicon.ico"
                        });
                    }
                });
            }
            notification.onclick = function(){
                if (window.focus) window.focus();
                if (carddone.listTabChat.length == 0){
                    carddone.menu.loadPage(7, undefined, notification.data.content.sessionid);
                }
                else {
                    var tabChatLast;
                    for (var i = carddone.menu.tabPanel.historyOfTab.length - 1; i >= 0; i --){
                        tabChatLast = checkIdIsTabChat(carddone.menu.tabPanel.historyOfTab[i]);
                        if (tabChatLast !== null){
                            carddone.menu.tabPanel.activeTab(carddone.menu.tabPanel.historyOfTab[i]);
                            tabChatLast.resolveOpenChat(notification.data.content.sessionid);
                            break;
                        }
                    }
                }
            };
        };
        var onMessageFunc = function(message){
            for (var i = 0; i < carddone.listTabChat.length; i++){
                if (message.content.tabid == carddone.listTabChat[i].holder.id) continue;
                carddone.listTabChat[i].resolveMessage(message);
            }
            if (message.content.userid == systemconfig.userid) return;
            if (message.content.listMember.indexOf(systemconfig.userid) < 0) return;
            if (message.content.type != "addmessage") return;
            if (!carddone.isMobile){
                carddone.menu.removeNotificationQueue(message.content);
                var isActive = false;
                if (document.hasFocus()){
                    var activetabid = carddone.menu.tabPanel.getActiveTabId();
                    if (activetabid !== null){
                        for (var i = 0; i < carddone.listTabChat.length; i++){
                            if (carddone.listTabChat[i].holder.id == activetabid){
                                isActive = true;
                                break;
                            }
                        }
                    }
                }
                if (!isActive){
                    notifyMePC(message.content);
                    //carddone.audioChatElt.firstChild.play();
                }
            }
            else {
                var viewNotificationInMobile = function(content){
                    carddone.menu.removeNotificationQueue(content);
                    if (content.sessionid != carddone.sessionIdActive){
                        //carddone.audioChatElt.firstChild.play();
                        var noticontent = "Tin nhắn mới", title = "Carddone", image = "";
                        title = contentModule.getUsernameFullnameByhomeid(data_module.users, content.userid);
                        for (var i = 0; i < content.dataDraw.length; i++){
                            switch (content.dataDraw[i].content_type) {
                                case "text":
                                    noticontent = content.dataDraw[i].content;
                                    break;
                                case "file":
                                    noticontent = "Đã gửi tệp đính kèm";
                                    break;
                                case "img":
                                    noticontent = "Đã gửi ảnh";
                                    break;
                            }
                        }
                        var ctn = DOMElement.div({
                            children: [
                                DOMElement.div({
                                    attrs: {
                                        style: {
                                            fontSize: "14px",
                                            fontWeight: "bold"
                                        }
                                    },
                                    text: title
                                })
                            ]
                        });
                        ctn.appendChild(DOMElement.div({
                            attrs: {
                                style: {
                                    fontSize: "13px",
                                    paddingTop: "10px"
                                }
                            },
                            text: noticontent
                        }));
                        var myBlinkModalInstance = absol.require('mblinkmodal').newInstance({
                            child: [ctn],
                            on: {
                                click: function () {
                                    myBlinkModalInstance.close();
                                    carddone.menu.loadPage(7).then(function(value){
                                        console.log("loadchatend");
                                        carddone.menu.openChatMobile(content.sessionid);
                                    });
                                }
                            },
                            duration: 10000
                        });
                    }
                };
                var content = message.content;
                if (window.isApp){
                    window.ReactNativeWebView.postMessage(JSON.stringify({name: "getStatusApp"}));
                    function GetToken(message){
                        var data = message.data;
                        console.log(data);
                        if (data.name == "getStatusApp"){
                            if (data.value == "active"){
                                viewNotificationInMobile(content);
                            }
                            window.removeEventListener("message",this);
                        }
                    };
                    window.addEventListener("message", GetToken);
                }

            }
        };
        var hostName = window.domain;
        var x = hostName.indexOf("://");
        if (x >= 0) hostName = hostName.substr(x + 3);
        x = hostName.indexOf("/");
        hostName = hostName.substr(0, x);
        var x = window.domain.indexOf(hostName);
        var y = window.domain.indexOf("/carddone");
        var channel = window.domain.substr(x + hostName.length + 1, y - (x + hostName.length + 1));
        var connectorChat = ChatClass.connect({
           host: hostName,
           channel: channel + "/carddone",
           onMessage: function(message){
               onMessageFunc(message);
           },
           onConnectionLost: function(message){
               console.log("onConnectionLost");
           },
           onConnect: function(){
               console.log("connect_" + (new Date()).getTime());
           },
           onClosed: function(message){
               console.log("onClosed");
           }
        });
        setTimeout(function(connectorChat){
            return function(){
                connectorChat.echo = true;
            }
        }(connectorChat), 2000);
        carddone.sendMessageFunc = function (connectorChat) {
            return function(content){
                content.userid = systemconfig.userid;
                connectorChat.send({
                    content: content,
                    receivertype: "all",
                    onsent: function () {
                        // console.log("send mess", content);
                    }
                });
            };
        } (connectorChat);
        carddone.menu.menuHeader = theme.menuHeader({
            serviceLogo: "../logo-card-15-11.png",
            serviceActiveList: serviceActiveList,
            serviceInactiveList: serviceInactiveList,
            privSystem: systemconfig.privSystem,
            cmd: {
                datatypes: function(){
                    carddone.menu.loadPage(3);
                },
                boards: function(){
                    carddone.menu.loadPage(4);
                },
                chat: function(){
                    carddone.menu.loadPage(7);
                },
                my_calendar: function(){
                    carddone.menu.loadPage(23);
                },
                activities: function(){
                    carddone.menu.loadPage(24);
                },
                nations: function(){
                    carddone.menu.loadPage(13);
                },
                city: function(){
                    carddone.menu.loadPage(14);
                },
                company: function(){
                    carddone.menu.loadPage(15);
                },
                contact: function(){
                    carddone.menu.loadPage(16);
                },
                company_class: function(){
                    carddone.menu.loadPage(17);
                },
                master_board: function(){
                    carddone.menu.loadPage(18);
                },
                account_group: function(){
                    carddone.menu.loadPage(19);
                },
                knowledge_groups: function(){
                    carddone.menu.loadPage(20);
                },
                knowledge: function(){
                    carddone.menu.loadPage(21);
                },
                districts: function(){
                    carddone.menu.loadPage(22);
                },
                my_report: function(){
                    carddone.menu.loadPage(8);
                },
                public_report: function(){
                    carddone.menu.loadPage(9);
                },
                board_groups: function(){
                    carddone.menu.loadPage(25);
                },
                report_groups: function(){
                    carddone.menu.loadPage(26);
                },
                reminder: function(){
                    carddone.menu.loadPage(27);
                },
                user: function(){
                    carddone.menu.loadPage(2);
                },
                personal_profile: function (index) {
                    carddone.menu.loadPage(1);
                },
                logout: function (index) {
                    carddone.menu.logout();
                },
                showMenuService: function (event, me) {
                    carddone.menu.showMenuTab(holder);
                }
            },
            support_online_iframe: support_online_iframe,
            support_online: support_online,
            username: systemconfig.username,
            user_avatars: systemconfig.user_avatars,
            companyWebsite: companyConfig.website,
            companyLogo: (companyConfig.logo == "") ? "" : window.domainCompany_logo + companyConfig.logo
        });
        carddone.menu.layoutInit = theme.layoutInit({
            header: carddone.menu.menuHeader,
            tabPanel: carddone.menu.tabPanel,
            tabBar: carddone.menu.mobileTabbar
        });
        holder.appendChild(carddone.menu.layoutInit);
        if (carddone.isMobile){
            // carddone.menu.loadPage(7);
            // carddone.menu.loadPage(101);
            // carddone.menu.loadPage(4);
            carddone.menu.loadPage(100);
        }
        else {
            carddone.menu.loadPage(4);
        }
        window.loadEvent = true;
        carddone.audioChatElt = DOMElement.div({
            attrs: {
                style: {
                    display: "none"
                }
            },
            innerHTML: '<audio controls>'+
                  '<source src="https://lab.daithangminh.vn/home_co/carddone/Nokia-Tune-Nhac-chuong-Nokia-Tune.mp3" type="audio/mpeg">'+
                '</audio>'
        });
        document.body.appendChild(carddone.audioChatElt);
    };
    var prerequisites = [
        "Contact", "Company", "Boards", "Cards", "My_calendar", "Activities", "Reminder",
        "Button", "Common_view", "Chats", "Activities_view",
        "Contact_view", "Company_view", "Boards_view", "Cards_view", "Chats_view", "Reminder_view"
    ];
    if (!carddone.isMobile){
        prerequisites.push(
            "Account", "Datatypes", "My_report_view", "Master_board_view", "Datatypes_view", "Nations_view", "Cities_view",
            "Company_class_view", "Account_view", "Nations", "Cities", "Districts", "Knowledge",
            "Board_groups", "Report_groups", "Company_class", "My_report", "Knowledge_groups", "Master_board",
            "Knowledge_groups_view", "Knowledge_view", "Board_groups_view", "Report_groups_view", "Districts_view", "My_calendar_view"
        );
    }
    if (ModuleManagerClass.isReady("Menu")){
        triggerFunc();
    }
    else {
        ModuleManagerClass.register({
            name: "Menu",
            prerequisites: prerequisites,
            trigger: triggerFunc
        });
    }
};
