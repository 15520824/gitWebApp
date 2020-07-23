theme.formContactEdit = function(params){
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_contact"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "save"
                    })
                }
            ]
        },
        on: {
            action: params.cmdbutton.close,
            command: params.cmdbutton.save
        }
    });
    var firstname_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.firstname
    });
    var lastname_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.lastname
    });
    var phone_inputtext = contentModule.preventNotPhoneNumberInput(theme.input({
       style: {
           width: "100%"
       },
       value: params.data.phone
    }));
    var email_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.email
    });
    var phone2_inputtext = contentModule.preventNotPhoneNumberInput(theme.input({
       style: {
           width: "100%"
       },
       value: params.data.phone2
    }));
    var email2_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.email2
    });
    var department_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.department
    });
    var position_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.position
    });
    var company_select = absol.buildDom({
        tag: "mselectmenu",
        style: {
            display: "block",
            width: "100%"
        },
        props: {
            items: params.data.listCompany,
            value: params.data.companyid,
            enableSearch: true
        }
    });

    if (!params.data.editCompany) company_select.disabled = true;
    var owner_select = absol.buildDom({
             tag: "mselectbox",
             style: {
                 display: "block",
                 width: "100%"
             },
             props: {
                 items: params.data.listOwnerAll,
                 values: params.data.ownerList,
                 enableSearch: true
             }
         });
    var comment_inputtext = DOMElement.textarea({
       attrs: {
           className: "cardSimpleTextarea",
           style: {
               width: "100%",
               height: "70px"
           },
           value: params.data.comment
       }
    });
    var activated_inputselect = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': "var(--switch-fontsize)"
        },
        props:{
            checked: params.data.activemode
        }
    });
    var singlePage = absol.buildDom({
        tag: "tabframe",
        child: [
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
                        text: LanguageModule.text("txt_firstname")
                    }),
                    firstname_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_lastname")
                    }),
                    lastname_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_phone_number1")
                    }),
                    phone_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_phone_number2")
                    }),
                    phone2_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_email1")
                    }),
                    email_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_email2")
                    }),
                    email2_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_department")
                    }),
                    department_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_position")
                    }),
                    position_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_company")
                    }),
                    company_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_owner")
                    }),
                    owner_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_comment")
                    }),
                    comment_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit",
                            style: {
                                position: "relative"
                            }
                        },
                        children: [
                            DOMElement.span({
                                text: LanguageModule.text("txt_active")
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        position: "absolute",
                                        right: 0,
                                        top: 0
                                    }
                                },
                                children: [activated_inputselect]
                            })
                        ]
                    })
                ]
            })
        ]
    });
    singlePage.getValue = function(){
       if (firstname_inputtext.value.trim() == "" && lastname_inputtext.value.trim() == ""){
           ModalElement.alert({
               message: LanguageModule.text("war_txt_no_firstname_lastname"),
               func: function(){
                   firstname_inputtext.focus();
               }
           });
           return;
       }
       if (email_inputtext.value.trim() !== ""){
           if (!contentModule.filterEmail.test(email_inputtext.value.trim())){
               ModalElement.alert({
                   message: LanguageModule.text("war_txt_email_invalid"),
                   func: function(){
                       email_inputtext.focus();
                   }
               });
               return;
           }
       }
       if (email2_inputtext.value.trim() !== ""){
           if (!contentModule.filterEmail.test(email2_inputtext.value.trim())){
               ModalElement.alert({
                   message: LanguageModule.text("war_txt_email_invalid"),
                   func: function(){
                       email2_inputtext.focus();
                   }
               });
               return;
           }
       }
       return {
           firstname: firstname_inputtext.value.trim(),
           lastname: lastname_inputtext.value.trim(),
           phone: phone_inputtext.value.trim(),
           email: email_inputtext.value.trim(),
           phone2: phone2_inputtext.value.trim(),
           email2: email2_inputtext.value.trim(),
           department: department_inputtext.value.trim(),
           position: position_inputtext.value.trim(),
           companyid: company_select.value,
           ownerList: owner_select.values,
           comment: comment_inputtext.value.trim(),
           available: activated_inputselect.checked
       }
    };
    setTimeout(function(){
        firstname_inputtext.focus()
    },10);
    return singlePage;
 };

 theme.formContactGetRow = function(content){
     var row = [
         {
             value: content.firstname,
             element: DOMElement.div({
                 attrs: {
                     className: "sortTable-cell-view"
                 },
                 text: content.firstname
             })
         },
         {
             value: content.lastname,
             element: DOMElement.div({
                 attrs: {
                     className: "sortTable-cell-view"
                 },
                 text: content.lastname
             })
         },
         {
             value: content.phone,
             element: DOMElement.div({
                 attrs: {
                     className: "sortTable-cell-view"
                 },
                 text: content.phone
             })
         },
         {
             value: content.email,
             element: DOMElement.div({
                 attrs: {
                     className: "sortTable-cell-view"
                 },
                 text: content.email
             })
         }
     ];
     if (content.department !== undefined){
         row.push({
             value: content.department,
             element: DOMElement.div({
                 attrs: {
                     className: "sortTable-cell-view"
                 },
                 text: content.department
             })
         });
     }
     if (content.position !== undefined){
        row.push({
            value: content.position,
            element: DOMElement.div({
                attrs: {
                    className: "sortTable-cell-view"
                },
                text: content.position
            })
        });
     }
     if (content.company !== undefined){
         row.push({
             value: (content.company != "")? content.company + "_" + content.companyid : "...",
             element: DOMElement.div({
                 attrs: {
                     className: "sortTable-cell-view"
                 },
                 text: content.company
             })
         });
     }
     row.push({
         value: content.available,
         element: DOMElement.div({
             attrs: {
                 className: "sortTable-cell-view"
             },
             text: content.available
         })
     });
     row.func = content.func;
     return row;
 };

 theme.formContactContentData = function(params){
     var data = [];
     for (var i = 0; i < params.data.length; i++){
         data.push(theme.formContactGetRow(params.data[i]));
     }
     var header = [
         {value: LanguageModule.text("txt_firstname"), sort: true},
         {value: LanguageModule.text("txt_lastname"), sort: true},
         {value: LanguageModule.text("txt_phone_number1"), sort: true},
         {value: LanguageModule.text("txt_email1"), sort: false, hidden: true}
     ];
     if (params.fromCompany === undefined){
         header.push(
             {value: LanguageModule.text("txt_department"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_position"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_company"), sort: false, hidden: true}
         );
     }
     header.push({value: LanguageModule.text("txt_active"), sort: false, hidden: true});
     var x = pizo.tableView(
         header,
         data,
         false,
         true,
         1
     );
     x.addClass('am-gray-table');
     if (params.inputsearchbox !== undefined){
         x.addInputSearch(params.inputsearchbox);
         x.addFilter(params.company_select, 6);
     }
     x.setUpSwipe(true, true);
     x.swipeCompleteRight = function(event, me, index, data, row, parent){
         data.func.edit().then(function(value){
             if (!value){
                 parent.exactlyDeleteRow(index);
             }
             else {
                 var c = theme.formContactGetRow(value);
                 parent.updateRow(c, index);
             }
         });
     };
     x.swipeCompleteLeft = function(event, me, index, data, row, parent){
         data.func.delete().then(function(value){
             parent.exactlyDeleteRow(index);
         });
     };
     return x;
 };

