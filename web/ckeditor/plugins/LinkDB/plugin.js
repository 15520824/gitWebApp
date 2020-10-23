CKEDITOR.plugins.add('LinkDB',
{
    hidpi: true,
    init: function (editor) {
        var pluginName = 'LinkDB';
        editor.ui.addButton('LinkDB',
            {
                label: 'Link direction page',
                command: 'comand_link_direction',
                icon: CKEDITOR.plugins.getPath('LinkDB') + 'icon.png'
            });
    }
});