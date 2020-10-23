CKEDITOR.plugins.add('Attach',
{
    hidpi: true,
    init: function (editor) {
        var pluginName = 'Attach';
        editor.ui.addButton('Attach',
            {
                label: 'Attach files',
                command: 'comand_attach_files',
                icon: CKEDITOR.plugins.getPath('Attach') + 'icon.png'
            });
    }
});