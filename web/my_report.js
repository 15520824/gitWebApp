'use strict';

carddone.my_report.editReport = function(host, id){
    var report_name, report_group, owner, share_status, description;
    var report_type, report_filter;
    /////////////////////
    report_name = "";
    report_group = "",
    owner = 1;
    share_status = 1;
    description = "";
    ///////////////////
    report_type = "simple";
    report_filter = [];
    var buttonlist = [
        host.funcs.closeButton({
            onclick: function(){
                host.frameList.removeLast();
            }
        }),
        host.funcs.saveButton({
            onclick: function (){
                console.log("save action");
                // carddone.my_report.editReport(host, 0);
            }
        }),
        host.funcs.saveAsButton({
            onclick: function (){
                console.log("save as action");
                // carddone.my_report.editReport(host, 0);
            }
        }),
        host.funcs.exportButton({
            onclick: function (){
                console.log("export action");
                // carddone.my_report.editReport(host, 0);
            }
        }),
        host.funcs.viewReportButton({
            onclick: function (){
                console.log("make report action");
                // carddone.my_report.editReport(host, 0);
            }
        })
    ];
    var singlePage = host.funcs.editReportForm({
        buttonlist: buttonlist,
        general_info: {
            report_name: {
                title: LanguageModule.text("txt_report_name"),
                value: report_name
            },
            report_group: {
                title: LanguageModule.text("txt_report_group"),
                value: report_group
            },
            owner: {
                title: LanguageModule.text("txt_owner"),
                value: owner
            },
            share_status: {
                title: LanguageModule.text("txt_share"),
                value: share_status
            },
            description: {
                title: LanguageModule.text("txt_description"),
                value: description
            },
            summary: {
                title: LanguageModule.text("txt_summary"),
                value: ""
            }
        },
        filter_info: {
            title: LanguageModule.text("txt_data_condition_configuration"),
            report_type: {
                title: LanguageModule.text("txt_report_type"),
                items: [
                    {
                        text: LanguageModule.text("txt_simple_table"),
                        value: "simple"
                    },
                    {
                        text: LanguageModule.text("txt_pivot_table"),
                        value: "pivot"
                    }
                ],
                value: report_type
            }
        },
        filter_table: {
            header: {
                collumn: LanguageModule.text("txt_collumn"),
                display: LanguageModule.text("txt_display"),
                collumn_title: LanguageModule.text("txt_collumn_title"),
                value: LanguageModule.text("txt_value"),
                data_filter: LanguageModule.text("txt_data_filter"),
                last_row: LanguageModule.text("txt_last_row")
            },
            data: report_filter
        }
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

carddone.my_report.redraw = function(host){

};

carddone.my_report.init = function(host){
    host.database = {};
    var buttonlist = [
        host.funcs.closeButton({
            onclick: function(){
                carddone.menu.tabPanel.removeTab(host.holder.id);
            }
        }),
        host.funcs.addButton({
            onclick: function (){
                carddone.my_report.editReport(host, 0);
            }
        })
    ];
    host.data_container = absol._({
        class: ["cardsimpletableclass", "cardtablehover"]
    });
    host.holder.addChild(host.frameList);
    var params = {
        buttonlist: buttonlist,
        data_container: host.data_container
    };
    var singlePage = host.funcs.formReportListLayout(params);
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.my_report.redraw(host);
};

ModuleManagerClass.register({
    name: "My_report",
    prerequisites: ["ModalElement", "FormClass"]
});
