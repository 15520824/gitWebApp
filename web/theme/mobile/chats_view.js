function UnreadMessageLine() {
    this.$text = absol.$('.chat-unreadmessage-line-text', this);
    this.$leftLine = absol.$('.chat-unreadmessage-line-left', this);
    this.$rightLine = absol.$('.chat-unreadmessage-line-right', this);

    this.$attachhook = absol._('attachhook').addTo(this)
        .on('error', this.updateSize.bind(this));
};

UnreadMessageLine.render = function () {
    return absol._({
        class: 'chat-unreadmessage-line',
        child: [
            {
                tag: 'span',
                class: 'chat-unreadmessage-line-text',
                child: { text: 'Unread messages' }
            },
            '.chat-unreadmessage-line-left',
            '.chat-unreadmessage-line-right'
        ]
    });
};

UnreadMessageLine.prototype.updateSize = function () {
    var textBound = this.$text.getBoundingClientRect();
    this.$leftLine.addStyle('right', 'calc(50% + ' + (textBound.width / 2 + 10) + 'px)');
    this.$rightLine.addStyle('left', 'calc(50% + ' + (textBound.width / 2 + 10) + 'px)');
};

UnreadMessageLine.property = {};

UnreadMessageLine.property.text = {
    set: function(value){
        this._text = value + '';
        this.$text.clearChild().addChild(absol._({text: value}));
    },
    get: function(){
        return this._text;
    }
};

absol.coreDom.install('unreadmessageline',UnreadMessageLine);

theme.MesssageItem = function MesssageItem(){
    this.$avatar = absol.$('.chat-message-item-avatar', this);
    this.$name = absol.$('.chat-message-item-name', this);
    this.$company_contactName = absol.$('.chat-message-item-company-contact', this);
    this.$time = absol.$('.chat-message-item-time', this);
    this.$messagetext = absol.$('.chat-message-item-message-text', this);
    this.$new_noseen = absol.$('.chat-message-item-new-noseen', this);
    this.$cmd_menu = absol.$('.chat-message-item-cmd-menu', this);
    this.on('click', this.eventHandler.click);//gắn hàm xử ló sự kiện vào bản thân nó
};

theme.MesssageItem.render = function(){
    return absol._({
        extendEvent: ['pressopen'],
        class: 'chat-message-item',
        child:[
            {
                class: 'chat-message-item-avatar'
            },
            {
                class:'chat-message-item-content-ctn',
                child:[
                    {
                        class:'chat-message-item-title',
                        child:[
                            {
                                class:'chat-message-item-name'
                            },
                            {
                                class:'chat-message-item-time'
                            }
                        ]
                    },
                    {
                        class:'chat-message-item-company-contact'
                    },
                    {
                    class:'chat-message-item-message',
                    child:[
                        {
                            class:'chat-message-item-message-text'
                        },
                        {
                            class:'chat-message-item-cmd',
                            child: [
                                {
                                    class:'chat-message-item-new-noseen'
                                },
                                {
                                    class:'chat-message-item-cmd-menu'
                                }
                            ]
                        }
                    ]
                    }
                ]
            }
        ]
    });
};

theme.MesssageItem.property = {};

theme.MesssageItem.property.avatarSrc = {
    set: function (value) {
        this.$avatar.style.backgroundImage = "url(" + value + ")";
    },
    get: function () {
        return this.$avatar.src;
    }
};

theme.MesssageItem.property.name = {
    set: function(value){
        this._name = value + '';
        this.$name.clearChild().addChild(absol._({text: value}));
    },
    get: function(){
        return this._name;
    }
};

theme.MesssageItem.property.quickMenuItems = {
    set: function(value){
        this._cmd_menu = value;
        if (value.length > 0){
            var qmenuButton = DOMElement.div({
                attrs: {
                    className: "card-icon-edit-message-cover"
                },
                children: [DOMElement.i({
                    attrs: {
                        className: "material-icons card-icon-hover-chat"
                    },
                    text: "more_horiz"
                })]
            });
            absol.QuickMenu.showWhenClick(qmenuButton, {items: value}, "auto", function (menuItem) {
                if (menuItem.cmd) menuItem.cmd();
            });
            this.$cmd_menu.clearChild().addChild(qmenuButton);
        }
    },
    get: function(){
        return this._cmd_menu;
    }
};

theme.MesssageItem.property.company_contactName = {
    set: function(value){
        this._company_contactName = value + '';
        this.$company_contactName.clearChild().addChild(absol._({text: value}));
    },
    get: function(){
        return this._company_contactName;
    }
};

theme.MesssageItem.property.time = {
    set: function (value) {
        this._time = value + '';
        this.$time.clearChild().addChild(absol._({ text: value }));
    },
    get: function () {
        return this._time;
    }
};

theme.MesssageItem.property.messagetext = {
    set: function(value){
        this._messagetext = value + '';
        this.$messagetext.clearChild().addChild(absol._({text: value}));
    },
    get: function(){
        return this._messagetext;
    }
};

theme.MesssageItem.property.new_noseen = {
    set: function (value) {
        this._new_noseen = value;
        if (value > 0) {
            if (value > 99) value = "9+";
            var elt = absol.buildDom({
                class: "chat-button-number",
                child: [absol._({ text: value })]
            });
            this.$new_noseen.clearChild().addChild(elt);
        }
        else {
            this.$new_noseen.clearChild();
        }
    },
    get: function () {
        return this._new_noseen;
    }
};

absol.coreDom.install('messageitem', theme.MesssageItem);


theme.MesssageItem.eventHandler = {};

theme.MesssageItem.eventHandler.click = function (event) {
    if (!absol.EventEmitter.hitElement(this.$cmd_menu, event)) {//không phải click vào cmd
        this.emit('pressopen', { target: this, type: 'pressopen' }, this);
    }
};


theme.ChatBar = function (params) {
    this.data = params.data;
    this.openChat = params.openChat;
    this.sessionActive = params.sessionActive;
    this.frameList = params.frameList;
    this.usersList = params.usersList;
};

theme.ChatBox = function (params) {
    this.messageitem = params.messageitem;
    this.chatBar = params.chatBar;
    this._messageitemhidden = params._messageitemhidden;
    this.data = params.data;
    this.id = params.data.id;
    this.content = params.data.content;
    this.name = params.data.name;
    this.sendFunc = params.data.sendFunc;
    this.mess_seen_id = params.data.mess_seen_id;
    this.seenFunc = params.data.seenFunc;
    this.loadOldMessFunc = params.data.loadOldMessFunc;
    this.editMessageFunc = params.data.editMessageFunc;
    this.deleteMessageFunc = params.data.deleteMessageFunc;
    this.frameList = params.frameList;
};

theme.ChatBox.prototype.toggleGallery = function () {
    if (this.chats_galery.style.display == "inline-block") {
        this.chats_galery.style.display = "none";
        this.icon_gallery.style.color = "#929292";
        this.chatBodyContent.style.width = "100%";
    }
    else {
        this.chats_galery.style.display = "inline-block";
        this.icon_gallery.style.color = "#0068ff";
        this.chatBodyContent.style.width = "calc(100% - var(--chat-mobile-gallery))";
    }
};

theme.ChatBox.prototype.galleryHeader = function () {
    return DOMElement.div({
        attrs: { className: "chats-theme-mobile-information-name-container" },
        children: [
            DOMElement.span({
                attrs: {
                    className: "chats-theme-mobile-gallery-title"
                },
                text: LanguageModule.text("txt_gallery")
            })
        ]
    });
};

theme.ChatBox.prototype.nameChat = function () {
    var self = this;
    this.icon_gallery = DOMElement.i({
        attrs: {
            className: "material-icons bsc-icon-hover-blue",
            style: {
                verticalAlign: "middle"
            },
            onclick: function () {
                this.toggleGallery();
            }.bind(this)
        },
        text: "burst_mode"
    });
    this.nameChat = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: this.name
        },
        on: {
            action: function () {
                self.frameList.getAllChild()[0].requestActive();
                carddone.sessionIdActive = 0;
                carddone.menu.showMobileTabbar(true);
                window.backLayoutFunc = [];
            }
        }
    });
    return this.nameChat;
};

