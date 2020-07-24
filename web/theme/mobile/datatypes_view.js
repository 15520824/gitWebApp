theme.formDataTypesDataStructureGetRow = function(content){
    var deleteIcon = DOMElement.div({
        attrs: {
            className: "card-icon-remove-cover"
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons card-icon-remove"
            },
            text: "remove_circle"
        })]
    });
    var row = [
        "",
        {
            localid: content.localid,
            element: content.name
        },
        {
            element: content.type
        },
        {
            element: content.default
        },
        {
            element: content.require
        },
        {
            element: content.decpre
        },
        {
            functionClick: function(event,me,index,parent,data,row){
                var me = event.target;
                while (me.parentNode.classList !== undefined && !me.parentNode.classList.contains("sortTable-cell-view-cmd")) {
                    me = me.parentNode;
                }
                if (me === deleteIcon){
                   parent.dropRow(index);
                }
            },
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view-cmd"
                },
                children: [
                    deleteIcon
                ]
            })
        }
    ];
    return row;
};

theme.formDataTypesDataStructure = function(params){
    var data = [];
    for (var i = 0; i < params.data.length; i++){
        data.push(theme.formDataTypesDataStructureGetRow(params.data[i]));
    }
    var x = pizo.tableView(
        [
            {type: "dragzone", style: {paddingLeft: "var(--control-verticle-distance-1)", paddingRight: "var(--control-verticle-distance-1)", width: "40px"}},
            {value: LanguageModule.text("txt_name")},
            {value: LanguageModule.text("txt_datatype")},
            {value: LanguageModule.text("txt_default")},
            {value: LanguageModule.text("txt_require")},
            {value: LanguageModule.text("txt_number_of_decimal")},
            {value: ""}
        ],
        data,
        false,
        true
    );
    return x;
};

theme.formDataTypesEdit = function(params){
    var buttonlist = [];
    for (var i = 0; i < params.buttonlist.length; i++){
        buttonlist.push(DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [params.buttonlist[i]]
        }));
    }
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "absol-single-page-header button-panel-header"
        },
        children: buttonlist
    });

    var maxWidth = [
           LanguageModule.text("txt_name"),
           LanguageModule.text("txt_datatype"),
           LanguageModule.text("txt_active"),
           LanguageModule.text("txt_type_of_array"),
           LanguageModule.text("txt_type_of_enum"),
           LanguageModule.text("txt_object_selection"),
           LanguageModule.text("txt_comment")
       ].reduce(function(ac, text){
           return Math.max(ac, absol.text.measureText(text, '14px Arial').width);
       }, 0);
    var nameText = DOMElement.span({
        attrs: {style: {marginRight: "var(--control-horizontal-distance-2)", width: maxWidth + "px", display: "inline-block"}},
        text: LanguageModule.text("txt_name")
    });
    var typeText = DOMElement.span({
        attrs: {style: {marginRight: "var(--control-horizontal-distance-2)", width: maxWidth + "px", display: "inline-block"}},
        text: LanguageModule.text("txt_datatype")
    });
    var commentText = DOMElement.span({
        attrs: {style: {marginRight: "var(--control-horizontal-distance-2)", width: maxWidth + "px", display: "inline-block", verticalAlign: "top"}},
        text: LanguageModule.text("txt_comment")
    });
    var availableText = DOMElement.span({
        attrs: {style: {marginRight: "var(--control-horizontal-distance-2)", width: maxWidth + "px", display: "inline-block"}},
        text: LanguageModule.text("txt_active")
    });
    var object_selectionText = DOMElement.span({
        attrs: {style: {marginRight: "var(--control-horizontal-distance-2)", width: maxWidth + "px", display: "inline-block"}},
        text: LanguageModule.text("txt_object_selection")
    });
    params.name_type_of_array.style.width = maxWidth + "px";
    params.name_type_of_enum.style.width = maxWidth + "px";
    var divLeftContainer = DOMElement.div({
        attrs: {
            style: {
                display: "inline-block",
                paddingRight: "var(--control-horizontal-distance-2)",
                paddingBottom: "var(--control-horizontal-distance-2)"
            }
        },
        children: [
            DOMElement.div({
                children: [nameText, params.name_inputtext]
            }),
            DOMElement.div({
                attrs: {style: {paddingTop: "var(--control-verticle-distance-2)"}},
                children: [typeText, params.type_select]
            }),
            DOMElement.div({
                children: [params.name_type_of_array, params.select_type_of_array]
            }),
            DOMElement.div({
                children: [params.name_type_of_enum, params.select_type_of_enum]
            }),
            DOMElement.div({
                attrs: {style: {paddingTop: "var(--control-verticle-distance-2)"}},
                children: [commentText, params.comment_inputtext]
            }),
            DOMElement.div({
                attrs: {style: {paddingTop: "var(--control-verticle-distance-2)"}},
                children: [object_selectionText, params.object_selection_select]
            }),
            DOMElement.div({
                attrs: {style: {paddingTop: "var(--control-verticle-distance-2)"}},
                children: [availableText, params.available_checkbox]
            })
        ]
    });
    return absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            buttonPanel,
            DOMElement.div({
                children: [
                    divLeftContainer,
                    DOMElement.div({
                        attrs: {
                            style: {
                                display: "inline-block",
                                verticalAlign: "top"
                            }
                        },
                        children: [
                            params.detail_of_structure_container,
                            params.detail_of_enum_container
                        ]
                    })
                ]
            })
        ]
    });
};

