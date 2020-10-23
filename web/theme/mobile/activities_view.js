theme.formActivitiesGetRow = function(content){
    var due_date;
    if (content.type == "checklist"){
        due_date = contentModule.formatTimeDisplay(content.time);
        content.time = new Date(content.time.setHours(23,59,59,999));
    }
    else {
        due_date = contentModule.getTimeSend(content.time);
    }
    var extraDataElt = DOMElement.div({
        attrs: {
            style: {
                fontSize: "12px"
            }
        },
        text: content.company_contactName
    });
    var row = [
        {
            value: content.activityName + " " + content.company_contactName,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "card-table-list-title",
                            style: {
                                textDecoration: (content.status)? "line-through" : "none",
                                color: (content.status)? "" : (content.time.getTime() < (new Date()).getTime())? "red" : ""
                            }
                        },
                        text: content.activityName
                    }),
                    extraDataElt
                ]
            })
        }
    ];
    row.func = content.func;
    return row;
};

theme.formActivitiesContentData = function(params){
    var data = [];
    for (var i = 0; i < params.data.length; i++){
        data.push(theme.formActivitiesGetRow(params.data[i]));
    }
    var x = pizo.tableView(
        [
            {
                value: LanguageModule.text("txt_title"),
                style: {minWidth: "100px"},
                sort: true
            }
        ],
        data,
        false,
        true
    );
    console.log(x);
    x.style.width = "100%";
    x.addClass('am-gray-table');
    x.addInputSearch(params.inputsearchbox);
    x.setUpSwipe(undefined,
        [
            {
                icon: "mode_edit",
                iconStyle: {color: "white"},
                text: LanguageModule.text('txt_edit'),
                background: "rgb(254, 149, 0)",
                textcolor: "white",
                event: function(event, me, index, data, row, parent){
                    data.func.edit().then(function(value){
                        console.log(value, index);
                    });
                }
            },
            {
                icon: DOMElement.i({
                    attrs: {
                        className: "mdi mdi-file-edit-outline"
                    }
                }),
                iconStyle: {color: "white"},
                text: LanguageModule.text("txt_open_card"),
                background: "rgb(175, 82, 222)",
                textcolor: "white",
                event: function(event, me, index, data, row, parent){
                    data.func.openCard();
                }
            }
        ]
    );
    x.swipeCompleteLeft = function(event, me, index, data, row, parent){
        data.func.openCard();
    };
    return x;
};

theme.formActivitiesInit = function(params){
    var filterFunc = function(){
        params.boards_select.style.display = "block";
        params.boards_select.style.width = "100%";
        params.users_select.style.display = "block";
        params.users_select.style.width = "100%";
        params.status_select.style.display = "block";
        params.status_select.style.width = "100%";
        theme.modalFormMobile({
            title: LanguageModule.text("txt_filter"),
            bodycontent: DOMElement.div({
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit-first"
                        },
                        text: LanguageModule.text("txt_board")
                    }),
                    params.boards_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_user")
                    }),
                    params.users_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_due_date")
                    }),
                    params.timestart_input,
                    params.timeend_input,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_status")
                    }),
                    params.status_select
                ]
            }),
            buttonList: [
                {
                    typeColor: "light",
                    text: LanguageModule.text("txt_ok")
                },
                {
                    typeColor: "dask",
                    text: LanguageModule.text("txt_cancel")
                }
            ],
            func: function(sel){
                if (sel == 0){
                    params.cmdbutton.viewReport();
                }
            }
        });
    };
    var header = absol.buildDom({
        tag: 'headerbarwithsearch',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "filter_alt"
                    }),
                    cmd: function(){
                        filterFunc();
                    }
                },
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "search"
                    }),
                    cmd: function(){
                        header.searchMode(true);
                    }
                }
            ],
            title: LanguageModule.text("txt_activity")
        },
        data:{
            searchInput: params.inputsearchbox
        },
        on: {
            action: params.cmdbutton.close,
            command: function(event){
                event.commandItem.cmd();
            }
        }
    });
    filterFunc();
    return absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: [params.data_container]
            })
        ]
    });
};

ModuleManagerClass.register({
   name: "Activities_view",
   prerequisites: ["ModalElement"]
});