theme.ChatBox.prototype.createMessage = function (data) {
    var self = this;
    var className, classNameImg;
    if (data.type == "me") {
        className = "card-chatbox-message-me";
        classNameImg = "card-chatbox-message-me-img";
    }
    else {
        className = "card-chatbox-message-other";
        classNameImg = "card-chatbox-message-other-img";
    }
    var res, messelt;
    switch (data.content_type) {
        case "text":
            var texts;
            var aobjs = absol.parseMessage(data.content);// trả về một array theo cú pháp absol
            // thêm vài thuộc tính cho thẻ a
            aobjs.forEach(function (aobj) {
                if (aobj.tag == 'a') {
                    aobj.attr = aobj.attr || {};
                    aobj.attr.target = '_blank';// mở tab mới
                    aobj.style = aobj.style || {};
                    aobj.style.cursor = "pointer";
                    aobj.style.textDecoration = "underline";
                }
            });

            texts = aobjs.map(function (aobj) {
                return absol._(aobj);// chuyển qua dom object cho giống code cũ
            })


            res = DOMElement.div({
                attrs: {
                    className: "card-chatbox-message-line"
                }
            });
            if (data.loading !== undefined){
                res.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-icon-edit-message-cover"
                    },
                    children: [DOMElement.img({
                        attrs: {
                            className: "material-icons card-icon-loading-message",
                            src: "./loading.gif"
                        }
                    })]
                }));
            }
            if (data.type == "me" && data.isEdit !== undefined) {
                res.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-icon-edit-message-cover"
                    },
                    children: [DOMElement.i({
                        attrs: {
                            className: "material-icons card-icon-edit-message"
                        },
                        text: "create"
                    })]
                }));
            }
            messelt = DOMElement.div({
                attrs: {
                    className: className
                },
                children: texts
            });
            res.appendChild(messelt);
            if (data.type == "other" && data.isEdit !== undefined) {
                res.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-icon-edit-message-cover"
                    },
                    children: [DOMElement.i({
                        attrs: {
                            className: "material-icons card-icon-edit-message"
                        },
                        text: "create"
                    })]
                }));
            }
            break;
        case "img":
            var srcimg = window.domain + "uploads/images/" + data.localid + "_" + data.content + ".upload";
            if (data.loading !== undefined){
                srcimg = URL.createObjectURL(data.object)
            }
            messelt = DOMElement.div({
                attrs: {
                    className: classNameImg
                },
                children: [DOMElement.img({
                    attrs: {
                        style: {
                            maxHeight: "100%",
                            maxWidth: "100%"
                        },
                        src: srcimg,
                        download: data.content,
                        onclick: function (id) {
                            return function (event, me) {
                                document.body.appendChild(descViewImagePreview(self.dataImageList, id));
                                // console.log(self.dataImageList, id);
                            }
                        }(data.localid)
                    }
                })]
            });
            res = DOMElement.div({
                attrs: {
                    className: "card-chatbox-message-line"
                }
            });
            if (data.loading !== undefined){
                res.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-icon-edit-message-cover"
                    },
                    children: [DOMElement.img({
                        attrs: {
                            className: "material-icons card-icon-loading-message",
                            src: "./loading.gif"
                        }
                    })]
                }));
            }
            res.appendChild(messelt);
            self.dataImageList.unshift({
                id: data.localid,
                avatar: data.avatarSrc,
                userName: data.fullname,
                src: srcimg,
                date: data.m_time,
                note: ""
            });
            break;
        case "file":
            messelt = DOMElement.div({
                attrs: {
                    className: className
                },
                children: [
                    DOMElement.a({
                        attrs: {
                            href: window.domain + "uploads/files/" + data.localid + "_" + data.content + ".upload",
                            download: data.content,
                            style: {
                                color: "black",
                                cursor: "pointer"
                            }
                        },
                        text: data.content
                    })
                ]
            });
            res = DOMElement.div({
                attrs: {
                    className: "card-chatbox-message-line"
                }
            });
            if (data.loading !== undefined){
                res.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-icon-edit-message-cover"
                    },
                    children: [DOMElement.img({
                        attrs: {
                            className: "material-icons card-icon-loading-message",
                            src: "./loading.gif"
                        }
                    })]
                }));
            }
            res.appendChild(messelt);
            break;
        case "add_member":
            var listMemberText = "";
            var userIndex;
            for (var i = 0; i < data.content.length; i++){
                userIndex = self.chatBar.usersList.getIndex(data.content[i]);
                if (i > 0) listMemberText += ", ";
                listMemberText += self.chatBar.usersList[userIndex].fullname;
            }
            res = absol.buildDom({
                class: "card-chatbox-line-seen",
                child: [absol.buildDom({
                    tag: "unreadmessageline",
                    props: {
                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã thêm " + listMemberText
                    }
                })]
            });
            break;
        case "create":
            res = absol.buildDom({
                class: "card-chatbox-line-seen",
                child: [absol.buildDom({
                    tag: "unreadmessageline",
                    props: {
                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tạo nhóm."
                    }
                })]
            });
            break;
        case "join":
            res = absol.buildDom({
                class: "card-chatbox-line-seen",
                child: [absol.buildDom({
                    tag: "unreadmessageline",
                    props: {
                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã tham gia nhóm."
                    }
                })]
            });
            break;
        case "remove_member":
            var userIndex = self.chatBar.usersList.getIndex(data.content);
            res = absol.buildDom({
                class: "card-chatbox-line-seen",
                child: [absol.buildDom({
                    tag: "unreadmessageline",
                    props: {
                        text: contentModule.getTimeMessage(data.m_time) + ", " + data.fullname + " đã xóa " + self.chatBar.usersList[userIndex].fullname + " khỏi cuộc trò chuyện."
                    }
                })]
            });
            break;
        case "leave_group":
            var userIndex = self.chatBar.usersList.getIndex(data.content.leave);
            if (userIndex < 0) {
                res = DOMElement.div({});
                break;
            }
            var messText = contentModule.getTimeMessage(data.m_time) + ", " + self.chatBar.usersList[userIndex].fullname + " đã rời khỏi cuộc trò chuyện";
            if (data.content.admin > 0){
                userIndex = self.chatBar.usersList.getIndex(data.content.admin);
                if (userIndex >= 0) {
                    messText += ", và " + self.chatBar.usersList[userIndex].fullname + " đã được chọn làm trưởng nhóm."
                }
            }
            res = absol.buildDom({
                class: "card-chatbox-line-seen",
                child: [absol.buildDom({
                    tag: "unreadmessageline",
                    props: {
                        text: messText
                    }
                })]
            });
            break;
        default:
            res = DOMElement.div({});
            break;
    }
    var quickMenuItems = [];
    if (data.content_type == "file" || data.content_type == "text" || data.content_type == "img"){
        if (data.content_type == "text" && data.type == "me") {
            quickMenuItems.push({
                text: LanguageModule.text("txt_edit"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "mode_edit" }
                },
                cmd: function (data, elt) {
                    return function (event, me) {
                        self.editMessage(data.localid, data.content, elt);
                    }
                }(data, res)
            });
        }
        if (data.content_type == "text") {
            quickMenuItems.push({
                text: LanguageModule.text("txt_copy"),
                extendClasses: "bsc-quickmenu",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "file_copy" }
                },
                cmd: function (data) {
                    return function (event, me) {
                        contentModule.copyToClipboard(data.content);
                    }
                }(data)
            });
        }
        if (data.type == "me") {
            quickMenuItems.push({
                text: LanguageModule.text("txt_delete"),
                extendClasses: "bsc-quickmenu red",
                icon: {
                    tag: "i",
                    class: "material-icons",
                    child: { text: "delete" }
                },
                cmd: function (data) {
                    return function (event, me) {
                        self.deleteMessageConfirm(data.localid);
                    }
                }(data)
            });
        }
    }
    if (quickMenuItems.length > 0) {
        var messElt = res;
        var qmenuButton = DOMElement.div({
            attrs: {
                style: {
                    verticalAlign: "middle",
                    display: "inline-block",
                    visibility: "hidden",
                    height: "30px",
                    width: "30px",
                    padding: "5px"
                }
            },
            children: [DOMElement.i({
                attrs: {
                    className: "material-icons card-icon-hover-chat"
                },
                text: "more_horiz"
            })]
        });
        absol.QuickMenu.showWhenClick(qmenuButton, {items: quickMenuItems}, "auto", function (menuItem) {
            if (menuItem.cmd) menuItem.cmd();
        });
        if (data.type == "me"){
            res = DOMElement.div({
                attrs: {
                    style: {
                        whiteSpace: "nowrap"
                    }
                },
                children: [
                    qmenuButton,
                    DOMElement.div({
                        attrs: {
                            style: {
                                verticalAlign: "middle",
                                display: "inline-block"
                            }
                        },
                        children: [messElt]
                    })
                ]
            });
        }
        else {
            res = DOMElement.div({
                attrs: {
                    style: {
                        whiteSpace: "nowrap"
                    }
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            style: {
                                verticalAlign: "middle",
                                display: "inline-block"
                            }
                        },
                        children: [messElt]
                    }),
                    qmenuButton
                ]
            });
        }
        messElt.onclick = function(){
            if (qmenuButton.style.visibility == "visible"){
                qmenuButton.style.visibility = "hidden";
            }
            else {
                if (self.quickIconLast !== undefined){
                    self.quickIconLast.style.visibility = "hidden";
                }
                qmenuButton.style.visibility = "visible";
            }
            self.quickIconLast = qmenuButton;
        };
    }
    return res;
};

theme.ChatBox.prototype.editMessage = function (localid, content, elt) {
    var self = this;
    self.vMediaInput.text = content;
    self.vMediaInput.mode = "edit";
    self.vMediaInput.focus();
    self.localidEdit = localid;
};

theme.ChatBox.prototype.deleteMessageRedraw = function (localid) {
    var self = this;
    var elt, type;
    for (var i = 0; i < self.listMessLocalid.length; i++) {
        if (self.listMessLocalid[i].localid == localid) {
            elt = self.listMessLocalid[i].elt;
            type = self.listMessLocalid[i].type;
            if (i == self.listMessLocalid.length - 1){
                self.lastUserid = self.listMessLocalid[self.listMessLocalid.length - 2].userid;
                self.lastMessTime = self.listMessLocalid[self.listMessLocalid.length - 2].m_time;
            }
            self.listMessLocalid.splice(i, 1);
        }
    }
    if (elt !== undefined) {
        if (type == "other"){
            if (elt.parentNode.childNodes.length == 2) {
                elt.parentNode.parentNode.parentNode.remove();
                return;
            }
        }
        else {
            if (elt.parentNode.childNodes.length == 2) {
                elt.parentNode.remove();
                return;
            }
        }
        elt.remove();
    }
};

theme.ChatBox.prototype.deleteMessage = function (localid) {
    var self = this;
    self.deleteMessageFunc(localid).then(function (values) {
        self.deleteMessageRedraw(localid);
        for (var i = 0; i < self.chatBar.listChatView.length; i++) {
            if (self.chatBar.listChatView[i].name == self.id) {
                if (self.chatBar.listChatView[i].lastLocalid == localid) {
                    if (values == "")  self.chatBar.listChatView[i].elt.messagetext = "";
                    else {
                        self.chatBar.listChatView[i].elt.messagetext = self.getMessageText(values);
                        self.chatBar.listChatView[i].lastLocalid = values.localid;
                    }
                }
                break;
            }
        }
        self.vMediaInput.mode = "new";
        self.vMediaInput.focus();
    });
};

theme.ChatBox.prototype.deleteMessageConfirm = function (localid) {
    var self = this;
    ModalElement.question({
        title: LanguageModule.text("war_title_detele_message"),
        message: LanguageModule.text("war_txt_detele_message"),
        onclick: function (sel) {
            if (sel == 0) {
                self.deleteMessage(localid);
            }
        }
    });
};

theme.ChatBox.prototype.updateMessage = function(content){
    var self = this;
    var messEltCmd;
    for (var i = self.listMessLocalid.length -1; i >= 0; i--){
        if (self.listMessLocalid[i].localid == content.localid){
            messEltCmd = absol.$('.card-icon-loading-message', self.listMessLocalid[i].elt).parentNode;
            DOMElement.removeAllChildren(messEltCmd);
            if (content.failed){
                messEltCmd.appendChild(DOMElement.i({
                    attrs: {
                        className: "material-icons card-icon-failed-message"
                    },
                    text: "error_outline"
                }));
            }
            else if (content.content_type == "img"){
                messEltCmd = absol.$('.card-chatbox-message-me-img', self.listMessLocalid[i].elt).firstChild;
                messEltCmd.src = "./uploads/images/" + content.localid + "_" + content.content + ".upload";
            }
            break;
        }
    }
};

theme.ChatBox.prototype.sendAddMessage = function (text, files, images) {
    var self = this;
    switch (self.vMediaInput.mode) {
        case "new":
            var messList = [];
            for (var i = 0; i < files.length; i++){
                messList.push({
                    content_type: "file",
                    content: files[i].name,
                    m_time: new Date(),
                    userid: systemconfig.userid,
                    loading: true
                });
            }
            for (var i = 0; i < images.length; i++){
                messList.push({
                    content_type: "img",
                    content: images[i].name,
                    m_time: new Date(),
                    userid: systemconfig.userid,
                    object: images[i],
                    loading: true
                });
            }
            if (text != ""){
                messList.push({
                    content_type: "text",
                    content: text,
                    m_time: new Date(),
                    userid: systemconfig.userid,
                    loading: true
                });
            }
            var listIdLocal = [], localid;
            for (var i = 0; i < messList.length; i++){
                localid = (new Date()).getTime() + i;
                listIdLocal.push(localid);
                messList[i].localid = localid;
                messList[i].type = "me";
                self.addMessage(messList[i]);
                self.vMessContainer.scrollTop = self.vMessContainer.scrollHeight;
            }
            setTimeout(function () {
                self.vMessContainer.scrollTop = self.vMessContainer.scrollHeight;
                self.vMediaInput.focus();
            }, 1000);
            if (self.messageitem === undefined) {
                for (var i = 0; i < self.chatBar.listChatView.length; i++) {
                    if (self.chatBar.listChatView[i].name == this.id) {
                        self.messageitem = self.chatBar.listChatView[i].elt;
                        break;
                    }
                }
                if (self.messageitem === undefined) {
                    self.messageitem = self._messageitemhidden;
                    self.chatBar.listChatView.push({
                        name: this.id,
                        elt: self.messageitem,
                        lastLocalid: messList[messList.length - 1].localid
                    });
                }
                self.chatBar.listChatContent.insertBefore(self.messageitem, self.chatBar.listChatContent.firstChild);
            }
            var lastMess = messList[messList.length - 1];
            self.messageitem.messagetext = self.chatBar.getMessageText(lastMess);
            self.messageitem.time = contentModule.getTimeMessageList(new Date());
            self.messageitem.parentNode.insertBefore(self.messageitem, self.messageitem.parentNode.firstChild);
            self.sendFunc(text, files, images, listIdLocal).then(function(values){
                for (var i = 0; i < values.length; i++) {
                    self.updateMessage(values[i]);
                }
            });
            break;
        case "edit":
            self.editMessageFunc(self.localidEdit, text).then(function (values) {
                self.editMessageRedraw(self.localidEdit, text);
                for (var i = 0; i < self.chatBar.listChatView.length; i++) {
                    if (self.chatBar.listChatView[i].name == self.id) {
                        if (self.chatBar.listChatView[i].lastLocalid == self.localidEdit) {
                            self.chatBar.listChatView[i].elt.messagetext = text;
                        }
                        break;
                    }
                }
                self.vMediaInput.mode = "new";
                self.vMediaInput.focus();
            });
            break;
        default:

    }
};

