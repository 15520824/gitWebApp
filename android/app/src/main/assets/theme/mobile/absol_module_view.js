"use strict";
/* global absol */
(function () {
    var _ = absol._;
    var $ = absol.$;

    var QuickMenu = absol.QuickMenu;
    function BoardManager() {
        this.$title = $('.cd-board-manager-title', this);
        this.$body = $('boardtable.cd-board-manager-body', this)
            .on('change', this.eventHandler.bodyChange);
        this.$plusBoard = _('plusboard').on('click', this.eventHandler.clickPlusBoard);
        this.$body.addChild(this.$plusBoard);
    }

    BoardManager.render = function () {
        return _({
            class: 'cd-board-manager',
            extendEvent: ['change', 'pressplusboard'],
            child: [{
                class: 'cd-board-manager-header',
                child: [{
                    tag: 'span',
                    class: 'cd-board-manager-title'
                }]
            },
            {
                tag: 'boardtable',
                class: 'cd-board-manager-body'
            }
            ]
        });
    };

    BoardManager.prototype.addBoard = function (boardElt) {
        this.$body.addChildBefore(boardElt, this.$plusBoard);
        return this;
    };

    BoardManager.prototype.removeBoard = function (boardElt) {
        this.$body.removeChild(boardElt);
        return this;
    };

    BoardManager.prototype.getAllBoards = function () {
        return this.$body.getAllBoards();
    };

    BoardManager.property = {};

    BoardManager.property.title = {
        set: function (value) {
            this.$title.clearChild().addChild(_({ text: value + '' }));
        },
        get: function () {
            return this.$title.childNodes[0].data;
        }
    };

    BoardManager.property.hasPlusBoard = {
        set: function () {
            this.addClass('cd-board-manager-has-plus-board');
        },
        get: function () {
            return this.containsClass('cd-board-manager-has-plus-board');
        }
    };

    BoardManager.eventHandler = {};

    BoardManager.eventHandler.clickPlusBoard = function () {
        this.emit('pressplusboard', { name: 'pressplusboard', target: this }, this)
    };

    BoardManager.eventHandler.bodyChange = function (event) {
        this.emit('change', Object.assign({}, event, { target: this, name: "change" }), this);
    };

    absol.coreDom.install('BoardManager'.toLowerCase(), BoardManager);



    function RepresentativeBoard() {
        this._status = [];
        this.$body = $('.cd-representative-board-body', this);
        this.$priority = $('.cd-representative-board-flat-priority', this);
        this._priority = -1;
        this.$name = $('.cd-representative-board-name', this);
        this.$contextBtn = $('.cd-representative-board-context-btn-ctn button', this);
        //default
        this._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: [
                    {
                        text: 'Sửa',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "mode_edit" }
                        }
                    },
                    {
                        text: 'Xóa',
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "delete" }
                        }
                    }
                ]
            }
        };
        var thisRB = this;
        this.quickmenuAdapter = {
            getMenuProps: function () {
                return thisRB._quickmenu.props
            },
            onSelect: function () {
                if (typeof thisRB._quickmenu.onSelect == 'function')
                    thisRB._quickmenu.onSelect.apply(this, arguments);
            }
        };
        QuickMenu.toggleWhenClick(this.$contextBtn, this.quickmenuAdapter);
    }

    RepresentativeBoard.render = function () {
        return _({
            tag: 'board',
            class: 'cd-representative-board',
            child: [
                {
                    class: ['cd-representative-board-header', 'as-board-drag-zone'],
                    child: [
                        {
                            class: 'cd-representative-board-header-icon',
                            child: 'span.mdi.mdi-cursor-move'
                        },
                        {
                            class: 'cd-representative-board-flat-ctn',
                            child: [
                                'span.cd-representative-board-flat.mdi.mdi-pin',
                                'span.cd-representative-board-flat.mdi.mdi-alert-circle',
                                // 'span.cd-representative-board-flat.mdi.mdi-flag',
                                'span.cd-representative-board-flat.mdi.mdi-clock-alert-outline',
                                'span.cd-representative-board-flat.mdi.mdi-phone',
                                'span.cd-representative-board-flat.mdi.mdi-account-multiple',
                                'span.cd-representative-board-flat.mdi.cd-representative-board-flat-priority',
                            ]
                        },
                        {
                            class: 'cd-representative-board-context-btn-ctn',
                            child: {
                                tag: 'button',
                                class: 'cd-transparent-btn',
                                child: 'span.mdi.mdi-dots-horizontal'
                            }
                        }
                    ]
                },
                {
                    class: 'cd-representative-board-body',
                    child: [
                        {
                            class: 'cd-representative-board-name',
                            child: { text: '' }
                        }
                    ]
                }
            ]
        }, true);
    };

    ['addChild', 'findChildBefore', 'findChildAfter', 'removeChild', 'clearChild', 'addChildBefore', 'addChildAfter'].forEach(function (name) {
        RepresentativeBoard.prototype[name] = function () {
            this.$body[name].apply(this.$body, arguments);
        }
    });


    RepresentativeBoard.property = {};

    RepresentativeBoard.property.status = {
        set: function (value) {
            var i;
            for (i = 0; i < this._status.length; ++i)
                this.removeClass('cd-object-status-' + this._status[i]);
            value = value || [];
            if (typeof value == 'string')
                value = value.split(/\s+/);
            this._status = value;
            for (i = 0; i < this._status.length; ++i) {
                this.addClass('cd-status-' + this._status[i]);
            }
        },
        get: function () {
            return this._status;
        }
    }

    RepresentativeBoard.property.priority = {
        set: function (value) {
            var className;
            if (this._priority >= 0) {
                className = this._priority < 10 ? 'mdi-numeric-' + this._priority + '-box' : 'mdi-numeric-9-plus-box';
                this.$priority.removeClass(className);
            }

            this._priority = value;
            if (this._priority >= 0) {
                className = this._priority < 10 ? 'mdi-numeric-' + this._priority + '-box' : 'mdi-numeric-9-plus-box';
                this.$priority.addClass(className);
                this.addClass('cd-status-priority');
            }
            else {
                this.removeClass('cd-status-priority');
            }
        },
        get: function () {
            return this._priority;
        }
    };

    RepresentativeBoard.property.name = {
        set: function (value) {
            this.$name.childNodes[0].data = value + '';
        },
        get: function () {
            return this.$name.childNodes[0].data;
        }
    };

    RepresentativeBoard.property.quickmenu = {
        set: function (value) {
            this._quickmenu = value;
        },
        get: function () {
            return this._quickmenu;
        }
    }

    absol.coreDom.install('representativeboard', RepresentativeBoard);


})();

