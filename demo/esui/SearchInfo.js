(function (window, baidu, esui, undefined) {
    "use strict";
/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/SearchInfo.js
 * desc:    搜索条件信息控件
 * author:  zhaolei,erik,lanxiaobin
 * date:    $Date: 2011/02/25 11:30:39 $
 */

/**
 * 搜索条件信息控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.SearchInfo = function (options) {
    this._type = "searchInfo";
    esui.Control.call(this, options);
    this.__initOptions(options);
    this.separator = this.separator || ' | ';
};

esui.SearchInfo.prototype = {
    /**
     * 渲染控件
     * 
     * @protected
     * @param {Object} main 控件挂载的DOM
     */
    render: function () {
        var me = this,
            main = me.main;
        
        if(!this.isRendered){
            esui.Control.prototype.render.call(me);
            me._isRendered = true;
        }
        if(main){
            main.innerHTML = me.getHtml();
            main.style.display = (me.isShow ? '' : 'none');
        }
    },
    
    /**
     * 获取关闭按钮的html
     * 
     * @private
     * @return {string}
     */
    getCloseHtml: function () {
        var me = this,
            type = 'close';
            
        return esui.util.format(me.tplClose,
                            me.__getClass(type),
                            me.__getId(type),
                            me.__getStrRef() + '.closeHandler(event)',
                            me.__getStrCall('closeOver'),
                            me.__getStrCall('closeOut'));
    },
    
    /**
     * 获取左边小图标的html
     * 
     * @private
     * @return {string}
     */
    getIconHtml: function () {
        return '';
        //esui.util.format(this.tplIcon, this.__getClass('icon'));
    },
    
    /**
     * 获取search信息的html
     * 
     * @private
     * @return {string}
     */
    getHtml: function () {
        return this.getIconHtml()
                + this.getTextHtml()
                + this.getCloseHtml();
    },
    
    /**
     * 获取信息内容部分的html
     * 
     * @private
     * @return {string}
     */
    getTextHtml: function () {
        var me = this,
            text = [],
            value = this.text,
            tpl = this.template,
            ignore = this.ignore || '';

        this.isShow = false;
        value = this.encodeValue(value);
        if (esui.util.hasValue(value) && value !== ignore) {
            /**
             * @todo 这里做了简单的wbr，可以判断英文后面才加wbr
             * @author lanxiaobin
             */
            /*
            value = value.split('');
            for(var i = 0;i<value.length;i++){
                    if(/[a-zA-Z]/.test(value[i])){
                        value[i] += '<wbr/>';
                }
            }
            value = value.join("");
            */
        //.join('<wbr/>');
             text.push(esui.util.format(tpl, value));
             this.isShow = true;
        }
        
        return esui.util.format(this.tplText,
                            this.__getClass('text'),
                            text.join(this.separator)
        );
    },
    
    /**
     * 对value进行html转义
     * 
     * @param {string} value
     * @return {string}
     */
    encodeValue: function (value) {
        if (typeof value == 'string') {
            return baidu.encodeHTML(value);
        }
        
        return value;
    },
    
    /**
     * 信息内容部分html模板
     * 
     * @private
     */
    //tplText: '<div class="{0}">{1}</div>',
    tplText: '<span class="{0}">{1}</span>', //modified by zhangpingan
    
    /**
     * 小图标部分html模板
     * 
     * @private
     */
    tplIcon: '<div class="{0}"></div>',
    
    /**
     * 关闭按钮部分html模板
     * 
     * @private
     */
    //tplClose: '<div class="{0}" id="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">清空</div>',
    tplClose: '<span class="{0}" id="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">清空</span>', //modified by zhangpingan
    
    /**
     * 隐藏区域
     * 
     * @private
     */
    hide: function () {
        try {
            baidu.hide(this.main||this._main);
        } catch (e) {}
    },
    
    /**
     * onclose事件预声明，容错
     * 
     * @public
     */
    onclose: new Function(),
    
    /**
     * close按钮点击的handler
     * 
     * @private
     */
    closeHandler: function (e) {
        //add by zhaoran 2012-11-19
        var event = new baidu.event.EventArg(e);
        if (this.onclose(event) !== false) {
            this.hide();
        }
    },
    
    /**
     * 获取close按钮元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getClose: function () {
        return baidu.g(this.__getId('close'));
    },
    
    /**
     * 鼠标移上close按钮的handler
     * 
     * @private
     */
    closeOver: function () {
        baidu.addClass(this.getClose(), 
                       this.__getClass('close') + '-hover');
    },
    
    /**
     * 鼠标移出close按钮的handler
     * 
     * @private
     */
    closeOut: function () {
        baidu.removeClass(this.getClose(), 
                          this.__getClass('close') + '-hover');
    }
};

baidu.inherits(esui.SearchInfo, esui.Control);

})(window, window.baidu, window.esui);