theme.ChatBox.prototype.editMessageRedraw = function (localid, text) {
    var self = this;
    var elt, type;
    for (var i = 0; i < self.listMessLocalid.length; i++) {
        if (self.listMessLocalid[i].localid == localid) {
            elt = self.listMessLocalid[i].elt;
            type = self.listMessLocalid[i].type;
        }
    }
    DOMElement.removeAllChildren(elt);
    elt.appendChild(self.createMessage({
        type: type,
        content_type: "text",
        localid: localid,
        content: text,
        isEdit: true
    }));
};

theme.ChatBox.prototype.seenMessage = function () {
    var self = this;
    if (self.messageitem === undefined){
        if (self._messageitemhidden === undefined) return;
        if (self._messageitemhidden.new_noseen == 0) return;
        self._messageitemhidden.new_noseen = 0;
    }
    else {
        if (self.messageitem.new_noseen == 0) return;
        self.messageitem.new_noseen = 0;
    }
    console.log(this.content);
    if (this.content.length == 0) return;
    self.seenFunc(self.content[self.content.length - 1].localid).then(function(values){
        carddone.menu.mobileTabbar.items[carddone.menu.indexMenuChat].counter--;
    });
};

theme.ChatBox.prototype.updateContentSize = function () {
    requestAnimationFrame(function () {
        var inputSize = this.vInputContainer.getBoundingClientRect();
        this.vMessContainer.style.height = "calc(100% - (" + (inputSize.height + 48) + "px ))";
    }.bind(this));
};

theme.ChatBox.prototype.addMessage = function(content){
    var self = this;
    if (this.lastMessTime != 0){
        var oldTime, oldMonth, oldDate, oldYear;
        oldTime = this.lastMessTime.getTime()/86400000;
        oldDate = this.lastMessTime.getDate();
        oldMonth = this.lastMessTime.getMonth() + 1;
        oldYear = this.lastMessTime.getFullYear();
        var newTime = content.m_time.getTime()/86400000;
        var newDate = content.m_time.getDate()
        var newMonth = content.m_time.getMonth() + 1;
        var newYear = content.m_time.getFullYear();
        if (oldYear != newYear || oldMonth != newMonth || oldDate != newDate){
            var now = new Date();
            var nowTime = now.getTime()/86400000;
            var nowDate = now.getDate()
            var nowMonth = now.getMonth() + 1;
            var nowYear = now.getFullYear();
            var res;
            if (nowYear == newYear){
                if (nowMonth == newMonth && nowDate == newDate){
                    res = "Today";
                }
                else if (nowTime - newTime < 7){
                    var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    res = weekday[content.m_time.getDay()];
                }
                else {
                    res = contentModule.formatTimeDisplay(content.m_time);
                }
            }
            else {
                res = contentModule.formatTimeDisplay(content.m_time);
            }
            var singleMessage = absol.buildDom({
                class: "card-chatbox-line-seen",
                child: [absol.buildDom({
                    tag: "unreadmessageline",
                    props: {
                        text: res
                    }
                })]
            });
            this.vBoxMessage.appendChild(singleMessage);
        }
    }
    if (content.content_type != "file" && content.content_type != "img" && content.content_type != "text"){
        var singleMessage = this.createMessage(content);
        self.listMessLocalid.push({
            localid: content.localid,
            userid: content.userid,
            m_time: content.m_time,
            elt: singleMessage,
            type: content.type
        });
        this.vBoxMessage.appendChild(singleMessage);
        this.lastUserid = 0;
    }
    else {
        if (this.lastUserid !== content.userid || this.lastMessTime.getTime() + 60000 < content.m_time.getTime()){
            var className;
            if (content.type == "me"){
                className = "card-chatbox-groupmess-me";
                this._lastVMessageGroup = DOMElement.div({
                    attrs: {
                        className: className
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-chatbox-groupmess-me-note"
                            },
                            text: contentModule.getTimeMessage(content.m_time)
                        })
                    ]
                });
                this.vBoxMessage.appendChild(this._lastVMessageGroup);
            }
            else {
                className = "card-chatbox-groupmess-other";
                var srcImgAvatar = content.avatarSrc;
                this._lastVMessageGroup = DOMElement.div({
                    attrs: {
                        className: className
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-chatbox-groupmess-other-note"
                            },
                            text: content.fullname + ", " + contentModule.getTimeMessage(content.m_time)
                        })
                    ]
                });
                this.vBoxMessage.appendChild(DOMElement.div({
                    attrs: {
                        className: "card-chatbox-message-cover"
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                style: {
                                    marginLeft: "10px",
                                    display: "inline-block",
                                    verticalAlign: "top"
                                }
                            },
                            children: [
                                DOMElement.div({
                                    attrs: {
                                        className: "message-avatar-user",
                                        style: {
                                            backgroundImage: "url("+srcImgAvatar+")"
                                        }
                                    }
                                })
                            ]
                        }),
                        DOMElement.div({
                            attrs: {
                                style: {
                                    display: "inline-block"
                                }
                            },
                            children: [this._lastVMessageGroup]
                        })
                        ]
                    }));
                }
            }
            this.lastUserid = content.userid;
            for (var i = 0; i < self.chatBar.listChatView.length; i++){
                if (self.chatBar.listChatView[i].name == self.id){
                    self.chatBar.listChatView[i].lastLocalid = content.localid;
                    break;
                }
            }
            var singleMessage = this.createMessage(content);
            self.listMessLocalid.push({
                localid: content.localid,
                userid: content.userid,
                m_time: content.m_time,
                elt: singleMessage,
                type: content.type
            });
            this._lastVMessageGroup.appendChild(singleMessage);
    }
    this.lastMessTime = content.m_time;
    var self = this;
    if (content.localid <= this.mess_seen_id){
        absol._('attachhook').addTo(singleMessage).on('error', function(){
            this.remove();
            setTimeout(function(){
                singleMessage.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            }, 500);
        });
    }
};

theme.ChatBox.prototype.addOldMessage = function(content){
    var self = this;
    var oldTime, oldMonth, oldDate, oldYear;
    if (this.firstMessTime.getTime() != 0){
        oldTime = this.firstMessTime.getTime()/86400000;
        oldDate = this.firstMessTime.getDate();
        oldMonth = this.firstMessTime.getMonth() + 1;
        oldYear = this.firstMessTime.getFullYear();
    }
    var newTime = content.m_time.getTime()/86400000;
    var newDate = content.m_time.getDate()
    var newMonth = content.m_time.getMonth() + 1;
    var newYear = content.m_time.getFullYear();
    if (oldYear != newYear || oldMonth != newMonth || oldDate != newDate){
        var now = new Date();
        var nowTime = now.getTime()/86400000;
        var nowDate = now.getDate()
        var nowMonth = now.getMonth() + 1;
        var nowYear = now.getFullYear();
        var res;
        if (nowYear == newYear){
            if (nowMonth == newMonth && nowDate == newDate){
                res = "Today";
            }
            else if (nowTime - oldTime < 7){
                var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                res = weekday[this.firstMessTime.getDay()];
            }
            else {
                res = contentModule.formatTimeDisplay(this.firstMessTime);
            }
        }
        else {
            res = contentModule.formatTimeDisplay(this.firstMessTime);
        }
        var singleMessage = absol.buildDom({
            class: "card-chatbox-line-seen",
            child: [absol.buildDom({
                tag: "unreadmessageline",
                props: {
                    text: res
                }
            })]
        });
        this.vBoxMessage.insertBefore(singleMessage, this.vBoxMessage.firstChild);
        this.firstUserid = 0;
        this.firstMessTime = new Date(0);
    }
    if (content.content_type == "file" || content.content_type == "img" || content.content_type == "text"){
        if (this.firstUserid !== content.userid || this.firstMessTime.getTime() + 60000 < content.m_time.getTime()){
            var className;
            if (content.type == "me"){
                className = "card-chatbox-groupmess-me";
                this._firstVMessageGroup = DOMElement.div({
                    attrs: {
                        className: className
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-chatbox-groupmess-me-note"
                            },
                            text: contentModule.getTimeMessage(content.m_time)
                        })
                    ]
                });
                this.vBoxMessage.insertBefore(this._firstVMessageGroup, this.vBoxMessage.firstChild);
            }
            else {
                className = "card-chatbox-groupmess-other";
                var srcImgAvatar = content.avatarSrc;
                this._firstVMessageGroup = DOMElement.div({
                    attrs: {
                        className: className
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "card-chatbox-groupmess-other-note"
                            },
                            text: content.fullname + ", " + contentModule.getTimeMessage(content.m_time)
                        })
                    ]
                });
                var groupCoverElt = DOMElement.div({
                    attrs: {
                        className: "card-chatbox-message-cover"
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                style: {
                                    marginLeft: "10px",
                                    display: "inline-block",
                                    verticalAlign: "top"
                                }
                            },
                            children: [
                                DOMElement.div({
                                    attrs: {
                                        className: "message-avatar-user",
                                        style: {
                                            backgroundImage: "url("+srcImgAvatar+")"
                                        }
                                    }
                                })
                            ]
                        }),
                        DOMElement.div({
                            attrs: {
                                style: {
                                    display: "inline-block"
                                }
                            },
                            children: [this._firstVMessageGroup]
                        })
                    ]
                });
                this.vBoxMessage.insertBefore(groupCoverElt, this.vBoxMessage.firstChild);
            }
            this.firstUserid = content.userid;
            this.firstMessTime = content.m_time;
        }
    }
    else {
        this._firstVMessageGroup = DOMElement.div({});
        this.vBoxMessage.insertBefore(this._firstVMessageGroup, this.vBoxMessage.firstChild);
        this.firstUserid = 0;
    }
    var singleMessage = this.createMessage(content);
    self.listMessLocalid.push({
        localid: content.localid,
        userid: content.userid,
        m_time: content.m_time,
        elt: singleMessage,
        type: content.type
    });
    this._firstVMessageGroup.insertBefore(singleMessage, this._firstVMessageGroup.childNodes[1]);
};

theme.ChatBox.prototype.loadOldMess = function(){
    var self = this;
    console.log(this.data);
    self.vMessContainer.addEventListener("scroll", function(){
        if (self.vMessContainer.scrollTop == 0){
            var x = self.vBoxMessage.firstChild;
            self.loadOldMessFunc().then(function(values){
                if (self.data.content.length > 0){
                    self.firstUserid = 0;
                    self.firstMessTime = self.data.content[0].m_time;
                }
                else {
                    self.firstUserid = 0;
                    self.firstMessTime = new Date(0);
                }
                for (var i = values.length -1; i >= 0; i--){
                    self.addOldMessage(values[i]);
                }
                x.scrollIntoView();
            });
        }
    });
};

