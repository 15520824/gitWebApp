theme.formCompanyEdit = function(params){
    var props = {
        actionIcon: DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "arrow_back_ios"
        }),
        title: LanguageModule.text("txt_company"),
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
    };
    if (params.cmdbutton.add_contact !== undefined){
        props.quickmenu = {
            getMenuProps: function(){
                return {
                    items: [
                        {
                            icon: DOMElement.i({
                                attrs: {
                                    className: "material-icons"
                                },
                                text: "add"
                            }),
                            text: LanguageModule.text("txt_add_contact"),
                            cmd: params.cmdbutton.add_contact
                        }
                    ]
                }
            },
            onSelect: function(item){
                item.cmd();
            }
        };
    }
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: props,
        on: {
            action: params.cmdbutton.close,
            command: params.cmdbutton.save
        }
    });
    var name_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.name
    });
    var fullname_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.fullname
    });
    var address_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.address
    });
    var company_class_select = absol.buildDom({
        tag: "selectmenu",
        style: {
            display: "block",
            width: "100%"
        },
        props: {
            items: params.data.listCompany_class,
            value: params.data.company_classid,
            enableSearch: true
        }
    });
    var cityList = [];
     for (var i = 0; i < params.data.listNation.length; i++){
         if (params.data.listNation[i].value == params.data.nationid){
             cityList = params.data.listNation[i].cityList;
             break;
         }
     }
     var districtList = [];
     for (var i = 0; i < cityList.length; i++){
         if (cityList[i].value == params.data.cityid){
             districtList = cityList[i].districtList;
             break;
         }
     }
     var district_select = absol.buildDom({
         tag: "selectmenu",
         style: {
             display: "block",
             width: "100%"
         },
         props: {
             items: districtList,
             value: params.data.districtid,
             enableSearch: true
         }
     });
     var city_select = absol.buildDom({
         tag: "selectmenu",
         style: {
             display: "block",
             width: "100%"
         },
         props: {
             items: cityList,
             value: params.data.cityid,
             enableSearch: true
         },
         on: {
             change: function(){
                 for (var i = 0; i < cityList.length; i++){
                     if (cityList[i].value == this.value){
                         district_select.items = cityList[i].districtList;
                         district_select.value = 0;
                         break;
                     }
                 }
             }
         }
     });
     var nation_select = absol.buildDom({
        tag: "selectmenu",
        style: {
            display: "block",
            width: "100%"
        },
        props: {
            items: params.data.listNation,
            value: params.data.nationid,
            enableSearch: true
        },
        on: {
            change: function(){
                for (var i = 0; i < params.data.listNation.length; i++){
                    if (params.data.listNation[i].value == this.value){
                        city_select.items = params.data.listNation[i].cityList;
                        cityList = params.data.listNation[i].cityList;
                        city_select.value = 0;
                        break;
                    }
                }
                city_select.emit("change");
            }
        }
     });
    var gps_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.gps
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
    var fax_inputtext = contentModule.preventNotPhoneNumberInput(theme.input({
       style: {
           width: "100%"
       },
       value: params.data.fax
    }));
    var website_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.website
    });
    var taxcode_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.taxcode
    });
    var owner_select = absol.buildDom({
         tag: "mselectbox",
         style: {
             display: "block",
             width: "100%",
             maxWidth: "300px"
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
        tag: 'tabframe',
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
                        text: LanguageModule.text("txt_name")
                    }),
                    name_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_entire_name")
                    }),
                    fullname_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_company_class")
                    }),
                    company_class_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_address")
                    }),
                    address_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_nations")
                    }),
                    nation_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_city")
                    }),
                    city_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_district")
                    }),
                    district_select,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_gps")
                    }),
                    gps_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_phone_number")
                    }),
                    phone_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_email")
                    }),
                    email_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_fax")
                    }),
                    fax_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_website")
                    }),
                    website_inputtext,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-label-form-edit"
                        },
                        text: LanguageModule.text("txt_taxcode")
                    }),
                    taxcode_inputtext,
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
       if (name_inputtext.value.trim() == ""){
           ModalElement.alert({
               message: LanguageModule.text("war_txt_no_name"),
               func: function(){
                   name_inputtext.focus();
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
       return {
           name: name_inputtext.value.trim(),
           fullname: fullname_inputtext.value.trim(),
           company_classid: company_class_select.value,
           address: address_inputtext.value.trim(),
           districtid: district_select.value,
           cityid: city_select.value,
           nationid: nation_select.value,
           gps: gps_inputtext.value.trim(),
           phone: phone_inputtext.value.trim(),
           email: email_inputtext.value.trim(),
           fax: fax_inputtext.value.trim(),
           website: website_inputtext.value.trim(),
           taxcode: taxcode_inputtext.value.trim(),
           ownerList: owner_select.values,
           comment: comment_inputtext.value.trim(),
           available: activated_inputselect.checked
       }
    };
    setTimeout(function(){
        name_inputtext.focus()
    },10);
    return singlePage;
};

theme.formCompanyGetRow = function(content){
    if (content.address.length > 50) content.address = content.address.substr(0, 50) + "...";
         var company_classValue;
         if (content.company_classid == 0) company_classValue = "...";
         else company_classValue = content.company_class + "_" + content.company_classid;
         var nationValue;
         if (content.nationid == 0) nationValue = "...";
         else nationValue = content.nation + "_" + content.nationid;
         var cityValue;
         if (content.cityid == 0) cityValue = "...";
         else cityValue = content.city + "_" + content.cityid;
         var districtValue;
         if (content.districtid == 0) districtValue = "...";
         else districtValue = content.district + "_" + content.districtid;
        var row = [
            {
                value: content.name,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.name
                })
            },
            {
                value: company_classValue,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.company_class
                })
            },
            {
                value: content.address,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.address
                })
            },
           {
                 value: districtValue,
                 element: DOMElement.div({
                     attrs: {
                         className: "sortTable-cell-view"
                     },
                     text: content.district
                 })
             },
             {
                 value: cityValue,
                 element: DOMElement.div({
                     attrs: {
                         className: "sortTable-cell-view"
                     },
                     text: content.city
                 })
             },
             {
                 value: nationValue
             },
            {
                value: content.available,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    text: content.available
                })
            }
        ];
        row.func = content.func;
        return row;
    };

  theme.formCompanyContentData = function(params){
     var x;
     var data = [];
     if (params.data.length > 50){
         for (var i = 0; i < 50; i++){
             data.push(theme.formCompanyGetRow(params.data[i]));
         }
         setTimeout(function(){
             for (var i = 50; i < params.data.length; i++){
                 data.push(theme.formCompanyGetRow(params.data[i]));
             }
             x.updatePagination(undefined, false);
             x.addInputSearch(params.inputsearchbox);
             x.addFilter(params.company_class_select, 1);
             x.addFilter(params.nations_select, 5);
             x.addFilter(params.city_select, 4);
             x.addFilter(params.district_select, 3);
         }, 1000);
     }
     else {
         for (var i = 0; i < params.data.length; i++){
             data.push(theme.formCompanyGetRow(params.data[i]));
         }
     }
     console.log("startrawtable__" + (new Date()).getTime());
     x = pizo.tableView(
         [
             {value: LanguageModule.text("txt_name"), sort: true},
             {value: LanguageModule.text("txt_company_class"), sort: true},
             {value: LanguageModule.text("txt_address"), sort: true},
             {value: LanguageModule.text("txt_district"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_city"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_nation"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_active"), sort: false, hidden: true}
         ],
         data,
         false,
         true,
         1
     );
     x.addClass('am-gray-table');
     if (params.data.length < 50){
         x.addInputSearch(params.inputsearchbox);
         x.addFilter(params.company_class_select, 1);
         x.addFilter(params.nations_select, 5);
         x.addFilter(params.city_select, 4);
         x.addFilter(params.district_select, 3);
     }
     x.setUpSwipe(true, true);
     x.swipeCompleteRight = function(event, me, index, data, row, parent){
         data.func.edit().then(function(value){
             if (!value){
                 parent.exactlyDeleteRow(index);
             }
             else {
                 var c = theme.formCompanyGetRow(value);
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

theme.formCompanyInit = function(params){
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
        params.company_class_select.style.display = "block";
        params.company_class_select.style.width = "100%";
        params.nations_select.style.display = "block";
        params.nations_select.style.width = "100%";
        params.city_select.style.display = "block";
        params.city_select.style.width = "100%";
        params.district_select.style.display = "block";
        params.district_select.style.width = "100%";
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
                        params.company_class_select,
                        DOMElement.div({
                            attrs: {
                                className: "card-mobile-label-form-edit"
                            },
                            text: LanguageModule.text("txt_nations")
                        }),
                        params.nations_select,
                        DOMElement.div({
                            attrs: {
                                className: "card-mobile-label-form-edit"
                            },
                            text: LanguageModule.text("txt_city")
                        }),
                        params.city_select,
                        DOMElement.div({
                            attrs: {
                                className: "card-mobile-label-form-edit"
                            },
                            text: LanguageModule.text("txt_district")
                        }),
                        params.district_select
                    ]
                })
            ]
        });
        params.frameList.addChild(filter_container);
        filter_container.requestActive();
    };
    var commands = [];
    if (params.cmdbutton.add !== undefined){
        commands.push({
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "add"
            }),
            cmd: params.cmdbutton.add
        });
    }
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_company"),
            commands: commands
        },
        on: {
            action: params.cmdbutton.close,
            command: function(event){
                event.commandItem.cmd();
            }
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
    name: "Company_view",
    prerequisites: ["ModalElement"]
});