"use strict";
/* global absol */
(function () {
    var _ = absol._;
    var $ = absol.$;
    var QuickMenu = absol.QuickMenu;
    function PlusBoard() {
        absol.QuickMenu.toggleWhenClick

    }

    PlusBoard.render = function () {
        return _({
            class: 'cd-board-plus',
            child: 'span.mdi.mdi-plus'
        });
    };

    absol.coreDom.install('plusboard', PlusBoard);


    function ListBoard() {
        var thisLB = this;

        this.$title = $('.cd-list-board-title', this);
        this.$contextBtn = $('.cd-list-board-context-btn', this);
        this.$plusCard = $('.cd-list-board-plus-card', this)
            .on('click', this.eventHandler.clickAddBoard);

        this.$body = $('.cd-list-board-body', this)
            .on({
                itemleave: this.eventHandler.itemleaveBody,
                itementer: this.eventHandler.itementerBody,
                dragitemstart: this.eventHandler.bodyDragItemStart,
                dragitemend: this.eventHandler.bodyDragItemEnd
            });

        //default
        this._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: [
                    {
                        text: 'Sửa',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "mode_edit" }
                        }
                    },
                    {
                        text: 'Di chuyển',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "open_with" }
                        }
                    },
                    {
                        text: 'Xóa',
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "delete" }
                        }
                    },
                    {
                        text: 'Màu',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "palette" }
                        }
                    },
                    {
                        text: 'Lưu trữ',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "turned_in_not" }
                        }
                    }
                ]
            }
        };
        var thisLB = this;
        this.quickmenuAdapter = {
            getMenuProps: function () {
                return thisLB._quickmenu.props
            },
            onSelect: function () {
                if (typeof thisLB._quickmenu.onSelect == 'function')
                    thisLB._quickmenu.onSelect.apply(this, arguments);
            }
        };
        QuickMenu.toggleWhenClick(this.$contextBtn, this.quickmenuAdapter);
    };


    ListBoard.render = function () {
        return _({
            tag: 'board',
            extendEvent: ['presspluscard', 'orderchange', 'cardenter', 'cardleave', 'dragcardend', 'dragcardstart'],
            class: ['cd-list-board', 'as-board-table-effect-zone'],
            child: [{
                class: ['cd-list-board-header', 'as-board-drag-zone'],
                child: [
                    {
                        tag: 'span',
                        class: 'cd-list-board-title',
                        child: [
                            {
                                text: ''
                            }
                        ]
                    },
                    {
                        class: 'cd-list-board-context-btn-ctn',
                        child: [
                            {
                                tag: 'button',
                                class: ['cd-list-board-context-btn', 'cd-transparent-btn'],
                                child: 'span.mdi.mdi-dots-horizontal'
                            }
                        ]
                    }
                ]
            },
            {
                class: 'cd-list-board-plus-card-ctn',
                child: {
                    class: 'cd-list-board-plus-card',
                    child: {//todo: language
                        text: '+ THÊM CARD'
                    }
                }
            },
            {
                tag: 'boardtable',
                class: 'cd-list-board-body',
                props: {
                    friends: 'boardtable.cd-list-board-body'
                }
            }
            ]
        });
    };

    ListBoard.prototype.addCard = function (cardElt) {
        this.$body.addChild(cardElt);
    };

    ListBoard.property = {};

    ListBoard.property.title = {
        set: function (value) {
            this.$title.clearChild().addChild(_({ text: value + '' }));
        },
        get: function () {
            return this.$title.childNodes[0].data;
        }
    }

    ListBoard.eventHandler = {};

    ListBoard.eventHandler.clickAddBoard = function (event) {
        this.emit('presspluscard', Object.assign({}, event, { type: 'presspluscard', target: this }), this);
    };

    ListBoard.eventHandler.itementerBody = function (event) {
        this.emit('cardenter', Object.assign({}, event, { type: 'presspluscard', target: this }), this);
    };

    ListBoard.eventHandler.itemleaveBody = function (event) {
        this.emit('cardleave', Object.assign({}, event, { type: 'presspluscard', target: this }), this);
    };

    ListBoard.eventHandler.bodyDragItemStart = function (event) {
        this.emit('dragcardstart', Object.assign({}, event, { type: 'dragcardstart', target: this }), this);
    };

    ListBoard.eventHandler.bodyDragItemEnd = function () {
        this.emit('dragcardend', Object.assign({}, event, { type: 'dragcardend', target: this }), this);
    };

    absol.coreDom.install('listboard', ListBoard);




    function TaskCard() {
        this._status = [];
        this._priority = -1;
        this.$title = $('.cd-task-card-title', this);
        this.$body = $('.cd-task-card-body', this);

        this.$contextBtn = $('.cd-task-card-context-btn', this);

        //default
        this._quickmenu = {
            props: {
                extendClasses: 'cd-context-menu',
                items: [
                    {
                        text: 'Trạng thái',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "info" }
                        }
                    },
                    {
                        text: 'Di chuyển',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "open_with" }
                        }
                    },
                    {
                        text: 'Sửa',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "mode_edit" }
                        }
                    },
                    {
                        text: 'Xóa',
                        extendClasses: "bsc-quickmenu red",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "delete" }
                        }
                    },
                    {
                        text: 'Lưu trữ',
                        extendClasses: "bsc-quickmenu",
                        icon: {
                            tag: "i",
                            class: "material-icons",
                            child: { text: "turned_in_not" }
                        }
                    }
                ]
            }
        };
        var thisLB = this;
        this.quickmenuAdapter = {
            getMenuProps: function () {
                return thisLB._quickmenu.props
            },
            onSelect: function () {
                if (typeof thisLB._quickmenu.onSelect == 'function')
                    thisLB._quickmenu.onSelect.apply(this, arguments);
            }
        };
        QuickMenu.toggleWhenClick(this.$contextBtn, this.quickmenuAdapter);
    }


    TaskCard.render = function () {
        return _({
            tag: 'board',
            class: ['cd-task-card'],
            child: [
                {
                    class: ['cd-task-card-header', 'as-board-drag-zone'],
                    child: [
                        {
                            class: 'cd-task-card-header-icon',
                            child: 'span.mdi.mdi-cursor-move'
                        },

                        {
                            class: 'cd-task-card-flat-ctn',
                            child: [
                                'span.cd-task-card-flat.mdi.mdi-pin',
                                'span.cd-task-card-flat.mdi.mdi-alert-circle',
                                // 'span.cd-task-card-flat.mdi.mdi-flag',
                                'span.cd-task-card-flat.mdi.mdi-clock-alert-outline',
                                'span.cd-task-card-flat.mdi.mdi-phone',
                                'span.cd-task-card-flat.mdi.mdi-account-multiple',
                                'span.cd-task-card-flat.mdi.cd-task-card-flat-priority',
                            ]
                        },
                        {
                            class: 'cd-task-card-context-btn-ctn',
                            child: [{
                                tag: 'button',
                                class: ['cd-task-card-context-btn', 'cd-transparent-btn'],
                                child: 'span.mdi.mdi-dots-horizontal'
                            }]
                        }
                    ]
                },
                {
                    class: 'cd-task-card-body',
                    child: {
                        tag: 'div',
                        class: 'cd-task-card-title',
                        child: [
                            {
                                text: ''
                            }
                        ]
                    },
                }
            ]
        });
    };

    ['addChild', 'findChildBefore', 'findChildAfter', 'removeChild', 'clearChild', 'addChildBefore', 'addChildAfter'].forEach(function (name) {
        TaskCard.prototype[name] = function () {
            this.$body[name].apply(this.$body, arguments);
        }
    });

    TaskCard.property = {};

    TaskCard.property.title = {
        set: function (value) {
            this.$title.clearChild().addChild(_({ text: value + '' }));
        },
        get: function () {
            return this.$title.childNodes[0].data;
        }
    };

    TaskCard.property.status = {
        set: function (value) {
            var i;
            for (i = 0; i < this._status.length; ++i)
                this.removeClass('cd-object-status-' + this._status[i]);
            value = value || [];
            if (typeof value == 'string')
                value = value.split(/\s+/);
            this._status = value;
            for (i = 0; i < this._status.length; ++i) {
                this.addClass('cd-status-' + this._status[i]);
            }
        },
        get: function () {
            return this._status;
        }
    }

    TaskCard.property.priority = {
        set: function (value) {
            var className;
            if (this._priority >= 0) {
                className = this._priority < 10 ? 'mdi-numeric-' + this._priority + '-box' : 'mdi-numeric-9-plus-box';
                this.$priority.removeClass(className);
            }

            this._priority = value;
            if (this._priority >= 0) {
                className = this._priority < 10 ? 'mdi-numeric-' + this._priority + '-box' : 'mdi-numeric-9-plus-box';
                this.$priority.addClass(className);
                this.addClass('cd-status-priority');
            }
            else {
                this.removeClass('cd-status-priority');
            }
        },
        get: function () {
            return this._priority;
        }
    };

    absol.coreDom.install('taskcard', TaskCard);

})();
 //# sourceURL=card://js/TaskBoardList.js
if (ModuleManagerClass)
    ModuleManagerClass.register("AbsolModuleView");