theme.ChatBox.prototype.getView = function () {
    //console.log(this.content);
    this.vBoxMessage = absol.buildDom({
        class: "card-chat-box-messages"
    });

    this.information_content = DOMElement.div({
        attrs: { className: "chats-theme-mobile-information-body-container" }
    });
    this.chats_galery = DOMElement.div({
        attrs: {
            className: "chats-theme-mobile-information-content"
        },
        children: [
            this.galleryHeader(),
            this.information_content
        ]
    });

    this.vLastBoxmess = DOMElement.div({
        style: {
            height: "1px"
        }
    });

    this.vMessContainer = DOMElement.div({
        attrs: {
            className: "card-chat-box-messages-container"
        },
        children: [
            this.vBoxMessage,
            this.vLastBoxmess
        ]
    });
    this.vInputContainer = DOMElement.div({
        attrs: {
            className: "card-chat-box-text-input-container"
        }
    });
    var self = this;
    this.vMediaInput = absol.buildDom({
        tag: 'mmessageinput',
        props: {
            mode: "new"
        },
        on: {
            sizechange: function (event) {
                this.updateContentSize();
            }.bind(this),
            send: function () {
                if (this.text !== "" || this.files.length > 0 || this.images.length > 0) {
                    self.sendAddMessage(this.text, this.files, this.images);
                    this.clearAllContent();
                }
            },
            cancel: function () {
                this.mode = "new";
                this.clearAllContent();
                self.localidEdit = 0;
            }
        }
    });
    this.vMediaInput.$preInput.on('focus', function () {
        if (self.messageitem !== undefined) {
            if (self.messageitem.new_noseen !== undefined) {
                if (self.messageitem.new_noseen > 0) {
                    self.seenMessage();
                    if (self._lineSeen !== undefined) self._lineSeen.selfRemove();
                }
            }
        }
    });
    this.vInputContainer.appendChild(this.vMediaInput);
    this.chatBodyContent = DOMElement.div({
        attrs: {
            className: "card-chat-box-content"
        },
        children: [
            this.nameChat(),
            this.vMessContainer,
            this.vInputContainer
        ]
    });
    this.view = DOMElement.div({
        attrs: {
            className: "card-chat-box",
            onclick: function (event) {
                var targetClassList = event.target.classList;
                if (targetClassList.contains('card-chatbox-message-cover')
                    || targetClassList.contains('card-chatbox-message-line')
                    || targetClassList.contains('card-chat-box-messages-container')
                ) {
                    this.vMediaInput.focus();
                }
            }.bind(this)
        },
        children: [
            DOMElement.div({
                attrs: {
                    className: "card-chat-box-body"
                },
                children: [
                    this.chatBodyContent,
                    this.chats_galery
                ]
            })
        ]
    });
    this.listMessLocalid = [];
    this.lastUserid = 0;
    this.lastMessTime = 0;
    this.dataImageList = [];
    for (var i = 0; i < this.content.length; i++) {
        this.addMessage(this.content[i]);
        // if (i < this.content.length - 1) {
        //     if (this.content[i].localid == this.mess_seen_id) {
        //         this._lineSeen = absol.buildDom({
        //             class: "card-chatbox-line-seen",
        //             child: [absol.buildDom({
        //                 tag: "unreadmessageline"
        //             })]
        //         });
        //         this.vBoxMessage.appendChild(this._lineSeen);
        //         this.lastUserid = 0;
        //     }
        // }
    }
    this.loadOldMess();
    setTimeout(function () {
        this.vMediaInput.focus();
    }.bind(this), 500);
    return this.view;
};

theme.ChatBar.prototype.getMessageText = function(data){
    var self = this;
    switch (data.content_type) {
        case "file":
        case "text":
            return data.content;
        case "img":
            return "[photo]";
        case "join":
            return data.fullname + " đã tham gia nhóm."
            break;
        case "create":
            return data.fullname + " đã tạo nhóm."
        case "add_member":
            var listMemberName = "", uIndex;
            for (var i = 0; i < data.content.length; i++){
                if (listMemberName.length > 0) listMemberName += ", ";
                uIndex = self.usersList.getIndex(data.content[i]);
                if (uIndex >= 0) listMemberName += self.usersList[uIndex].fullname;
            }
            return data.fullname + " đã thêm " + listMemberName;
        case "remove_member":
            var fullname = "";
            var uIndex = self.usersList.getIndex(data.content);
            if (uIndex >= 0) fullname += self.usersList[uIndex].fullname;
            else fullname = "...";
            return data.fullname + " đã xóa " + fullname + " khỏi cuộc trò chuyện."
        case "leave_group":
            var messText = "";
            var uIndex = self.usersList.getIndex(data.content.leave);
            if (uIndex >= 0) messText += self.usersList[uIndex].fullname + " đã rời khỏi cuộc trò chuyện, và ";
            else messText = "...";
            return messText;

    }
    return "";
};

theme.ChatBar.prototype.dropGroup = function(id){
    var self = this;
    for (var i = 0; i < self.listChatView.length; i++){
        if (self.listChatView[i].name == id){
            self.listChatView[i].elt.remove();
            self.listChatView.splice(i, 1);
            break;
        }
    }
    for (var i = 0; i < self.listChatBoxOpen.length; i++){
        if (self.listChatBoxOpen[i].name == id){
            if (self.listChatBoxOpen[i].elt.parentElement.containsClass('absol-active')) {
                self.frameList.getAllChild()[0].requestActive();
                window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
            }
            break;
        }
    }
};

theme.ChatBar.prototype.deleteGroup = function(item){
    var self = this;
    item.deleteFunc(item.id).then(function(value){
        if (self.manageModal !== undefined) self.manageModal.selfRemove();
        self.frameList.getAllChild()[0].requestActive();
        self.dropGroup(item.id);
    });
};

theme.ChatBar.prototype.deleteGroupConfirm = function(item){
    var self = this;
    ModalElement.question2({
        title: LanguageModule.text("txt_delete_conversation"),
        message: LanguageModule.text2("war_txt_delete_conversation", item.name),
        onclick: function(sel){
            if (sel == 0){
                self.deleteGroup(item);
            }
        }
    });
};

theme.ChatBar.prototype.leaveGroup = function(item){
    var self = this;
    item.leaveFunc(item.id).then(function(value){
        if (self.manageModal !== undefined) self.manageModal.selfRemove();
        self.frameList.getAllChild()[0].requestActive();
        self.dropGroup(item.id);
    });
};

theme.ChatBar.prototype.leaveGroupConfirm = function(item){
    var self = this;
    ModalElement.question2({
        title: LanguageModule.text("txt_leave_group"),
        message: LanguageModule.text2("war_txt_leave_group", item.name),
        onclick: function(sel){
            if (sel == 0){
                self.leaveGroup(item);
            }
        }
    });
};

theme.ChatBar.prototype.dissolveGroup = function(item){
    var self = this;
    item.dissolveFunc(item.id).then(function(value){
        if (self.manageModal !== undefined) self.manageModal.selfRemove();
        self.frameList.getAllChild()[0].requestActive();
        self.dropGroup(item.id);
    });
};

theme.ChatBar.prototype.dissolveGroupConfirm = function(item){
    var self = this;
    ModalElement.question2({
        title: LanguageModule.text("txt_dissolve_group"),
        message: LanguageModule.text2("war_txt_dissolve_group", item.name),
        onclick: function(sel){
            if (sel == 0){
                self.dissolveGroup(item);
            }
        }
    });
};


