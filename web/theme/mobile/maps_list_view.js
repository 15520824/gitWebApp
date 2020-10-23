theme.formMapsInit = function(params){
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
    var header = absol.buildDom({
        tag: 'mheaderbar',
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
                }
            ],
            title: LanguageModule.text("txt_maps")
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
                children: [
                    params.data_container
                ]
            })
        ]
    });
};

ModuleManagerClass.register({
   name: "Maps_list_view",
   prerequisites: ["ModalElement"]
});
