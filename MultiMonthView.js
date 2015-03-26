/**
 * Created by phinome on 2/28/15.
 */

/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path:    ui/MultiMonthView.js
 * desc:    多视图日历月份显示单元
 * author:  Long.phinome<at>google.com
 */

///import esui.Control;
///import baidu.lang.inherits;
///import baidu.dom.g;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;
///import esui.MonthView

/// input  : [unixTime,....]
/// output : [unixTime,....]

/**
 * 多日历多选日期选择器
 *
 * @param {Object} options 控件初始化参数
 */
esui.MultiMonthView = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = "multimonth";

    esui.Control.call( this, options );

    // 日期格式化方式初始化
    this.__initOption( 'dateFormat', null, 'DATE_FORMAT' );
    this.__initOption( 'valueFormat', null, 'VALUE_FORMAT' );

    // 初始化面板数量
    this.viewNumer = this.viewNumer || 3;

    this.value = this.value || this.datasource;

    // 初始化显示日期的年月
    this._date = (this.value instanceof Array && new Date(this.value[0]) ) || new Date();


};

esui.MultiMonthView.VALUE_FORMAT = 'yyyy-MM-dd';

esui.MultiMonthView.prototype = {

    /**
     * 绘制控件
     *
     * @public
     */
    render: function () {
        var me = this,
            main = this.main;

        if (!me._isRendered) {
            esui.InputControl.prototype.render.call(me);
            //UI初始化
            main.innerHTML = me._getHtml();
            me._controlMap = esui.init(main);

            // 为 monthView 绑定 onchange 事件
            for(var i = 0; i < me.viewNumer; i++) {
                me._controlMap[me.__getId("view" + i)].onchange = me._change();
            }

            //日历选择前进按钮事件挂接
            me._controlMap["next"].onclick = me._getNextHandler();
            //日历选择后退按钮事件挂接
            me._controlMap["prev"].onclick = me._getPrevHandler();

            me._isRendered = true;
        }

        me.setValueAsDate( me.value );
    },


    /**
     * 日期的模板
     * @private
     */
    _tplItem:   '<div class="{0}">' +
                    '<div class="{1}" ui="type:Label;id:{7};text:{4}年{6}月"></div>' +
                    '<div class="{2}" ui="type:MonthView;id:{3};year:{4};month:{5};mode:multi;" yearMonth="{4}-{5},{3}"></div>' +
                '</div>',


    /**
     * 日期的主体部分
     * @private
     */
    _tplBody:   '<div class="{0}">' +
                    '<div class="{1}"><div ui="type:Button;id:prev;skin:back;"></div></div>' +
                    '{3}' +
                    '<div class="{2}"><div ui="type:Button;id:next;skin:forward;"></div></div>' +
                '</div>',


    /**
     * 获取控件的html
     *
     * @private
     * @return {string}
     */
    _getHtml: function () {
        var me = this,
            html;



        html = esui.util.format(me._tplBody ,
            me.__getClass("view"),
            me.__getClass("prev"),
            me.__getClass("next"),
            me._getMonthViewHTML()
        );

        return html;
    },

    _getMonthViewHTML: function() {
        var me = this,
            list = [],
            month = me._date.getMonth(),
            year = me._date.getFullYear(),
            i;

        for(i = 0; i < me.viewNumer; i++) {
            // MonthView 控件里会对月份加 1
            list.push(
                esui.util.format(me._tplItem ,
                    me.__getClass("item"),
                    me.__getClass("item-title"),
                    me.__getClass("item-content"),
                    me.__getId("view" + i),
                    year,
                    month + i,
                    (month + 1) + i,
                    me.__getId("label" + i)
                )

            );
        }

        return list.join('');
    },

    /**
     * [_filter] 过滤data以月为单位组成数组
     * @private
     * @param data
     * @return Object
     */

    _filter: function(data) {
        var me = this,
            i = 0,
            j,
            start = 0,
            index,
            value = [],
            temp,
            o = {};

        data = esui.util.hasValue(data) ? data : me.value;

        if(data instanceof Array && data.length > 0) {
            T.array.each(data, function (item) {
                value.push(new Date(item));
            });

            while (i < value.length) {
                index = i;
                temp = [];

                if (value[i + 1]) {
                    if (value[i].getFullYear() !== value[i + 1].getFullYear() ||
                        value[i].getMonth() !== value[i + 1].getMonth()
                    ) {
                        for (j = start; j <= index; j++) {
                            temp.push(value[j]);
                        }
                        start = index + 1;
                        o[value[i].getFullYear() + '-' + value[i].getMonth()] = temp;
                    }
                } else {
                    for (j = start; j < value.length; j++) {
                        temp.push(value[j]);
                    }
                    o[value[i].getFullYear() + '-' + value[i].getMonth()] = temp;
                }

                i++;
            }
        }

        return o;

    },

    /**
     * [_repaint]
     * @private
     * @param date
     * @return void
     */
    _repaint: function( date ) {

        if ( !esui.util.hasValue( date ) ) {
            date = this._date;
        }

        var me = this,
            year = date.getFullYear(),
            month = date.getMonth(),
            res,
            i;

        res = me._filter();

        for( i = 0; i < me.viewNumer; i++ ) {
            me._controlMap[me.__getId('view') + i].setView( new Date( year , (month + i), 1 ) );
            me._controlMap[me.__getId('label') + i].setContent( T.date.format( new Date( year , (month + i), 1 ) , "yyyy年MM月") );

            if (res[year + '-' + (month + i)]) {
                me._controlMap[me.__getId('view') + i].setValueAsDate( res[year + "-" + (month + i)] );
            }
        }

        this._date = date;

    },

    /**
     * 清空所选的日期
     *
     */
    _resetSelected: function () {

    },

    /**
     * 选择当前日期
     *
     * @private
     * @return function
     */
    _change: function () {
        var me = this;

        return function(date) {
            var value = [];

            if (!date) {
                return;
            }

            if (date instanceof Date && me.value.length > 0) {

                T.array.each(me.value, function (item) {
                    value.push( new Date(item).setHours(0) );
                });

                var pos = value.indexOf(date.getTime());

                return pos !== -1 ? me.value.splice(pos, 1) : me.value.push(date),date;
            }
        }
    },

    /**
     * 获取“下三个月”按钮点击的handler
     *
     * @private
     * @return {Function}
     */
    _getNextHandler: function () {
        var me = this;
        return function() {
            var date = me._date,
                year = date.getFullYear(),
                month = date.getMonth();

            me._repaint( new Date( year, month + 1, 1 ) );
        }
    },

    /**
     * 获取“上三个月”按钮点击的handler
     *
     * @private
     * @return {Function}
     */
    _getPrevHandler: function () {
        var me = this;
        return function() {
            var date = me._date,
                year = date.getFullYear(),
                month = date.getMonth();

            me._repaint( new Date( year, month - 1, 1 ) );
        }
    },

    /**
     * 获取当前选取的日期(字符串表示)
     *
     * @public
     * @return {string}
     */
    getValue: function () {
        if ( this.value.length > 0 ) {
            return T.array.each( this.value, function(item) {
                T.date.format( item, this.valueFormat );
            })
        }

        return '';
    },

    /**
     * 设置当前选取的日期
     *
     * @public
     * @param {string} value 选取的日期(字符串表示)
     */
    setValue: function ( value ) {
        if( !(value instanceof Array) || value.length < 0 ) {
            return;
        }
        var valueAsDate = [];

        T.array.each(value, function(item) {
           valueAsDate.push( baidu.date.parse( item ) );
        });

        ( valueAsDate.length > 0 ) && ( this.setValueAsDate( valueAsDate ) );
    },

    getValueAsDate: function() {
        var me = this,
            view = me._filter(),
            res = [];

        T.array.each(view, function(item,index) {
            res = res.concat(
                me._controlMap[me.__getId("view" + index)].getValueAsDate()
            )
        });

        return T.array.unique(res, function(a,b) {
            if(a instanceof Date && b instanceof Date) {
                return Math.abs(a.getTime() - b.getTime()) < 10;
            }
        });

    },

    setValueAsDate: function(date) {
        var me = this,
            value = [];

        if( date instanceof Array || date.length > 0) {

            T.array.each(date, function(item) {
                value.push( new Date(item) ) ;
            });

            me.value = value.sort(function(item1 , item2) {
                return item1 - item2;
            });

            me._date = new Date(me.value[0]);

            me._repaint();
        }

    },

    /**
     * 释放控件
     *
     * @protected
     */
    __dispose: function () {
        this.onchange = null;
        esui.InputControl.prototype.__dispose.call( this );
    }
};

baidu.inherits( esui.MultiMonthView, esui.Control );