theme.ChatBar.prototype.drawListMessage = function (data, openChat, sessionActive) {
    // console.log(openChat, sessionActive);
    var self = this;
    if (openChat === undefined) openChat = false;
    var mItemsNew;
    var exOpenChat = false;
    var quickMenuItems, isGroup;
    for (var i = 0; i < data.length; i++) {
    if (data[i].isdelete) continue;
        quickMenuItems = [];
        if (data[i].memberList.length > 2) isGroup = true;
        else {
            for (var x = 0; x < data[i].memberList.length; x++){
                if (data[i].memberList[x].privilege >= 2){
                    isGroup = true;
                    break;
                }
            }
        }
        if (isGroup || data[i].cardid > 0){
            quickMenuItems.push({
                text: LanguageModule.text("txt_manage_group"),
                extendClasses: "bsc-quickmenu",
                cmd: function(item){
                    return function(){
                        self.manageGroup(item);
                    }
                }(data[i])
            });
        }
        if (data[i].cardid == 0){
            quickMenuItems.push({
                text: LanguageModule.text("txt_delete_conversation"),
                extendClasses: "bsc-quickmenu",
                cmd: function(item){
                    return function(){
                        self.deleteGroupConfirm(item);
                    }
                }(data[i])
            });
        }
        if (data[i].cardid == 0 && isGroup){
            quickMenuItems.push({
                text: LanguageModule.text("txt_leave_group"),
                extendClasses: "bsc-quickmenu",
                cmd: function(item){
                    return function(){
                        self.leaveGroupConfirm(item);
                    }
                }(data[i])
            });
        }
        mItemsNew = absol.buildDom({
            tag: "messageitem",
            props: {
                avatarSrc: data[i].avatarSrc,
                name: data[i].name,
                quickMenuItems: quickMenuItems,
                company_contactName: data[i].company_contactName,
                time: contentModule.getTimeMessageList(data[i].lasttime)
            },
            on: {
                pressopen: function (item) {
                    return function (event) {
                        for (var j = 0; j < self.listChatBoxOpen.length; j++) {
                            if (self.listChatBoxOpen[j].name == item.id) {
                                self.listChatBoxOpen[j].elt.requestActive();
                                carddone.sessionIdActive = item.id;
                                carddone.menu.showMobileTabbar(false);
                                if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
                                    setTimeout(function(){
                                        self.listChatBoxOpen[j].chatBox.seenMessage();
                                    }, 500);
                                }
                                return;
                            }
                        }
                        var chatBox = new theme.ChatBox({
                            messageitem: this,
                            chatBar: self,
                            data: item,
                            frameList: self.frameList
                        });
                        var newChat = absol.buildDom({
                            tag: 'tabframe',
                            attr: {
                                name: item.id
                            },
                            class: 'chats-theme-mobile-message-frame-content',
                            child: [
                                chatBox.getView()
                            ]
                        });
                        // console.log(self.frameList);
                        self.frameList.addChild(newChat);
                        window.backLayoutFunc.push(function(){
                            self.frameList.getAllChild()[0].requestActive();
                            window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                        });
                        newChat.requestActive();
                        carddone.sessionIdActive = item.id;
                        chatBox.seenMessage();
                        carddone.menu.showMobileTabbar(false);
                        self.listChatBoxOpen.push({
                            name: item.id,
                            elt: newChat,
                            chatBox: chatBox
                        });
                    }
                }(data[i])
            }
        });
        var new_noseen = 0;
        for (var j = 0; j < data[i].content.length; j++) {
            if (data[i].content[j].localid > data[i].mess_seen_id) {
                new_noseen++;
            }
        }
        mItemsNew.new_noseen = new_noseen;
        var lastLocalid = 0;
        if (data[i].content.length > 0) {
            var lastMess = data[i].content[data[i].content.length - 1];
            mItemsNew.messagetext = self.getMessageText(lastMess);
            lastLocalid = data[i].content[data[i].content.length - 1].localid;
        }
        self.listChatContent.appendChild(mItemsNew);
        self.listChatView.push({
            name: data[i].id,
            elt: mItemsNew,
            lastLocalid: lastLocalid
        });
        // if (openChat) {
        //     if (data[i].id == sessionActive.id) {
        //         for (var j = 0; j < self.listChatBoxOpen.length; j++) {
        //             if (self.listChatBoxOpen[j].name == data[i].id) {
        //                 self.listChatBoxOpen[j].elt.requestActive();
        //                 carddone.sessionIdActive = data[i].id;
        //                 carddone.menu.showMobileTabbar(false);
        //                 if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
        //                     setTimeout(function(){
        //                         self.listChatBoxOpen[j].chatBox.seenMessage();
        //                     }, 500);
        //                 }
        //                 return;
        //             }
        //         }
        //         var chatBox = new theme.ChatBox({
        //             messageitem: mItemsNew,
        //             chatBar: self,
        //             data: data[i],
        //             frameList: self.frameList
        //         });
        //         var newChat = absol.buildDom({
        //             tag: 'tabframe',
        //             attr: {
        //                 name: data[i].id
        //             },
        //             class: 'chats-theme-mobile-message-frame-content',
        //             child: [
        //                 chatBox.getView()
        //             ]
        //         });
        //         self.frameList.addChild(newChat);
        //         window.backLayoutFunc.push(function(){
        //             self.frameList.getAllChild()[0].requestActive();
        //             window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
        //         });
        //         newChat.requestActive();
        //         carddone.sessionIdActive = data[i].id;
        //         if (chatBox.messageitem.new_noseen > 0){
        //             setTimeout(function(){
        //                 chatBox.seenMessage();
        //             }, 500);
        //         }
        //         carddone.menu.showMobileTabbar(false);
        //         self.listChatBoxOpen.push({
        //             name: data[i].id,
        //             elt: newChat,
        //             chatBox: chatBox
        //         });
        //         chatBox.seenMessage();
        //         exOpenChat = true;
        //         // console.log(data[i]);
        //     }
        // }
    }
    // console.log(openChat, exOpenChat);
    // if (openChat) {
    //     if (!exOpenChat) {
    //         var quickMenuItems = [];
    //         var isGroup = false;
    //         if (sessionActive.memberList.length > 2) isGroup = true;
    //         else {
    //             for (var x = 0; x < sessionActive.memberList.length; x++){
    //                 if (sessionActive.memberList[x].privilege >= 2){
    //                     isGroup = true;
    //                     break;
    //                 }
    //             }
    //         }
    //         if (isGroup || sessionActive.cardid > 0){
    //             quickMenuItems.push({
    //                 text: LanguageModule.text("txt_manage_group"),
    //                 extendClasses: "bsc-quickmenu",
    //                 cmd: function(){
    //                     self.manageGroup(sessionActive);
    //                 }
    //             });
    //         }
    //         if (values.item.cardid == 0){
    //             quickMenuItems.push({
    //                 text: LanguageModule.text("txt_delete_conversation"),
    //                 extendClasses: "bsc-quickmenu",
    //                 cmd: function(){
    //                     self.deleteGroupConfirm(sessionActive);
    //                 }
    //             });
    //         }
    //         if (values.item.cardid == 0 && isGroup){
    //             quickMenuItems.push({
    //                 text: LanguageModule.text("txt_leave_group"),
    //                 extendClasses: "bsc-quickmenu",
    //                 cmd: function(){
    //                     self.leaveGroupConfirm(sessionActive);
    //                 }
    //             });
    //         }
    //         mItemsNew = absol.buildDom({
    //             tag: "messageitem",
    //             props: {
    //                 avatarSrc: sessionActive.avatarSrc,
    //                 name: sessionActive.name,
    //                 quickMenuItems: quickMenuItems,
    //                 company_contactName: sessionActive.company_contactName,
    //                 time: contentModule.getTimeMessageList(sessionActive.lasttime),
    //                 new_noseen: 0
    //             },
    //             on: {
    //                 pressopen: function (event) {
    //                     for (var j = 0; j < self.listChatBoxOpen.length; j++) {
    //                         if (self.listChatBoxOpen[j].name == sessionActive.id) {
    //                             self.listChatBoxOpen[j].elt.requestActive();
    //                             carddone.sessionIdActive = sessionActive.id;
    //                             if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
    //                                 setTimeout(function(){
    //                                     self.listChatBoxOpen[j].chatBox.seenMessage();
    //                                 }, 500);
    //                             }
    //                             carddone.menu.showMobileTabbar(false);
    //                             return;
    //                         }
    //                     }
    //                     var chatBox = new theme.ChatBox({
    //                         messageitem: this,
    //                         chatBar: self,
    //                         data: sessionActive,
    //                         frameList: self.frameList
    //                     });
    //                     var newChat = absol.buildDom({
    //                         tag: 'tabframe',
    //                         attr: {
    //                             name: sessionActive.id
    //                         },
    //                         class: 'chats-theme-mobile-message-frame-content',
    //                         child: [
    //                             chatBox.getView()
    //                         ]
    //                     });
    //                     self.frameList.addChild(newChat);
    //                     window.backLayoutFunc.push(function(){
    //                         self.frameList.getAllChild()[0].requestActive();
    //                         window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
    //                     });
    //                     newChat.requestActive();
    //                     carddone.sessionIdActive = sessionActive.id;
    //                     if (chatBox.messageitem.new_noseen > 0){
    //                         setTimeout(function(){
    //                             chatBox.seenMessage();
    //                         }, 500);
    //                     }
    //                     carddone.menu.showMobileTabbar(false);
    //                     self.listChatBoxOpen.push({
    //                         name: sessionActive.id,
    //                         elt: newChat,
    //                         chatBox: chatBox
    //                     });
    //                 }
    //             }
    //         });
    //
    //         //tao chatbox
    //         var chatBox = new theme.ChatBox({
    //             _messageitemhidden: mItemsNew,
    //             chatBar: self,
    //             data: sessionActive,
    //             frameList: self.frameList
    //         });
    //         var newChat = absol.buildDom({
    //             tag: 'tabframe',
    //             attr: {
    //                 name: sessionActive.id
    //             },
    //             class: 'chats-theme-mobile-message-frame-content',
    //             child: [
    //                 chatBox.getView()
    //             ]
    //         });
    //         self.frameList.addChild(newChat);
    //         window.backLayoutFunc.push(function(){
    //             self.frameList.getAllChild()[0].requestActive();
    //             window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
    //         });
    //         newChat.requestActive();
    //         carddone.sessionIdActive = sessionActive.id;
    //         if (chatBox.messageitem.new_noseen > 0){
    //             setTimeout(function(){
    //                 chatBox.seenMessage();
    //             }, 500);
    //         }
    //         carddone.menu.showMobileTabbar(false);
    //         self.listChatBoxOpen.push({
    //             name: sessionActive.id,
    //             elt: newChat,
    //             chatBox: chatBox
    //         });
    //         //console.log(self);
    //     }
    // }
};

theme.ChatBar.prototype.getMessOpenChat = function(){
    var self = this;
    return new Promise(function(resolve, reject){
        self.data.functionOpenChat().then(function(values){
            for (var i = 0; i < self.listChatView.length; i++){
                if (self.listChatView[i].name == values){
                    self.listChatView[i].elt.emit("click");
                    break;
                }
            }
            resolve(self.getMessOpenChat());
        });
    });
};

