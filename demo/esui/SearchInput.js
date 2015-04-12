(function (window, baidu, esui, undefined) {
    "use strict";
/*
 * trionesUI
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    ui/SearchInput.js
 * desc:    搜索框控件
 * author:  lanxiaobin, miaojian
 * date:    2011/02/24
 */

/**
 * 搜索框控件
 *
 * @param {Object} options 控件初始化参数
 */
esui.SearchInput = function(options){
    this._type = "searchinput";

    esui.InputControl.call(this, options);
    
    this.__initOptions(options);
    this._controlMap = {};

    /* 初始化默认参数*/
    this.__initOption('placeholder', null, 'PLACEHOLDER');
    this.__initOption('width', null, 'WIDTH');
    this.__initOption('btntext', null, 'BUTTON_TEXT');

    /**
     * input设定的水平方向上的border和padding和
     * 
     * @type {number}
     */
    this.extraWidth = this.extraWidth || 38;

    this._searchHandler = this._getSearchHandler();
};

esui.SearchInput.PLACEHOLDER = '';//"请输入关键字" by zhangpingan
esui.SearchInput.WIDTH = 155;
esui.SearchInput.BUTTON_TEXT = '搜索';

esui.SearchInput.prototype = {
    _tplMain : ''
        + '<div class="{0}">'
            + '<input ui="id:{1};type:TextInput;" type="text" maxlength="30" style="{5}"/>'
            + '<div class="{2}" id="{3}" onclick="{4}"></div>'
        +'</div>',

    /**
     * 当search的时候执行
     * @public
     * @params {string} keyword
     */
    onsearch : new Function(),

    /**
     * 获取主区域模板
     * @private
     */
    _getMainHtml : function(){
        var me = this;
        return esui.util.format(me._tplMain,
            me.__getClass('wrap'),
            me.__getId('input'),
            me.__getClass('button'),
            me.__getId('button'),
            me.__getStrRef() + '._searchHandler(this)',
            (me.width ? me.getWidthStyleStr(me.width) : ''));
    },

    /**
     * 为了方便，input设了box-sizing，但
     * ie7下不支持，so，在此做hack
     * 
     * @param {number} width 宽度
     * @return {string} stylesheet 字符串
     */
    getWidthStyleStr: function(width) {

        if (!width) {
            return '';
        }

        var ie7Width = width - this.extraWidth;

        return ';width:' + width + 'px;*width:' + ie7Width + 'px;';
    },

    /**
     * 获取search时的事件回调方法
     * @private
     */
    _getSearchHandler : function(){
        var me = this;
        return function() {

            var value = me._controlMap.input.getValue();
            me.onsearch(value);
        };
    },

    setValue : function(v){
        this._controlMap.input.setValue(v || '');
        return v || '';
    },

    /**
     * 获取search value
     * @public
     * @return {String} value
     */
    getValue : function() {
        return this._controlMap.input.getValue();
    },
    /**
     * 清空
     * @public
     */
    reset : function(){
        this.setValue('');
        return '';
    },
    /**
     * 渲染ui
     * @public
     * @params {object} main
     */
    render : function(main){
        var me = this,
            input = me.__getId('input'),
            button = me.__getId('button'),
            controlMap = {},
            uiProp = {},
            main = me.main;

        if(!this.isRendered){
            esui.InputControl.prototype.render.call(me);

            main.innerHTML = me._getMainHtml();

            uiProp[input] = {
                'value'       : me.value,
                'placeholder' : me.placeholder
            };

            main.style.width = me.width + 'px';

            controlMap = esui.init(main, uiProp);
            /* 初始化状态事件 */
            input = controlMap[input];
            me._controlMap.input = input;

            input.onenter = me._getSearchHandler();

            me._isRendered = true;

        }

        //refresh
        if (main) {
            me.setValue(me.value);
        }
    },

    /**
     * 释放控件
     * @public
     */
    dispose: function() {
        this._controlMap.input.onenter = null;
        ui.Base.dispose.call(this);
    }
};

baidu.inherits(esui.SearchInput, esui.InputControl);

})(window, window.baidu, window.esui);