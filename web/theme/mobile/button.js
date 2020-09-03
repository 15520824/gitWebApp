theme.noneIconButton = function(params){
    var res = absol.buildDom({
        tag: "flexiconbutton",
        style: {
            minWidth: "var(--button-min-width)",
            height: "var(--button-height)",
            fontSize: "var(--button-title-font-size)",
            fontWeight: "var(--button-title-font-weight)"
        },
        on: {
            click: params.onclick
        },
        props:{
            text: params.text
        }
    });
    if (params.special !== undefined) if (params.special) res.style.backgroundColor = "var(--button-background-color_4)";
    return res;
};

theme.notNowButton = function(params){
    params.text = LanguageModule.text("txt_not_now");
    return theme.noneIconButton(params);
};

theme.closeButton = function (params) {
    params.text = LanguageModule.text("txt_close");
    return theme.noneIconButton(params);
};
 theme.saveButton = function(params){
     params.text = LanguageModule.text("txt_save");
     params.special = true;
     return theme.noneIconButton(params);
 };

 theme.saveCloseButton = function(params){
     params.text = LanguageModule.text("txt_save_and_close");
     return theme.noneIconButton(params);
 };

 theme.okButton = function(params){
     params.text = LanguageModule.text("txt_ok");
     return theme.noneIconButton(params);
 };

 theme.addButton = function(params){
     if (params.text === undefined) params.text = LanguageModule.text("txt_add");
     return theme.noneIconButton(params);
 };

 theme.deleteallButton = function(params){
     return theme.noneIconButton(params);
 };

 theme.copyButton = function(params){
     if (params.text === undefined) params.text = LanguageModule.text("txt_copy");
     return theme.noneIconButton(params);
 };

 theme.editButton = function(params){
     params.text = LanguageModule.text("txt_edit");
     return theme.noneIconButton(params);
 };

 theme.cancelButton = function(params){
     params.text = LanguageModule.text("txt_cancel");
     return theme.noneIconButton(params);
 };

 theme.moveButton = function(params){
     if (params.text === undefined) params.text = LanguageModule.text("txt_move");
     return theme.noneIconButton(params);
 };

 theme.printButton = function(params){
     params.text = LanguageModule.text("txt_print");
     return theme.noneIconButton(params);
 };

 theme.saveAddButton = function(params){
     params.text = LanguageModule.text("txt_save_and_add");
     return theme.noneIconButton(params);
 };

 theme.saveAsButton = function(params){
     params.text = LanguageModule.text("txt_save_as");
     return theme.noneIconButton(params);
 };

 theme.exportButton = function(params){
     params.text = LanguageModule.text("txt_export");
     return theme.noneIconButton(params);
 };

 theme.viewReportButton = function(params){
     params.text = LanguageModule.text("txt_view_report");
     return theme.noneIconButton(params);
 };
 ModuleManagerClass.register({
     name: "Button",
     prerequisites: ["ModalElement"]
 });