theme.ChatBar.prototype.getMessView = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.data.functionMessage().then(function (values) {
            console.log(values);
            switch (values.type) {
                case "addmessage":
                    //console.log(values);
                    for (var i = 0; i < self.data.length; i++) {
                        if (self.data[i].id == values.content.sessionid) {
                            for (var j = 0; j < values.content.dataDraw.length; j++) {
                                self.data[i].content.push(values.content.dataDraw[j]);
                            }
                        }
                    }
                    var lastMess;
                    for (var i = 0; i < self.listChatView.length; i++) {
                        if (self.listChatView[i].name == values.content.sessionid) {
                            var new_noseen = self.listChatView[i].elt.new_noseen;
                            if (new_noseen === undefined) new_noseen = 0;
                            if (values.content.dataDraw[0].type == "other"){
                                if (new_noseen == 0) carddone.menu.mobileTabbar.items[carddone.menu.indexMenuChat].counter++;
                                self.listChatView[i].elt.new_noseen = values.content.dataDraw.length + new_noseen;
                            }
                            else {
                                if (new_noseen > 0 && carddone.menu.mobileTabbar.items[carddone.menu.indexMenuChat].counter > 0) carddone.menu.mobileTabbar.items[carddone.menu.indexMenuChat].counter--;
                                self.listChatView[i].elt.new_noseen = 0;
                            }
                            lastMess = values.content.dataDraw[values.content.dataDraw.length - 1];
                            self.listChatView[i].elt.messagetext = self.getMessageText(lastMess);
                            self.listChatView[i].elt.time = contentModule.getTimeMessageList(new Date());
                            self.listChatView[i].elt.parentNode.insertBefore(self.listChatView[i].elt, self.listChatView[i].elt.parentNode.firstChild);
                            break;
                        }
                    }
                    for (var i = 0; i < self.listChatBoxOpen.length; i++) {
                        if (self.listChatBoxOpen[i].name == values.content.sessionid) {
                            var isS = 0;
                            if (self.listChatBoxOpen[i].chatBox.vLastBoxmess.offsetTop <= (self.listChatBoxOpen[i].chatBox.vMessContainer.scrollTop + self.listChatBoxOpen[i].chatBox.vMessContainer.offsetHeight + 80)) {
                                isS = 1;
                            }
                            for (var j = 0; j < values.content.dataDraw.length; j++) {
                                if (values.content.dataDraw[j].type == "me") isS = true;
                                self.listChatBoxOpen[i].chatBox.addMessage(values.content.dataDraw[j]);
                            }
                            if (isS) self.listChatBoxOpen[i].chatBox.vLastBoxmess.scrollIntoView();
                            break;
                        }
                    }
                    break;
                case "add_session":
                    // console.log(values);
                    var quickMenuItems = [];
                    var isGroup = false;
                    if (values.item.memberList.length > 2) isGroup = true;
                    else {
                        for (var x = 0; x < values.item.memberList.length; x++){
                            if (values.item.memberList[x].privilege >= 2){
                                isGroup = true;
                                break;
                            }
                        }
                    }
                    if (isGroup || values.item.cardid > 0){
                        quickMenuItems.push({
                            text: LanguageModule.text("txt_manage_group"),
                            extendClasses: "bsc-quickmenu",
                            cmd: function(){
                                self.manageGroup(values.item);
                            }
                        });
                    }
                    if (values.item.cardid == 0){
                        quickMenuItems.push({
                            text: LanguageModule.text("txt_delete_conversation"),
                            extendClasses: "bsc-quickmenu",
                            cmd: function(){
                                self.deleteGroupConfirm(values.item);
                            }
                        });
                    }
                    if (values.item.cardid == 0 && isGroup){
                        quickMenuItems.push({
                            text: LanguageModule.text("txt_leave_group"),
                            extendClasses: "bsc-quickmenu",
                            cmd: function(){
                                self.leaveGroupConfirm(values.item);
                            }
                        });
                    }
                    var mItemsNew = absol.buildDom({
                        tag: "messageitem",
                        props: {
                            avatarSrc: values.item.avatarSrc,
                            name: values.item.name,
                            quickMenuItems: quickMenuItems,
                            company_contactName: values.item.company_contactName,
                            time: contentModule.getTimeMessageList(values.item.lasttime),
                            new_noseen: 0
                        },
                        on: {
                            pressopen: function (event) {
                                for (var j = 0; j < self.listChatBoxOpen.length; j++) {
                                    if (self.listChatBoxOpen[j].name == values.item.id) {
                                        self.listChatBoxOpen[j].elt.requestActive();
                                        carddone.sessionIdActive = values.item.id;
                                        if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
                                            setTimeout(function(){
                                                self.listChatBoxOpen[j].chatBox.seenMessage();
                                            }, 500);
                                        }
                                        carddone.menu.showMobileTabbar(false);
                                        return;
                                    }
                                }
                                var chatBox = new theme.ChatBox({
                                    messageitem: this,
                                    chatBar: self,
                                    data: values.item,
                                    frameList: self.frameList
                                });
                                var newChat = absol.buildDom({
                                    tag: 'tabframe',
                                    attr: {
                                        name: values.item.id
                                    },
                                    class: 'chats-theme-mobile-message-frame-content',
                                    child: [
                                        chatBox.getView()
                                    ]
                                });
                                self.frameList.addChild(newChat);
                                newChat.requestActive();
                                window.backLayoutFunc.push(function(){
                                    self.frameList.getAllChild()[0].requestActive();
                                    window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                                });
                                carddone.sessionIdActive = values.item.id;
                                chatBox.seenMessage();
                                carddone.menu.showMobileTabbar(false);
                                self.listChatBoxOpen.push({
                                    name: values.item.id,
                                    elt: newChat,
                                    chatBox: chatBox
                                });
                            }
                        }
                    });
                    var new_noseen = 0;
                    for (var j = 0; j < values.item.content.length; j++) {
                        if (values.item.content[j].localid > values.item.mess_seen_id) {
                            new_noseen++;
                        }
                    }
                    mItemsNew.new_noseen = new_noseen;
                    if (new_noseen > 0) carddone.menu.mobileTabbar.items[carddone.menu.indexMenuChat].counter++;
                    var lastLocalid = 0;
                    if (values.item.content.length > 0) {
                        var lastMess = values.item.content[values.item.content.length - 1];
                        mItemsNew.messagetext = self.getMessageText(lastMess);
                        lastLocalid = values.item.content[values.item.content.length - 1].lastLocalid;
                    }
                    self.listChatContent.insertBefore(mItemsNew, self.listChatContent.firstChild);
                    self.listChatView.push({
                        name: values.item.id,
                        elt: mItemsNew,
                        lastLocalid: lastLocalid
                    });
                    if (values.active !== undefined) mItemsNew.emit("pressopen");
                    break;
                case "editmessage":
                    // console.log(values);
                    for (var i = 0; i < self.data.length; i++) {
                        if (self.data[i].id == values.content.sessionid) {
                            for (var j = 0; j < self.data[i].content.length; j++) {
                                if (self.data[i].content[j].localid == values.content.localid) {
                                    self.data[i].content[j].content = values.content.content;
                                    self.data[i].content[j].isEdit = 1;
                                }
                            }
                        }
                    }
                    for (var i = 0; i < self.listChatBoxOpen.length; i++) {
                        if (self.listChatBoxOpen[i].name == values.content.sessionid) {
                            self.listChatBoxOpen[i].chatBox.editMessageRedraw(values.content.localid, values.content.content);
                            break;
                        }
                    }
                    for (var i = 0; i < self.listChatView.length; i++) {
                        if (self.listChatView[i].name == values.content.sessionid) {
                            if (self.listChatView[i].lastLocalid == values.content.localid) {
                                self.listChatView[i].elt.messagetext = self.getMessageText(values.content);
                            }
                            break;
                        }
                    }
                    break;
                case "deletemessage":
                    for (var i = 0; i < self.data.length; i++) {
                        if (self.data[i].id == values.content.sessionid) {
                            for (var j = 0; j < self.data[i].content.length; j++) {
                                if (self.data[i].content[j].localid == values.content.localid) {
                                    self.data[i].content.splice(j);
                                }
                            }
                        }
                    }
                    for (var i = 0; i < self.listChatBoxOpen.length; i++) {
                        if (self.listChatBoxOpen[i].name == values.content.sessionid) {
                            self.listChatBoxOpen[i].chatBox.deleteMessageRedraw(values.content.localid);
                            break;
                        }
                    }
                    for (var i = 0; i < self.listChatView.length; i++) {
                        if (self.listChatView[i].name == values.content.sessionid) {
                            if (self.listChatView[i].lastLocalid == values.content.localid) {
                                if (values.content.lastMess == ""){
                                    self.listChatView[i].elt.messagetext = "";
                                }
                                else {
                                    self.listChatView[i].elt.messagetext = self.getMessageText(values.content.lastMess);
                                    self.listChatView[i].lastLocalid = values.content.lastMess.localid;
                                }
                            }
                            break;
                        }
                    }
                    break;
                case "change_group_name":
                    // console.log(values);
                    for (var i = 0; i < self.listChatBoxOpen.length; i++){
                        if (self.listChatBoxOpen[i].name == values.sessionid){
                            self.listChatBoxOpen[i].chatBox.titleChat.textContent = values.name;
                            break;
                        }
                    }
                    for (var i = 0; i < self.listChatView.length; i++){
                        if (self.listChatView[i].name == values.sessionid){
                            self.listChatView[i].elt.name = values.name;
                            break;
                        }
                    }
                    break;
                case "change_group_avatar":
                    // console.log(values);
                    for (var i = 0; i < self.listChatView.length; i++){
                        if (self.listChatView[i].name == values.sessionid){
                            self.listChatView[i].elt.avatarSrc = values.avatarSrc;
                            break;
                        }
                    }
                    break;
                case "remove_group":
                    self.dropGroup(values.content);
                    break;
                case "activechatbox":
                    var ex = 0;
                    for (var i = 0; i < self.listChatView.length; i++){
                        if (self.listChatView[i].name == values.dataSession.id){
                            self.listChatView[i].elt.emit("pressopen");
                            ex = 1;
                            break;
                        }
                    }
                    if (ex == 0){
                        var quickMenuItems = [];
                        var isGroup = false;
                        if (values.dataSession.memberList.length > 2) isGroup = true;
                        else {
                            for (var x = 0; x < values.dataSession.memberList.length; x++){
                                if (values.dataSession.memberList[x].privilege >= 2){
                                    isGroup = true;
                                    break;
                                }
                            }
                        }
                        if (isGroup || values.dataSession.cardid > 0){
                            quickMenuItems.push({
                                text: LanguageModule.text("txt_manage_group"),
                                extendClasses: "bsc-quickmenu",
                                cmd: function(){
                                    self.manageGroup(values.dataSession);
                                }
                            });
                        }
                        if (values.dataSession.cardid == 0){
                            quickMenuItems.push({
                                text: LanguageModule.text("txt_delete_conversation"),
                                extendClasses: "bsc-quickmenu",
                                cmd: function(){
                                    self.deleteGroupConfirm(values.dataSession);
                                }
                            });
                        }
                        if (values.dataSession.cardid == 0 && isGroup){
                            quickMenuItems.push({
                                text: LanguageModule.text("txt_leave_group"),
                                extendClasses: "bsc-quickmenu",
                                cmd: function(){
                                    self.leaveGroupConfirm(values.dataSession);
                                }
                            });
                        }
                        var mItemsNew = absol.buildDom({
                            tag: "messageitem",
                            props: {
                                avatarSrc: values.dataSession.avatarSrc,
                                name: values.dataSession.name,
                                quickMenuItems: quickMenuItems,
                                company_contactName: values.dataSession.company_contactName,
                                time: contentModule.getTimeMessageList(values.dataSession.lasttime),
                                new_noseen: 0
                            },
                            on: {
                                pressopen: function (event) {
                                    for (var j = 0; j < self.listChatBoxOpen.length; j++) {
                                        if (self.listChatBoxOpen[j].name == values.dataSession.id) {
                                            self.listChatBoxOpen[j].elt.requestActive();
                                            carddone.sessionIdActive = values.dataSession.id;
                                            if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
                                                setTimeout(function(){
                                                    self.listChatBoxOpen[j].chatBox.seenMessage();
                                                }, 500);
                                            }
                                            carddone.menu.showMobileTabbar(false);
                                            return;
                                        }
                                    }
                                    var chatBox = new theme.ChatBox({
                                        messageitem: this,
                                        chatBar: self,
                                        data: values.dataSession,
                                        frameList: self.frameList
                                    });
                                    var newChat = absol.buildDom({
                                        tag: 'tabframe',
                                        attr: {
                                            name: values.dataSession.id
                                        },
                                        class: 'chats-theme-mobile-message-frame-content',
                                        child: [
                                            chatBox.getView()
                                        ]
                                    });
                                    self.frameList.addChild(newChat);
                                    window.backLayoutFunc.push(function(){
                                        self.frameList.getAllChild()[0].requestActive();
                                        window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                                    });
                                    newChat.requestActive();
                                    carddone.sessionIdActive = values.dataSession.id;
                                    chatBox.seenMessage();
                                    carddone.menu.showMobileTabbar(false);
                                    self.listChatBoxOpen.push({
                                        name: values.dataSession.id,
                                        elt: newChat,
                                        chatBox: chatBox
                                    });
                                }
                            }
                        });

                        //tao chatbox
                        var chatBox = new theme.ChatBox({
                            _messageitemhidden: mItemsNew,
                            chatBar: self,
                            data: values.dataSession,
                            frameList: self.frameList
                        });
                        var newChat = absol.buildDom({
                            tag: 'tabframe',
                            attr: {
                                name: values.dataSession.id
                            },
                            class: 'chats-theme-mobile-message-frame-content',
                            child: [
                                chatBox.getView()
                            ]
                        });
                        self.frameList.addChild(newChat);
                        window.backLayoutFunc.push(function(){
                            self.frameList.getAllChild()[0].requestActive();
                            window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                        });
                        newChat.requestActive();
                        carddone.sessionIdActive = values.dataSession.id;
                        chatBox.seenMessage();
                        carddone.menu.showMobileTabbar(false);
                        self.listChatBoxOpen.push({
                            name: values.dataSession.id,
                            elt: newChat,
                            chatBox: chatBox
                        });
                    }
                    break;

            }
            resolve(self.getMessView());
        });
    });
};

