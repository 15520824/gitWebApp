//đưa tập lệnh ra ngoài cho dễ quản lý, con trỏ this trong cmd chính là host
carddone.my_calendar.cmd = {};

/**
 * chọn lịch để hiển thị
 * @param {String} name enum("MONTH", "WEEK")
 */
carddone.my_calendar.cmd.viewCalendar = function(name) {
    switch (name) {
        case "MONTH":
            this.monthFrame.requestActive();
            break;
        case "WEEK":
            this.weekFrame.requestActive();
            break;
    }
};

carddone.my_calendar.getUserNameList = function(host){
    console.log(
        host
    );
};

carddone.my_calendar.redraw = function(host) {
    var _ = absol._;
    var $ = absol._;
    var dataCtn = host.data_container;
    carddone.my_calendar.getUserNameList(host)
    if (!host.weekFrame) {
        host.weekFrame = _({
            tag: 'frame',
            style: {
                // backgroundColor: 'rgb(255, 220, 220)'
            },
            child: {
                tag: 'weektable',
                style: {
                    width: '100%',
                    height: 'calc(100% - 5px)' // fix sau
                }
            }
        });
        dataCtn.addChild(host.weekFrame);
        host.weekTable = $('weektable', host.weekFrame);

    }
    if (!host.monthFrame) {
        host.monthFrame = _({
            tag: 'frame',
            style: {
                // backgroundColor: 'rgb(222, 255, 220)'
            },
            child: [{
                tag: 'monthtable',
                style: {
                    width: '100%',
                    height: 'calc(100% - 5px)'
                }
            }]
        });
        dataCtn.addChild(host.monthFrame);
        host.monthTable = $('monthtable', host.weekFrame);
    }

    host.monthFrame.requestActive();
};

carddone.my_calendar.init = function(host) {
    var cmdbutton = {
        close: function() {
            if (carddone.isMobile){
                host.holder.selfRemove();
                carddone.menu.loadPage(100);
            }
            else {
                carddone.menu.tabPanel.removeTab(host.holder.id);
            }
        }
    };

    host.data_container = absol.buildDom('frameview'); //có nhiều lớp lịch và chạy theo header
    host.holder.addChild(host.frameList);
    var singlePage = host.funcs.formMy_calendarInit({
        cmdbutton: cmdbutton,
        data_container: host.data_container,
        funcs: absol.OOP.bindFunctions(host, carddone.my_calendar.cmd) // truyền toàn bộ tập lệnh, các lệnh này nhận this chính là host,
            //do vậy không cần truyền host đi, mọi giao tiếp đều thực hiên qua cmd
    });
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
    carddone.my_calendar.redraw(host);
};


ModuleManagerClass.register({
    name: "My_calendar",
    prerequisites: ["ModalElement", "FormClass"]
});