theme.formTypeContentData = function(params){
    var data = [], celldata;
    for (var i = 0; i < params.content.length; i++){
        celldata = [
            {
                attrs: {align: "center"},
                text: i + 1
            },
            {
                attrs: {style: {whiteSpace: "nowrap"}},
                text: params.content[i].name
            },
            {
                text: params.content[i].type
            },
            {
                attrs: {align: "center"},
                text: params.content[i].object_selection
            },
            {
                text: params.content[i].createdby
            },
            {
                text: params.content[i].createdtime
            },
            {
                text: params.content[i].lastmodifiedtime
            },
            {
                attrs: {align: "center"},
                text: params.content[i].available
            }
        ];
        if (params.content[i].quickMenuItems.length > 0){
            var qmenuButton = DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black"
                },
                text: "more_vert"
            });

            absol.QuickMenu.showWhenClick(qmenuButton, {items: params.content[i].quickMenuItems}, [3, 4], function (menuItem) {
                if (menuItem.cmd) menuItem.cmd();
            });
            celldata.push({
                attrs: {align: "center"},
                children: [qmenuButton]
            });
        }
        else {
            celldata.push({});
        }
        data.push(celldata);
    }
    var x = DOMElement.table({
        header: [{
            attrs: {style: {width: "40px"}},
            text: LanguageModule.text("txt_index")
        },
        {
            text: LanguageModule.text("txt_name")
        },
        {
            text: LanguageModule.text("txt_datatype")
        },
        {
            text: LanguageModule.text("txt_object_selection")
        },
        {
            text: LanguageModule.text("txt_createdby")
        },
        {
            text: LanguageModule.text("txt_created_time")
        },
        {
            text: LanguageModule.text("txt_last_modified_time")
        },
        {
            text: LanguageModule.text("txt_active")
        },
        {attrs: {style: {width: "40px"}}}],
        data: data
    });
    x.addSearchBox(params.inputsearchbox);
    return x;
};

theme.formDatatypesInit = function(params){
    var buttonlist = [];
    for (var i = 0; i < params.buttonlist.length; i++){
        buttonlist.push(DOMElement.div({
            attrs: {
                className: "single-button-header"
            },
            children: [params.buttonlist[i]]
        }));
    }
    buttonlist.push(DOMElement.div({
        attrs: {
            className: "single-button-header"
        },
        children: [params.inputsearchbox]
    }));
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "button-panel-header"
        },
        children: buttonlist
    });
    return absol.buildDom({
        tag: "singlepagenfooter",
        child: [
            DOMElement.div({
                attrs: {
                    className: "absol-single-page-header"
                },
                children: [buttonPanel]
            }),
            params.data_container
        ]
    });
};
ModuleManagerClass.register({
    name: "Datatypes_view",
    prerequisites: ["ModalElement"]
});