theme.formContactInit = function(params){
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
        params.company_select.style.display = "block";
        params.company_select.style.width = "100%";
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
                            text: LanguageModule.text("txt_company_class")
                        }),
                        params.company_select
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
            title: LanguageModule.text("txt_contact"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "add"
                    })
                }
            ]
        },
        on: {
            action: params.cmdbutton.close,
            command: params.cmdbutton.add
        }
    });
    params.inputsearchbox.style.width = "calc(100vw - var(--tab-padding-left) - var(--tab-padding-right) - 20px)";
    return absol.buildDom({
        tag: 'tabframe',
        child:[
            header,
            DOMElement.table({
                attrs: {
                    style: {
                        marginLeft: "var(--tab-padding-left)",
                        marginTop: "var(--control-verticle-distance-2)"
                    }
                },
                data: [[
                    params.inputsearchbox,
                    DOMElement.div({
                        attrs: {
                            className: "card-icon-edit-message-cover",
                            onclick: function(){
                                filterFunc();
                            }
                        },
                        children: [DOMElement.i({
                            attrs: {
                                className: "material-icons card-icon-edit-message"
                            },
                            text: "filter_alt"
                        })]
                    })
                ]]
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content-has-search absol-single-page-scroller"
                },
                children: [params.data_container]
            })
        ]
    });
};
ModuleManagerClass.register({
    name: "Contact_view",
    prerequisites: ["ModalElement"]
});
