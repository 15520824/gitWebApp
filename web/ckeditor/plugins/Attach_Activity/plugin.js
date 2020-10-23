CKEDITOR.plugins.add('Attach_Activity',
{
    hidpi: true,
    init: function (editor) {
        var pluginName = 'Attach_Activity';
        var labelText = 'Attach files';
        if(typeof LanguageModule !== "undefined" && typeof LanguageModule.text("txt_activity") !== "undefined")
        labelText = LanguageModule.text("txt_activity")
        editor.ui.addButton('Attach_Activity',
            {
                label: labelText,
                command: 'comand_attach_activity',
                icon: CKEDITOR.plugins.getPath('Attach_Activity') + 'icon.png'
            });
    }
});