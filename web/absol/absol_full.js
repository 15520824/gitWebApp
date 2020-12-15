//adapt type
import 'bsc_lib/adapt/String';
import 'bsc_lib/adapt/Date';
import 'bsc_lib/adapt/String';
import 'bsc_lib/adapt/Promise';
import 'bsc_lib/adapt/Math';
import 'bsc_lib/adapt/DomClass';

//special style
import 'bsc_lib/style/old.css';
import 'bsc_lib/style/common.css';
import 'bsc_lib/style/bootstrap.revert.css';
import 'bsc_lib/style/bsc.white.css';
import 'absol/src/absol';
import 'absol-vietnamese/dev';
import 'absol-acomp/dev';
import 'absol-mobile/dev';
import 'absol-vchart/src/vchart';
import 'absol-colorpicker/dev';
import Draggable from 'absol-acomp/js/Draggable';
import 'absol-card/dev';



//pizo package
import 'pizo/js/dom/Fcomp'; // only setup for Fcore //carddone only
import * as pizo from 'pizo/js/component/ModuleView'; //carddone only
import ModuleDatabaseHelp from 'pizo/js/component/ModuleDatabase';
import EditHelpContainer from 'pizo/js/component/EditHelpContainer';
import HelpContainer from 'pizo/js/component/HelpContainer';
import 'pizo/css/CardDone.css'; //carddone only
import xmlModalDragImage from 'pizo/js/component/modal_drag_drop_image'; //carddone only
import xmlModalDragManyFiles from 'pizo/js/component/modal_drag_drop_manyfiles'; //carddone only
import { descViewImagePreview } from 'pizo/js/component/ModuleImage';


import PhotoSwipeViewer from 'absol-photoswipeviewer';
import QuickMenu from 'absol-acomp/js/QuickMenu';
import Tooltip from 'absol-acomp/js/Tooltip';
// import WindowBox from 'absol-full/adapt/WindowBox';
import 'absol-acomp/js/adapter/FontAwesomeIconsAdapter';

// absol.coreDom.install(WindowBox);

import * as stringGen from 'absol/src/String/stringGenerate';
import * as stringMat from 'absol/src/String/stringMatching';
import * as stringForm from 'absol/src/String/stringFormat';
import * as search from "absol-acomp/js/list/search";
import url from 'url';

absol.url = url;
import JSZip from "jszip";
import LangSys from "absol/src/HTML5/LanguageSystem";

absol.JSZip = JSZip;
absol.string = Object.assign({}, absol.string || {});

Object.assign(absol.string, stringGen, stringMat, stringForm);
absol.QuickMenu = QuickMenu;
absol.Tooltip = Tooltip;
absol.search = search;

//for old plugin
absol.color = absol.Color;
absol.AComp = AComp;
absol.buildDom = absol._;
absol.buildSvg = absol._$;
absol.documentReady = absol.Dom.documentReady;
window.AComp = absol.AComp;
absol.PhotoSwipeViewer = PhotoSwipeViewer;
window.PhotoSwipeViewer = absol.PhotoSwipeViewer;
window.IFrameBridge = absol.IFrameBridge;

absol.event = absol.event || {};

absol.event.defineDraggable = Draggable;

absol.Dom.documentReady.then(function() {
    document.body.classList.add('bsc-white');
});

window.pizo = pizo; //carddone only
window.descViewImagePreview = descViewImagePreview; //cardone only
window.pizo.xmlModalDragImage = xmlModalDragImage; //carddone only
window.pizo.xmlModalDragManyFiles = xmlModalDragManyFiles; //carddone only
window.pizo.ModuleDatabaseHelp = ModuleDatabaseHelp;
window.pizo.EditHelpContainer = EditHelpContainer;
window.pizo.HelpContainer = HelpContainer;
// pizo module

//setup for lab
absol.MessageInput.iconAssetRoot = '/vivid_exticons';
absol.EmojiPicker.assetRoot = '/emoji';

LangSys.addExtension({
    getText: function() {
        if (window.LanguageModule) {
            this.getText = function() {
                var text = window.LanguageModule.text.apply(window.LanguageModule, arguments);
                if (text && (text.charAt(0) === '[' && text.charAt(text.level - 1) === ']')) return null;
                return text || null;
            }
        }
        return this.getText.apply(this, arguments);
    }
});

if (window.ModuleManagerClass)
    ModuleManagerClass.register("Absol");