theme.ChatBar.prototype.addgroupFuncSubmit = function () {
    var self = this;
    var name = self._name_group_inputtext.value;
    var listMember = self._members_group_select.values;
    if (listMember.length < 1) {
        ModalElement.alert({
            message: LanguageModule.text("war_txt_member_is_null")
        });
        return;
    }
    var data = {
        name: name,
        listMember: listMember
    };
    self.data.addgroupFunc(data).then(function (values) {
        //console.log(values);
        self.frameList.getAllChild()[0].requestActive();
        window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
        var quickMenuItems = [];
        var isGroup = false;
        if (values.item.memberList.length > 2) isGroup = true;
        else {
            for (var x = 0; x < values.item.memberList.length; x++){
                if (values.item.memberList[x].privilege >= 2){
                    isGroup = true;
                    break;
                }
            }
        }
        if (isGroup || values.item.cardid > 0){
            quickMenuItems.push({
                text: LanguageModule.text("txt_manage_group"),
                extendClasses: "bsc-quickmenu",
                cmd: function(){
                    self.manageGroup(values.item);
                }
            });
        }
        if (values.item.cardid == 0){
            quickMenuItems.push({
                text: LanguageModule.text("txt_delete_conversation"),
                extendClasses: "bsc-quickmenu",
                cmd: function(){
                    self.deleteGroupConfirm(item);
                }
            });
        }
        if (values.item.cardid == 0 && isGroup){
            quickMenuItems.push({
                text: LanguageModule.text("txt_leave_group"),
                extendClasses: "bsc-quickmenu",
                cmd: function(){
                    self.leaveGroupConfirm(item);
                }
            });
        }
        var mItemsNew = absol.buildDom({
            tag: "messageitem",
            props: {
                avatarSrc: values.item.avatarSrc,
                name: values.item.name,
                quickMenuItems: quickMenuItems,
                time: contentModule.getTimeMessageList(values.item.lasttime),
                new_noseen: 0
            },
            on: {
                pressopen: function (event) {
                    // console.log(values.item.id, self.listChatBoxOpen);
                    for (var j = 0; j < self.listChatBoxOpen.length; j++) {
                        if (self.listChatBoxOpen[j].name == values.item.id) {
                            self.listChatBoxOpen[j].elt.requestActive();
                            carddone.sessionIdActive = values.item.id;
                            if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
                                setTimeout(function(){
                                    self.listChatBoxOpen[j].chatBox.seenMessage();
                                }, 500);
                            }
                            carddone.menu.showMobileTabbar(false);
                            return;
                        }
                    }
                    var chatBox = new theme.ChatBox({
                        messageitem: this,
                        chatBar: self,
                        data: values.item,
                        frameList: self.frameList
                    });
                    var newChat = absol.buildDom({
                        tag: 'tabframe',
                        attr: {
                            name: values.item.id
                        },
                        class: 'chats-theme-mobile-message-frame-content',
                        child: [
                            chatBox.getView()
                        ]
                    });
                    self.frameList.addChild(newChat);
                    newChat.requestActive();
                    window.backLayoutFunc.push(function(){
                        self.frameList.getAllChild()[0].requestActive();
                        window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                    });
                    carddone.sessionIdActive = values.item.id;
                    chatBox.seenMessage();
                    carddone.menu.showMobileTabbar(false);
                    self.listChatBoxOpen.push({
                        name: values.item.id,
                        elt: newChat,
                        chatBox: chatBox
                    });
                }
            }
        });
        if (values.isAdd == 1) { //tao messageitem
            var lastLocalid = 0;
            if (values.item.content.length > 0) {
                var lastMess = values.item.content[values.item.content.length - 1];
                mItemsNew.messagetext = self.getMessageText(lastMess);
                lastLocalid = values.item.content[values.item.content.length - 1].localid;
            }
            self.listChatContent.insertBefore(mItemsNew, self.listChatContent.firstChild);
            self.listChatView.push({
                name: values.item.id,
                elt: mItemsNew,
                lastLocalid: lastLocalid
            });
        }

        //tao chatbox
        for (var j = 0; j < self.listChatBoxOpen.length; j++) {
            if (self.listChatBoxOpen[j].name == values.item.id) {
                self.listChatBoxOpen[j].elt.requestActive();
                carddone.sessionIdActive = values.item.id;
                if (self.listChatBoxOpen[j].chatBox.messageitem.new_noseen > 0){
                    setTimeout(function(){
                        self.listChatBoxOpen[j].chatBox.seenMessage();
                    }, 500);
                }
                carddone.menu.showMobileTabbar(false);
                return;
            }
        }
        var messageitem;
        for (var i = 0; i < self.listChatView.length; i++) {
            if (self.listChatView[i].name == values.item.id) {
                messageitem = self.listChatView[i].elt;
                break;
            }
        }
        if (messageitem === undefined) {
            var _messageitemhidden = mItemsNew;
        }
        var chatBox = new theme.ChatBox({
            messageitem: messageitem,
            _messageitemhidden: _messageitemhidden,
            chatBar: self,
            data: values.item,
            frameList: self.frameList
        });
        var newChat = absol.buildDom({
            tag: 'tabframe',
            attr: {
                name: values.item.id
            },
            class: 'chats-theme-mobile-message-frame-content',
            child: [
                chatBox.getView()
            ]
        });
        self.frameList.addChild(newChat);
        window.backLayoutFunc.push(function(){
            self.frameList.getAllChild()[0].requestActive();
            window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
        });
        newChat.requestActive();
        carddone.sessionIdActive = values.item.id;
        chatBox.seenMessage();
        carddone.menu.showMobileTabbar(false);
        self.listChatBoxOpen.push({
            name: values.item.id,
            elt: newChat,
            chatBox: chatBox
        });
    });
};

theme.ChatBar.prototype.addgroupFunc = function () {
    var self = this;
    self._name_group_inputtext = theme.input({
        style: {
            width: "100%",
            marginTop: "var(--control-horizontal-distance-1)",
            marginBottom: "var(--control-horizontal-distance-2)"
        }
    });

    self._members_group_select = absol.buildDom({
        tag: 'mselectbox',
        style: {
            textAlign: "left",
            display: "block",
            width: "100%",
            marginTop: "var(--control-horizontal-distance-1)",
            marginBottom: "var(--control-horizontal-distance-2)"
        },
        props: {
            items: self.data.listUserAdd,
            enableSearch: true
        }
    });
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_add_group"),
            commands: [{
                icon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "save"
                })
            }]
        },
        on: {
            action: function(){
                self.frameList.getAllChild()[0].requestActive();
                window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
            },
            command: function(){
                self.addgroupFuncSubmit();
            }
        }
    });
    var manageGroupDiv = absol.buildDom({
         tag: "tabframe",
         class: "card-manage-group",
         child: [
             header,
             DOMElement.div({
                 attrs: {
                     className: "card-mobile-content"
                 },
                 children: [
                     DOMElement.div({ text: LanguageModule.text("txt_group_name") }),
                     self._name_group_inputtext,
                     DOMElement.div({ text: LanguageModule.text("txt_add_members_into_group") }),
                     self._members_group_select
                 ]
             })
         ]
   });
   self.manageModal = manageGroupDiv;
   self.frameList.addChild(self.manageModal);
   self.manageModal.requestActive();
   window.backLayoutFunc.push(function(){
       self.frameList.getAllChild()[0].requestActive();
       window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
   });
   carddone.sessionIdActive = 0;
   self._name_group_inputtext.focus();
};

theme.ChatBar.prototype.loadOldChat_session = function () {
    var self = this;
    self.listChatContainer.addEventListener("scroll", function () {
        if (self.listChatContainer.scrollTop + self.listChatContainer.offsetHeight + 1 >= self.listChatContainer.scrollHeight) {
            self.data.loadChat_sessionsOldFunc().then(function (values) {
                self.drawListMessage(values);
            });
        }
    });
};

theme.ChatBar.prototype.editNameGroup = function(item){
    var self = this;
    var nameElt = absol.$('.card-manage-group-name', self.manageModal);
    DOMElement.removeAllChildren(nameElt);
    var name_inputtext = DOMElement.input({
        attrs: {
            className: "card-manage-group-name-input",
            onkeydown: function(event){
                if (event.keyCode == 13) saveFunc();
            },
            value: item.name
        }
    });
    nameElt.appendChild(name_inputtext);
    name_inputtext.focus();
    var editElt = absol.$('.card-manage-group-edit-btn-ctn', self.manageModal);
    DOMElement.removeAllChildren(editElt);
    var saveNameBtn = absol.buildDom({
        tag: 'button',
        class:['card-transparent-btn', 'card-manage-group-edit-btn'],
        child: 'span.mdi.mdi-check'
    });
    editElt.appendChild(saveNameBtn);
    var saveFunc = function(){
        var name =  name_inputtext.value.trim();
        if (name == ""){
            ModalElement.alert({message: LanguageModule.text("war_txt_no_name")});
            return;
        }
        item.changeNameGroupFunc(name).then(function(value){
            item.name = name;
            DOMElement.removeAllChildren(nameElt);
            nameElt.appendChild(DOMElement.textNode(name));
            DOMElement.removeAllChildren(editElt);
            editElt.appendChild(absol.buildDom({
                tag: 'button',
                class:['card-transparent-btn', 'card-manage-group-edit-btn'],
                child: 'span.mdi.mdi-pencil-outline',
                on: {
                    click: function(){
                        self.editNameGroup(item);
                    }
                }
            }));
            for (var i = 0; i < self.listChatView.length; i++){
                if (self.listChatView[i].name == item.id){
                    self.listChatView[i].elt.name = name;
                }
            }
            for (var i = 0; i < self.listChatBoxOpen.length; i++){
                if (self.listChatBoxOpen[i].name == item.id){
                    self.listChatBoxOpen[i].chatBox.titleChat.textContent = name;
                }
            }
        });
    };
    saveNameBtn.on('click', function(){
        saveFunc();
    });
};

