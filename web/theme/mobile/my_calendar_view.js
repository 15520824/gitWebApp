"use strict";

/***
 *
 * @param {{adapter: WorkCalendarAdapter, cmdbutton: Object}} params
 * @return {TabFrame}
 */
theme.formMy_calendarInit = function(params) {
    var closeBtn = DOMElement.div({
        attrs: {
            className: "single-button-header"
        },
        children: [theme.closeButton({
            onclick: params.cmdbutton.close
        })]
    });
    //Không dùng singlepage nữa, vì header cứng, và dùng có thể gây lỗi không cần thiết
    var workCalendar = new absol.WorkCalendar({
        adapter: params.adapter,
        firstDayOfWeek: 1,// todo
    });
    var page = absol.buildDom({
        tag: "tabframe",
        class: 'cd-work-calendar-page',
        child: [
            workCalendar.getView()
        ]
    });
    // chỉ có 1 đối tượng duy nhất, là lịch, không có data_container
    return page;
};

ModuleManagerClass.register({
    name: "My_calendar_view",
    prerequisites: ["ModalElement"]
});

//# sourceURL=card:///src/theme/desktop/my_calendar_view.js?