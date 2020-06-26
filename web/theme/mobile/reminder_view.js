
 theme.formReminderInit = function(params){
     var header = absol.buildDom({
         tag: 'mheaderbar',
         props: {
             actionIcon: DOMElement.i({
                 attrs: {
                     className: "material-icons"
                 },
                 text: "arrow_back_ios"
             }),
             title: LanguageModule.text("txt_activity")
         },
         on: {
             action: params.cmdbutton.close
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
    name: "Reminder_view",
    prerequisites: ["ModalElement"]
});
