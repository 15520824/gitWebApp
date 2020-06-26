var category_view_script_func = function(){
    theme.formCategoryEdit = function(params){
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
        var data = [];
        if (params.isparent){
            data.push([
                {text: LanguageModule.text("txt_category_parent")},
                {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
                {
                    children: [theme.input({
                        style: {width: "100%"},
                        value: params.parentName,
                        disabled: true
                    })]
                }
            ]);
            data.push([{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}]);
        }
        data.push([
            {text: LanguageModule.text("txt_name")},
            {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
            {
                children: [params.name_inputtext]
            }
        ]);
        data.push([{attrs: {style: {height: "var(--control-verticle-distance-2)"}}}]);
        data.push([
            {text: LanguageModule.text("txt_active")},
            {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
            {
                children: [params.activated_inputselect]
            }
        ]);
        return absol.buildDom({
            tag: "singlepagenfooter",
            child: [
                buttonPanel,
                DOMElement.table({
                   data: data
                })
            ]
        });
    };

    theme.formCategoryGetRow = function(content){
        var child = [];
        for (var i = 0; i < content.child.length; i++){
            child.push(theme.formCategoryGetRow(content.child[i]));
        }
        child.index = 1;
        var editIcon = DOMElement.div({
            attrs: {
                className: "card-icon-cover",
                style: {
                    marginRight: "var(--control-horizontal-distance-1)"
                }
            },
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black"
                },
                text: "create"
            })]
        });
        var addIcon = DOMElement.div({
            attrs: {
                className: "card-icon-cover",
                style: {
                    marginRight: "var(--control-horizontal-distance-1)"
                }
            },
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons bsc-icon-hover-black"
                },
                text: "add"
            })]
        });
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
                style: {whiteSpace: "nowrap"},
                value: content.name,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.name
                })
            },
            {
                value: content.createdby,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.createdby
                })
            },
            {
                value: content.createdtime,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.createdtime
                })
            },
            {
                value: content.lastmodifiedtime,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.lastmodifiedtime
                })
            },
            {
                value: content.available,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.available
                })
            },
            {
                functionClick: function(event,me,index,parent,data,row){
                    var me = event.target;
                    while (me.parentNode.classList !== undefined && !me.parentNode.classList.contains("sortTable-cell-view-cmd")) {
                        me = me.parentNode;
                    }
                    if(me === editIcon){
                       content.func.edit().then(function(value){
                           parent.updateRow(theme.formCategoryGetRow(value), index);
                       });
                    }
                    if(me === addIcon){
                       content.func.add().then(function(value){
                           row.insertRow(theme.formCategoryGetRow(value));
                       });
                    }
                    if(me === deleteIcon){
                       content.func.delete().then(function(value){
                           parent.dropRow(index);
                       });
                    }
                },
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view-cmd"
                    },
                    children: [
                        editIcon,
                        addIcon,
                        deleteIcon
                    ]
                })
            }
        ];
        if (child.length > 0) row.child = child;
        return row;
    };

    theme.formCategoryContentData = function(params){
        var data = [];
        for (var i = 0; i < params.data.length; i++){
            data.push(theme.formCategoryGetRow(params.data[i]));
        }
        console.log(data);
        var header = [
            {type: "dragzone", style: {textAlign: "center", width: "40px"}},
            {value: LanguageModule.text("txt_name"), sort: true},
            {value: LanguageModule.text("txt_createdby"), sort: true},
            {value: LanguageModule.text("txt_created_time"), sort: true},
            {value: LanguageModule.text("txt_last_modified_time"), sort: true},
            {value: LanguageModule.text("txt_active"), sort: true},
            {value: ""}
        ];
        var x = pizo.tableView(
            header,
            data,
            false,
            true
        );
        x.addInputSearch(params.inputsearchbox);
        return x;
    };

    theme.formCategoryInit = function(params){
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
};
category_view_script_func();
