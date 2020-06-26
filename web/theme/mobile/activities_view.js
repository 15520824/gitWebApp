theme.formActivitiesGetRow = function(content){
    var quickMenuItems = [];
    var functionClickMore = function(event, me, index, parent, data, row){
        var items = [];
        if (content.permission == "edit"){
            items.push({
                text: LanguageModule.text("txt_edit"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child:{text: "mode_edit"}
                },
                value: 0
            });
        }
        items.push({
            text: LanguageModule.text("txt_open_card"),
            extendClasses: "bsc-quickmenu",
            icon: {
                tag: "i",
                class: ["mdi", "mdi-file-edit-outline"]
            },
            value: 1
        });
        var docTypeMemuProps = {
           items: items
       };
       var token = absol.QuickMenu.show(me, docTypeMemuProps, [3,4], function (menuItem) {
           switch(menuItem.value){
               case 0:
                   content.func.edit().then(function(value){
                       console.log(value, index);
                   });
                   break;
               case 1:
                   content.func.openCard();
                   break;

           }
       });

       var functionX = function(token){
           return function(){
               var x = function(event){
                   absol.QuickMenu.close(token);
                   document.body.removeEventListener("click",x);
               }
               document.body.addEventListener("click",x)
           }
       }(token);

       setTimeout(functionX, 10);
   }
    var qmenuButton = DOMElement.div({
        attrs: {
            className: "card-icon-cover"
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons bsc-icon-hover-black"
            },
            text: "more_vert"
        })]
    });

    var due_date;
    if (content.type == "checklist"){
        due_date = contentModule.formatTimeDisplay(content.time);
        content.time = new Date(content.time.setHours(23,59,59,999));
    }
    else {
        due_date = contentModule.getTimeSend(content.time);
    }
    var nowTime = new Date();
    if (content.time.getTime() < nowTime.getTime()){
        due_date = DOMElement.div({
            attrs: {
                className: "sortTable-cell-view",
                style: {
                    color: "red"
                }
            },
            text: due_date
        });
    }
    else {
        due_date = DOMElement.div({
            attrs: {
                className: "sortTable-cell-view"
            },
            text: due_date
        });
    }
    var row = [
        "",
        {},
        {
            value: content.activityName + " " + content.company_contactName,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            style: {
                                textDecoration: (content.status)? "line-through" : "none"
                            }
                        },
                        text: content.activityName
                    }),
                    DOMElement.div({
                        attrs: {
                            style: {
                                fontSize: "12px"
                            }
                        },
                        text: content.company_contactName
                    })
                ]
            })
        },
        {
            value: content.cardName,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.cardName
            })
        },
        {
            style: {whiteSpace: "nowrap"},
            value: content.boardName,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.boardName
            })
        },
        {
            style: {whiteSpace: "nowrap"},
            value: content.listName,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.listName
            })
        },
        {
            style: {whiteSpace: "nowrap"},
            value: content.time.getTime(),
            element: due_date
        },
        {
            style: {whiteSpace: "nowrap"},
            value: content.important,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.important
            })
        },
        {
            functionClick: functionClickMore,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view-cmd"
                },
                children: [
                    qmenuButton
                ]
            })
        }
    ];
    return row;
};

theme.formActivitiesContentData = function(params){
    var data = [];
    for (var i = 0; i < params.data.length; i++){
        data.push(theme.formActivitiesGetRow(params.data[i]));
    }
    var x = pizo.tableView(
        [
            {type: "dragzone", style: {paddingLeft: "var(--control-verticle-distance-1)", paddingRight: "var(--control-verticle-distance-1)", width: "40px"}},
            {value: LanguageModule.text("txt_index"), type: "increase"},
            {
                value: LanguageModule.text("txt_title"),
                style: {minWidth: "100px"},
                sort: true
            },
            {
                value: LanguageModule.text("txt_card"),
                style: {minWidth: "100px"},
                sort: true
            },
            {value: LanguageModule.text("txt_board"), sort: true},
            {value: LanguageModule.text("txt_period"), sort: true},
            {value: LanguageModule.text("txt_due_date"), sort: true},
            {value: LanguageModule.text("txt_important"), sort: true},
            {value: ""}
        ],
        data,
        false,
        true
    );
    return x;
};

theme.formActivitiesInit = function(params){
    var filterFunc = function(){
        var header = absol.buildDom({
            tag: 'mheaderbar',
            props: {
                actionIcon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "arrow_back_ios"
                }),
                title: LanguageModule.text("txt_filter")
            },
            on: {
                action: function(){
                    params.frameList.removeLast();
                }
            }
        });
        params.boards_select.style.display = "block";
        params.boards_select.style.width = "100%";
        params.users_select.style.display = "block";
        params.users_select.style.width = "100%";
        var filter_container = absol.buildDom({
            tag: 'tabframe',
            child:[
                header,
                DOMElement.div({
                    attrs: {
                        className: "card-mobile-content"
                    },
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
                            children: [params.finish_checkbox]
                        })
                    ]
                })
            ]
        });
        params.frameList.addChild(filter_container);
        filter_container.requestActive();
    };
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            commands: [{
                icon:  DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "filter_alt"
                })
            }],
            title: LanguageModule.text("txt_activity")
        },
        on: {
            action: params.cmdbutton.close,
            command: filterFunc
        }
    });
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
