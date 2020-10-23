theme.formCompanyEdit = function(params){
    params.funcs = {
        input: theme.input
    };
    var commands = [];
    if (params.data.permission >= 2){
        commands.push({
            icon:  DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "save"
            })
        });
    }
    var props = {
        actionIcon: DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "arrow_back_ios"
        }),
        title: LanguageModule.text("txt_company"),
        commands: commands
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
       value: params.data.name,
       disabled: (params.data.permission < 2)
    });
    var fullname_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.fullname,
       disabled: (params.data.permission < 2)
    });
    var address_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.address,
       disabled: (params.data.permission < 2)
    });
    var getColorIconMarker = function(){
        var cIndex = params.database.company_class.getIndex(company_class_select.value);
        var color;
        if (cIndex < 0){
            color = systemconfig.markerColor;
        }
        else {
            if (params.database.company_class.items[cIndex].color != "") color = params.database.company_class.items[cIndex].color;
            else color = systemconfig.markerColor;
        }
        return color;
    };
    var company_class_select = absol.buildDom({
        tag: "mselectmenu",
        style: {
            display: "block",
            width: "100%"
        },
        props: {
            items: params.data.listCompany_class,
            value: params.data.company_classid,
            enableSearch: true,
            disabled: (params.data.permission < 2)
        },
        on: {
            change: function(){
                drawFieldDetails();
                maps.setColorIconMarker(getColorIconMarker());
            }
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
         tag: "mselectmenu",
         style: {
             display: "block",
             width: "100%"
         },
         props: {
             items: districtList,
             value: params.data.districtid,
             enableSearch: true,
             disabled: (params.data.permission < 2)
         }
     });
     var city_select = absol.buildDom({
         tag: "mselectmenu",
         style: {
             display: "block",
             width: "100%"
         },
         props: {
             items: cityList,
             value: params.data.cityid,
             enableSearch: true,
             disabled: (params.data.permission < 2)
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
        tag: "mselectmenu",
        style: {
            display: "block",
            width: "100%"
        },
        props: {
            items: params.data.listNation,
            value: params.data.nationid,
            enableSearch: true,
            disabled: (params.data.permission < 2)
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
     var maps;
     var gps_inputtext = theme.input({
        style: {
            width: "100%"
        },
        value: params.data.gps,
        disabled: (params.data.permission < 2),
        onkeydown: function(){
            var self = this;
            setTimeout(function(){
                if (self.value != ""){
                    var x = self.value.indexOf(",");
                    if (x > 0){
                        lat = parseFloat(self.value.substr(0, x));
                        lng = parseFloat(self.value.substr(x + 1));
                        maps.addMoveMarker([lat, lng]);
                    }
                }
            },100);
        }
     });
     var showLocation = function(position){
         var color = getColorIconMarker();
         maps.addMoveMarker([position.coords.latitude, position.coords.longitude], color);
     };

     var showLocation1 = function(position){
         maps.addMoveMarker([position.coords.latitude, position.coords.longitude]);
         gps_inputtext.value = position.coords.latitude + "," +  position.coords.longitude;
     };

     function getLocation(type) {
        if (navigator.geolocation) {
            if (type == 0){
                navigator.geolocation.getCurrentPosition(showLocation);
            }
            else {
                navigator.geolocation.getCurrentPosition(showLocation1);
            }
        }
        else {
            console.log("Geolocation is not supported by this browser.");
        }
     };
     var my_location_btn = DOMElement.i({
         attrs: {
             className: "material-icons bsc-icon-hover-black",
             onclick: function(){
                 if (params.data.permission >= 2){
                     getLocation(1);
                 }
             }
         },
         text: "my_location"
     });
     var changeGpsFunc = function(manual){
         if (district_select.value == 0 || city_select.value == 0 || nation_select.value == 0) return;
         if (!manual && gps_inputtext.value.trim() != "") return;
         if (address_inputtext.value.trim() == "") return;
         var text = address_inputtext.value.trim();
         var index = params.database.districts.getIndex(district_select.value);
         if (index < 0) return;
         text += ", " + params.database.districts.items[index].name;
         index = params.database.cities.getIndex(city_select.value);
         if (index < 0) return;
         text += ", " + params.database.cities.items[index].name;
         index = params.database.nations.getIndex(nation_select.value);
         if (index < 0) return;
         text += ", " + params.database.nations.items[index].name;
         console.log(text);
         maps.getLongLat(text).then(function (result) {
             maps.addMoveMarker(result)
             gps_inputtext.value = result[0] + "," + result[1];
         });
     };
     var on_location_btn = DOMElement.i({
         attrs: {
             title: LanguageModule.text("txt_get_gps_follow_address"),
             className: "material-icons bsc-icon-location",
             onclick: function(){
                 if (params.data.permission >= 2){
                     changeGpsFunc(1);
                 }
             }
         },
         text: "location_on"
     });
     var lat = "";
     var lng = "";
     if (params.data.gps != ""){
         var x = params.data.gps.indexOf(",");
         if (x > 0){
             lat = parseFloat(params.data.gps.substr(0, x));
             lng = parseFloat(params.data.gps.substr(x + 1));
         }
     }
     if (lat == "" || lng == ""){
         lat = 10.772135581834007;
         lng = 106.69827803220034;
         maps = new MapView(gps_inputtext, lat, lng);
         getLocation(0);
     }
     else {
         maps = new MapView(gps_inputtext, lat, lng);
         var color = getColorIconMarker();
         maps.addMoveMarker([lat, lng], color);
     }
    var phone_inputtext = contentModule.preventNotPhoneNumberInput(theme.input({
       style: {
           width: "100%"
       },
       value: params.data.phone,
       disabled: (params.data.permission < 2)
    }));
    var email_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.email,
       disabled: (params.data.permission < 2)
    });
    var fax_inputtext = contentModule.preventNotPhoneNumberInput(theme.input({
       style: {
           width: "100%"
       },
       value: params.data.fax,
       disabled: (params.data.permission < 2)
    }));
    var website_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.website,
       disabled: (params.data.permission < 2)
    });
    var taxcode_inputtext = theme.input({
       style: {
           width: "100%"
       },
       value: params.data.taxcode,
       disabled: (params.data.permission < 2)
    });
    var owner_select = absol.buildDom({
         tag: "mselectbox",
         style: {
             display: "block",
             width: "100%"
         },
         props: {
             items: params.data.listOwnerAll,
             values: params.data.ownerList,
             enableSearch: true,
             disabled: (params.data.permission < 2)
         }
     });
    var comment_inputtext = DOMElement.textarea({
       attrs: {
           className: "cardSimpleTextarea",
           style: {
               width: "100%",
               height: "70px"
           },
           value: params.data.comment,
           disabled: (params.data.permission < 2)
       }
    });
    var activated_inputselect = absol.buildDom({
        tag: 'switch',
        style: {
            'font-size': "var(--switch-fontsize)"
        },
        props:{
            checked: params.data.activemode,
            disabled: (params.data.permission < 2)
        }
    });
    var add_new_elt, new_field_select;
    var listField, listDataField;
    var deleteField = function(elt, typeid){
        for (var i = 0; i < listDataField.length; i++){
            if (listDataField[i].typeid == typeid){
                listDataField.splice(i, 1);
                break;
            }
        }
        var isAdd = false;
        var company_classid = company_class_select.value;
        for (var i = 0; i < params.database.field_company_class.items.length; i++){
            if (params.database.field_company_class.items[i].company_classid != company_classid) continue;
            if (params.database.field_company_class.items[i].typeid == typeid){
                isAdd = true;
                break;
            }
        }
        if (isAdd){
            var typeIndex = params.database.typelists.getIndex(typeid);
            listField.push({
                value: params.database.field_company_class.items[i].typeid,
                text: params.database.typelists.items[typeIndex].name
            });
            new_field_select.items = listField;
            add_new_elt.style.display = "";
        }
        elt.remove();
    };
    var deleteFieldConfirm = function(elt, typeid){
        var typeIndex = params.database.typelists.getIndex(typeid);
        ModalElement.question({
           title: LanguageModule.text("war_title_field"),
           message: LanguageModule.text2("war_txt_field", [params.database.typelists.items[typeIndex].name]),
           onclick: function(sel){
               if (sel == 0){
                   deleteField(elt, typeid);
               }
           }
        });
    };
    var createFieldElt = function(newElt, typeid, valueid){
        var typeIndex = params.database.typelists.getIndex(typeid);
        var res = DOMElement.div({
            children: [
                DOMElement.div({
                    attrs: {
                        className: "card-mobile-label-form-edit"
                    },
                    text: params.database.typelists.items[typeIndex].name
                }),
                DOMElement.table({
                    attrs: {
                        style: {
                            width: "100%"
                        }
                    },
                    data: [[
                        DOMElement.div({
                            attrs: {
                                style: {
                                    verticalAlign: "middle"
                                }
                            },
                            children: [newElt]
                        }),
                       {attrs: {style: {width: "var(--control-horizontal-distance-2)"}}},
                       {
                           attrs: {
                               align: "right"
                           },
                           children: [DOMElement.div({
                               attrs: {
                                   className: "card-icon-remove-cover",
                                   style: {
                                       display: (params.data.permission >= 2)? "" : "none",
                                   },
                                   onclick: function(){
                                       deleteFieldConfirm(res, typeid);
                                   }
                               },
                               children: [DOMElement.i({
                                   attrs: {className: "material-icons card-icon-remove"},
                                   text: "remove_circle"
                               })]
                           })]
                       }
                    ]]
                })
            ]
        });
        return res;
    };
    var addField = function(){
        var typeid = new_field_select.value;
        for (var i = 0; i < listField.length; i++){
            if (listField[i].value == typeid){
                listField.splice(i, 1);
                break;
            }
        }
        new_field_select.items = listField;
        if (listField.length == 0) add_new_elt.style.display = "none";
        var newElt = contentModule.getObjectbyType(params, typeid, 0);
        listDataField.push({
            typeid: typeid,
            valueid: 0,
            elt: newElt,
            objid: 0
        });
        var newEltCtn = createFieldElt(newElt, typeid, 0);
        fieldContainer.insertBefore(newEltCtn, add_new_elt);
    };
    var getIndexByTypeid = function(typeid){
        for (var i = 0; i < listDataField.length; i++){
            if (listDataField[i].typeid == typeid) return i;
        }
        return -1;
    };
    var drawFieldDetails = function(){
        DOMElement.removeAllChildren(fieldContainer);
        var company_classid = company_class_select.value;
        listField = [];
        listDataField = [];
        var newElt;
        for (var i = 0; i < params.database.objects.items.length; i++){
            if (params.data.permission >= 2){
                var newElt = contentModule.getObjectbyType(params, params.database.objects.items[i].typeid, params.database.objects.items[i].valueid);
            }
            else {
                var newElt = contentModule.getObjectbyTypeView(params, params.database.objects.items[i].typeid, params.database.objects.items[i].valueid);
            }
            var newEltCtn = createFieldElt(newElt, params.database.objects.items[i].typeid, params.database.objects.items[i].valueid);
            fieldContainer.appendChild(newEltCtn);
            listDataField.push({
                typeid: params.database.objects.items[i].typeid,
                valueid: params.database.objects.items[i].valueid,
                elt: newElt,
                objid: params.database.objects.items[i].id
            });
        }
        var typeIndex;
        for (var i = 0; i < params.database.field_company_class.items.length; i++){
            if (params.database.field_company_class.items[i].company_classid != company_classid) continue;
            if (getIndexByTypeid(params.database.field_company_class.items[i].typeid) >= 0) continue;
            typeIndex = params.database.typelists.getIndex(params.database.field_company_class.items[i].typeid);
            if (typeIndex < 0) continue;
            listField.push({
                value: params.database.field_company_class.items[i].typeid,
                text: params.database.typelists.items[typeIndex].name
            });
        }
        new_field_select = absol.buildDom({
            tag: "selectmenu",
            style: {
                verticalAlign: "middle",
                width: "100%"
            },
            props: {
                items: listField
            }
        });
        add_new_elt = DOMElement.div({
            attrs: {
                style: {
                    display: "none"
                }
            },
            children: [
                DOMElement.div({
                    attrs: {
                        className: "card-mobile-label-form-edit"
                    },
                    text: LanguageModule.text("txt_field")
                }),
                new_field_select,
                DOMElement.a({
                    attrs: {
                        style: {
                            lineHeight: "30px",
                            height: "30px",
                            cursor: "pointer",
                            color: "var(--a-color)",
                            display: (params.data.permission >= 2)? "block" : "none"
                        },
                        onclick: function(){
                            addField();
                        }
                    },
                    text: LanguageModule.text("txt_add")
                })
            ]
        });
        fieldContainer.appendChild(add_new_elt);
        if (listField.length > 0){
            add_new_elt.style.display = "";
        }
    };
    var fieldContainer = DOMElement.div({});
    drawFieldDetails();
    var dataView = [
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit-first"
            },
            text: LanguageModule.text("txt_short_name")
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
            text: LanguageModule.text("txt_address")
        }),
        address_inputtext,
        DOMElement.div({
            attrs: {
                className: "card-mobile-label-form-edit"
            },
            text: LanguageModule.text("txt_gps")
        }),
        DOMElement.table({
            attrs: {style: {width: "100%"}},
            data: [[
                gps_inputtext,
                {
                    attrs: {style: {paddingLeft: "10px", textAlign: "center"}},
                    children: [on_location_btn]
                },
                {
                    attrs: {style: {paddingLeft: "10px", textAlign: "center"}},
                    children: [my_location_btn]
                }
            ]]
        }),
        DOMElement.div({
            attrs: {
                className: "card-edit-company-block-maps-child-ctn-mobile"
            },
            children: [maps]
        }),
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
    ];
    if (params.data.id > 0){
        dataView = dataView.concat([
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: LanguageModule.text("txt_created_time")
            }),
            DOMElement.div({
                text: params.data.createdtime
            }),
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit"
                },
                text: LanguageModule.text("txt_createdby")
            }),
            DOMElement.div({text: params.data.createdby})
        ]);
    }
    var dataEdit = [
        DOMElement.div({
            children: dataView
        }),
        fieldContainer
    ];
    if (params.data.id > 0){
        dataEdit = dataEdit.concat([
            DOMElement.div({
                attrs: {
                    className: "card-mobile-label-form-edit",
                    style: {
                        position: "relative"
                    }
                },
                children: [
                    DOMElement.span({text: LanguageModule.text("txt_contact")}),
                    DOMElement.a({
                        attrs: {
                            style: {
                                color: "var(--a-color)",
                                position: "absolute",
                                right: 0,
                                display: (params.data.permission >= 2)? "" : "none"
                            },
                            onclick: params.cmdbutton.add_contact
                        },
                        text: LanguageModule.text("txt_add")
                    })
                ]
            }),
            DOMElement.div({
                attrs: {
                    className: "card-edit-company-block-contact"
                },
                children: [params.data.dataViewContact]
            })
        ]);
    }
    var singlePage = absol.buildDom({
        tag: 'tabframe',
        child: [
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: dataEdit
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
           available: activated_inputselect.checked,
           listField: listDataField
       }
    };
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
        var extraDataElt = DOMElement.div({
            attrs: {
                className: "card-table-list-extra-data"
            }
        });
        if (content.company_classid != 0) {
            extraDataElt.appendChild(DOMElement.span({
                text: content.company_class
            }));
            if (content.address != "") extraDataElt.appendChild(DOMElement.span({
                text: " - "
            }));
        }
        if (content.address != ""){
            extraDataElt.appendChild(DOMElement.span({
                text: content.address
            }));
        }
        var row = [
            {
                functionClick: function(event,me,index,parent,data,row){
                    content.func.edit(function(value){
                        if (!value){
                            parent.exactlyDeleteRow(index);
                        }
                        else {
                            var c = theme.formCompanyGetRow(value);
                            parent.updateRow(c, index);
                        }
                    });
                },
                value: content.name,
                element: DOMElement.div({
                    attrs: {
                        className: "sortTable-cell-view"
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-table-list-title"
                            },
                            text: content.name
                        }),
                        extraDataElt
                    ]
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
             }
        ];
        row.func = content.func;
        row.permission = content.permission;
        return row;
    };

  theme.formCompanyContentData = function(params){
     var x;
     var data = [];
     for (var i = 0; i < params.data.length; i++){
         data.push(theme.formCompanyGetRow(params.data[i]));
     }
     console.log("startrawtable__" + (new Date()).getTime());
     x = pizo.tableView(
         [
             {value: LanguageModule.text("txt_short_name"), sort: true},
             {value: LanguageModule.text("txt_company_class"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_district"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_city"), sort: false, hidden: true},
             {value: LanguageModule.text("txt_nation"), sort: false, hidden: true}
         ],
         data,
         undefined,
         [],
         1
     );
     x.addClass('am-gray-table');
     x.style.width = "100%";
     x.addInputSearch(params.inputsearchbox);
     x.addFilter(params.company_class_select, 1);
     x.addFilter(params.district_select, 2);
     x.addFilter(params.city_select, 3);
     x.addFilter(params.nations_select, 4);
     x.setUpSwipe(true, true);
     x.swipeCompleteRight = function(event, me, index, data, row, parent){
         data.func.edit(function(value){
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
         if (data.permission >= 2){
             data.func.delete().then(function(value){
                 parent.exactlyDeleteRow(index);
             });
         }
     };
     return x;
 };

theme.formCompanyInit = function(params){
    var filterFunc = function(){
        params.company_class_select.style.display = "block";
        params.company_class_select.style.width = "100%";
        params.nations_select.style.display = "block";
        params.nations_select.style.width = "100%";
        params.city_select.style.display = "block";
        params.city_select.style.width = "100%";
        params.district_select.style.display = "block";
        params.district_select.style.width = "100%";
        theme.modalFormMobile({
            title: LanguageModule.text("txt_filter"),
            bodycontent: DOMElement.div({
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
        });
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
    commands.push({
        icon:  DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "filter_alt"
        }),
        cmd: function(){
            filterFunc();
        }
    });
    commands.push({
        icon:  DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "search"
        }),
        cmd: function(){
            header.searchMode(true);
        }
    });
    var header = absol.buildDom({
        tag: 'headerbarwithsearch',
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
    name: "Company_view",
    prerequisites: ["ModalElement"]
});