theme.ChatBar.prototype.manageGroup = function(item){
    // console.log(item);
    var self = this;
    item.memberList.getIndex = function(id){
       for (var i = 0; i < item.memberList.length; i++){
           if (item.memberList[i].id == id) return i;
       }
       return -1;
    };
    var addMemberSubmit = function(members_group_select){
        var listMemberAdd = members_group_select.values;
        if (listMemberAdd.length == 0){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_no_member")
            });
            return;
        }
        self.frameList.removeLast();
        window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
        item.addMemberGroupFunc(listMemberAdd).then(function(value){
            var userIndex, fullname = "";
            for (var i = 0; i < listMemberAdd.length; i++){
                userIndex = self.usersList.getIndex(listMemberAdd[i]);
                if (i > 0) fullname += ", ";
                fullname += self.usersList[userIndex].fullname;
                item.memberList.push({
                    id: listMemberAdd[i],
                    username: self.usersList[userIndex].username,
                    fullname: self.usersList[userIndex].fullname,
                    avatarSrc: self.usersList[userIndex].avatarSrc,
                    privilege: (systemconfig.userid == listMemberAdd[i])? 2 : 0
                });
            }
            drawListMember();
            for (var i = 0; i < self.listChatView.length; i++){
                if (self.listChatView[i].name == item.id){
                    self.listChatView[i].elt.messagetext = "Bạn vừa thêm "+ fullname + " vào cuộc trò chuyện.";
                    self.listChatContent.insertBefore(self.listChatView[i].elt, self.listChatContent.firstChild);
                    self.listChatView[i].elt.new_noseen = 0;
                }
            }
            for (var i = 0; i < self.listChatBoxOpen.length; i++){
                if (self.listChatBoxOpen[i].name == item.id){
                    self.listChatBoxOpen[i].chatBox.addMessage(value);
                }
            }
        });
    };
    var addMember = function(){
        var items = [];
        for (var i = 0; i < self.data.listUserAdd.length; i++){
            if (item.memberList.getIndex(self.data.listUserAdd[i].value) >= 0) continue;
            items.push(self.data.listUserAdd[i]);
        }
        var members_group_select = absol.buildDom({
            tag: 'mselectbox',
            class: "card-chat-members-group-select",
            props: {
                items: items,
                enableSearch: true
            }
        });
        var header = absol.buildDom({
            tag: 'mheaderbar',
            props: {
                actionIcon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "arrow_back_ios"
                }),
                title: LanguageModule.text("txt_add_to_group"),
                commands: [{
                    icon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "save"
                    })
                }]
            },
            on: {
                action: function(){
                    self.frameList.removeLast();
                    window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                },
                command: function(){
                    addMemberSubmit(members_group_select);
                }
            }
        });
        var addMemberElt = absol.buildDom({
            tag: 'tabframe',
            child:[
                header,
                DOMElement.div({
                    attrs: {
                        className: "card-mobile-content"
                    },
                    children: [members_group_select]
                })
            ]
        });
        self.frameList.addChild(addMemberElt);
        window.backLayoutFunc.push(function(){
            self.frameList.removeLast();
            window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
        });
        addMemberElt.requestActive();
        carddone.sessionIdActive = 0;
    };


    var removeMember = function(userid){
        item.removeMemberFunc(userid).then(function(value){
            var uIndex = item.memberList.getIndex(userid);
            var fullname = item.memberList[uIndex].fullname;
            item.memberList.splice(uIndex, 1);
            drawListMember();
            for (var i = 0; i < self.listChatView.length; i++){
                if (self.listChatView[i].name == item.id){
                    self.listChatView[i].elt.messagetext = "Bạn vừa xoá "+ fullname + " khỏi cuộc trò chuyện.";
                    self.listChatContent.insertBefore(self.listChatView[i].elt, self.listChatContent.firstChild);
                    self.listChatView[i].elt.new_noseen = 0;
                    break;
                }
            }
            for (var i = 0; i < self.listChatBoxOpen.length; i++){
                if (self.listChatBoxOpen[i].name == item.id){
                    self.listChatBoxOpen[i].chatBox.addMessage(value);
                    break;
                }
            }
        });
    };

    var removeMemberConfirm = function(userid){
        var uIndex = item.memberList.getIndex(userid);
        ModalElement.question2({
            title: LanguageModule.text('txt_remove_member'),
            message: LanguageModule.text2("war_txt_remove_member", [item.memberList[uIndex].fullname]),
            onclick: function(sel){
                if (sel == 0){
                    removeMember(userid);
                }
            }
        });
    };
    var listMemberElt = absol.buildDom({
        class: 'card-manage-group-participants-ctn',
        child: [
            DOMElement.div({
                attrs: {
                    className: "card-manage-group-participants-title"
                },
                text: LanguageModule.text2("txt_participants", [item.memberList.length])
            }),
            DOMElement.div({
                attrs: {
                    className: "card-manage-group-participants-content"
                }
            })
        ]
    });
    var drawListMember = function(){
        item.memberList.sort(function(a, b){
            if (a.id == systemconfig.userid) return 1;
            if (absol.string.nonAccentVietnamese(a.fullname.toLowerCase()) > absol.string.nonAccentVietnamese(b.fullname.toLowerCase())) return 1;
            if (absol.string.nonAccentVietnamese(a.fullname.toLowerCase()) < absol.string.nonAccentVietnamese(b.fullname.toLowerCase())) return -1;
            return 0;
        });
        DOMElement.removeAllChildren(listMemberElt);
        var listMemberEltTemp = DOMElement.div({
            attrs: {
                className: "card-manage-group-participants-content"
            }
        });
        if (item.cardid == 0){
            listMemberEltTemp.appendChild(DOMElement.div({
                attrs: {
                    className: "card-manage-group-participants-member",
                    onclick: function(){
                        addMember();
                    }
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "card-manage-group-participants-member-avatar-ctn"
                        },
                        children: [DOMElement.div({
                            attrs: {
                                className: "card-manage-group-participants-member-avatar",
                                style: {
                                    backgroundImage: "url(add_member.png)"
                                }
                            }
                        })]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-manage-group-participants-member-name"
                        },
                        text: LanguageModule.text("txt_add_member")
                    })
                ]
            }));
        }
        var manageMemberElt, quickMenuItems;
        for (var i = 0; i < item.memberList.length; i++){
            manageMemberElt = DOMElement.div({});
            quickMenuItems = [];
            if (item.cardid == 0 && item.privilege >= 2 && systemconfig.userid != item.memberList[i].id){
                quickMenuItems.push({
                    text: LanguageModule.text("txt_remove_member"),
                    extendClasses: "bsc-quickmenu",
                    icon: {
                        tag: "i",
                        class: "material-icons",
                        child: { text: "delete" }
                    },
                    cmd: function(userid){
                        return function(){
                            removeMemberConfirm(userid);
                        }
                    }(item.memberList[i].id)
                });
            }
            if (quickMenuItems.length > 0){
                manageMemberElt = DOMElement.div({
                    attrs: {
                        className: "card-manage-group-participants-member-remove"
                    },
                    children: [DOMElement.i({
                        attrs: {
                            className: "material-icons card-icon-manage-member-chat"
                        },
                        text: "more_horiz"
                    })]
                });
                absol.QuickMenu.showWhenClick(manageMemberElt, {items: quickMenuItems}, [3, 4], function (menuItem) {
                    if (menuItem.cmd) menuItem.cmd();
                });
            }
            listMemberEltTemp.appendChild(DOMElement.div({
                attrs: {
                    className: "card-manage-group-participants-member"
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "card-manage-group-participants-member-avatar-ctn"
                        },
                        children: [DOMElement.div({
                            attrs: {
                                className: "card-manage-group-participants-member-avatar",
                                style: {
                                    backgroundImage: "url(" + item.memberList[i].avatarSrc + ")"
                                }
                            }
                        })]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "card-manage-group-participants-member-name"
                        },
                        text: item.memberList[i].fullname
                    }),
                    manageMemberElt
                ]
            }));
        }
        listMemberElt.appendChild(DOMElement.div({
            attrs: {
                className: "card-manage-group-participants-title"
            },
            text: LanguageModule.text2("txt_participants", [item.memberList.length])
        }));
        listMemberElt.appendChild(listMemberEltTemp);
    };
    drawListMember();
    var bodyManager = absol.buildDom({
        class: 'card-manage-group-body',
        child:[
            {
                class: 'card-manage-group-name-ctn',
                child:[
                {
                    class: 'card-manage-group-name',
                    child: {text: item.name}
                },
                {
                    class: 'card-manage-group-desc',
                    // child: {text: 'Active now'}
                },
                {
                    class: 'card-manage-group-edit-btn-ctn',
                    child:{
                    tag: 'button',
                    class:['card-transparent-btn', 'card-manage-group-edit-btn'],
                    child: 'span.mdi.mdi-pencil-outline'
                    }
                }
                ]
            },
            {
                class: 'card-manage-group-demarcation-line'
            },
                listMemberElt
        ]
    });
    if (item.cardid == 0){
        bodyManager.appendChild(absol.buildDom({
            class: 'card-manage-group-demarcation-line'
        }));
        bodyManager.appendChild(absol.buildDom({
            class: 'card-manage-group-body-delete-leave',
            on: {
                click: function(){
                    self.deleteGroupConfirm(item);
                }
            },
            child: DOMElement.span({
                text: LanguageModule.text("txt_delete_conversation")
            })
        }));
        bodyManager.appendChild(absol.buildDom({
            class: 'card-manage-group-demarcation-line'
        }));
        bodyManager.appendChild(absol.buildDom({
            class: 'card-manage-group-body-delete-leave',
            style: {
                color: "red"
            },
            on: {
                click: function(){
                    self.leaveGroupConfirm(item);
                }
            },
            child: DOMElement.span({
                text: LanguageModule.text("txt_leave_group")
            })
        }));
        if (item.privilege >= 2){
            bodyManager.appendChild(absol.buildDom({
                class: 'card-manage-group-demarcation-line'
            }));
            bodyManager.appendChild(absol.buildDom({
                class: 'card-manage-group-body-delete-leave',
                style: {
                    color: "red"
                },
                on: {
                    click: function(){
                        self.dissolveGroupConfirm(item);
                    }
                },
                child: DOMElement.span({
                    text: LanguageModule.text("txt_dissolve_group")
                })
            }));
        }
    }
    var manageGroupDiv = absol.buildDom({
        tag: "tabframe",
        class: "card-manage-group",
        child: [
            {
                class: "card-manage-group-header",
                child: [
                {
                    class: 'card-manage-group-avatar-block',
                    child: [
                    {
                        class: 'card-manage-group-avatar-image',
                        style:{
                        'background-image': 'url(' + item.avatarSrc + ')'
                        }
                    },
                    {
                        class: ['card-manage-group-avatar-status-dot']
                    }
                    ]
                },
                {
                    class:'card-manage-group-close-btn-ctn',
                    child: {
                    tag: 'button',
                    class:['card-transparent-btn', 'card-manage-group-close-btn'],
                    child: 'span.mdi.mdi-close',
                    on: {
                        click: function(){
                            self.frameList.getAllChild()[0].requestActive();
                            window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
                        }
                    }
                    }
                }
                ]
            },
            bodyManager
        ]
    });
    self.manageModal = manageGroupDiv;
    window.backLayoutFunc.push(function(){
        self.frameList.getAllChild()[0].requestActive();
        window.backLayoutFunc.splice(window.backLayoutFunc.length - 1, 1);
    });
    self.frameList.addChild(self.manageModal);
    self.manageModal.requestActive();
    var editNameBtn = absol.$('.card-manage-group-edit-btn', self.manageModal);
    editNameBtn.on('click', function(){
        self.editNameGroup(item);
    });
    var saveAvatarFunc = function(src){
        item.changeAvatarGroupFunc(src).then(function(value){
            for (var i = 0; i < self.listChatView.length; i++){
                if (self.listChatView[i].name == item.id){
                    self.listChatView[i].elt.avatarSrc = src;
                }
            }
            item.avatarSrc = src;
            avtElt.style.backgroundImage = "url("+src+")";
        });
    };
    var avtElt = absol.$('.card-manage-group-avatar-image', self.manageModal);
    avtElt.on('click', function(){
        pizo.xmlModalDragImage.createModal(document.body,function(){
            var src = pizo.xmlModalDragImage.imgUrl.src;
            saveAvatarFunc(src);
        });
    });
};

theme.ChatBar.prototype.searchFunc = function () {
    console.log(111111111);
};

theme.ChatBar.prototype.getView = function () {
    var self = this;
    self.usersList.getIndex = function(id){
        for (var i = 0; i < self.usersList.length; i++){
            if (self.usersList[i].id == id) return i;
        }
        return -1;
    };
    this.getMessView();
    this.getMessOpenChat();
    this.inputsearchbox = absol.buildDom({
        tag: 'searchcrosstextinput',
        props: {
            placeholder: LanguageModule.text("txt_search")
        }
    });
    var header = absol.buildDom({
        tag: 'mheaderbar',
        class: "am-small-title",
        props: {
            // actionIcon: "span.mdi.mdi-magnify",
            title: "", //LanguageModule.text("txt_search_card"),
            commands: [
                {
                    icon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "group_add"
                    })
                }
            ]
        },
        data: {
            searchInput: self.inputsearchbox
        },
        on: {
            // click: {callback: function (event) {
            //     if (!absol.EventEmitter.hitElement(this.$right, event) && !this.containsClass("am-search-mode")) {
            //         header.searchMode(true);
            //     }
            // }, cap:true},
            command: function () {
                self.addgroupFunc();
            }
        }
    });

    this.listChatBoxOpen = [];

    this.listChatView = [];
    this.listChatContent = absol._({
        class: "chats-theme-mobile-list-message-content"
    });
    this.listChatContainer = DOMElement.div({
        attrs: {
            className: "chats-theme-mobile-list-message-container"
        },
        children: [this.listChatContent]
    });
    this.view = DOMElement.div({
        children: [
            header,
            DOMElement.div({
                attrs: {
                    className: "chats-theme-mobile-list-message"
                },
                children: [this.listChatContainer]
            })
        ]
    })
    this.drawListMessage(this.data, this.openChat, this.sessionActive);
    this.loadOldChat_session();
    carddone.listTabChat.status = 1;
    return this.view;
};

theme.formChatsInit = function (params) {
    params.frameList = absol.buildDom({
        tag: "frameview",
        class: "main-frame-view",
        style: {
            width: "100%",
            height: "100%"
        }
    });
    params.chatBar = new theme.ChatBar(params);
    params.holder.addChild(params.frameList);
    var x = absol.buildDom({
        tag: 'tabframe',
        child: [
            params.chatBar.getView()
        ]
    });
    params.frameList.addChild(x);
    x.requestActive();
    carddone.sessionIdActive = 0;
};
ModuleManagerClass.register({
    name: "Chats_view",
    prerequisites: ["ModalElement"]
});
