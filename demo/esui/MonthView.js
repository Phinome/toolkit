/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MonthView.js
 * desc:    日历月份显示单元
 * author:  erik, zhaolei
 */

///import esui.Control;
///import baidu.lang.inherits;
///import baidu.dom.g;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;

/**
 * date:    2015-02-28
 * des:     新增多选模式
 * author:  Phinome
 */

/**
 * 日历月份显示单元
 *
 * @param {Object} options 控件初始化参数
 */
esui.MonthView = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = "month";

    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );

    // 添加多选操作
    this._mode = this.mode || 'single';
    this._valueView = this._valueView || [];

    this.now = this.now || esui.config.NOW || new Date();
    var viewBase = this.valueAsDate || this.now;
    this.year = parseInt( this.year, 10 ) || viewBase.getFullYear();
    this.month = parseInt( this.month, 10 ) || viewBase.getMonth();
};

esui.MonthView.prototype = {
    /**
     * 设置当前显示的月份日期
     *
     * @public
     * @param {Date} view 当前显示的月份日期
     */
    setView: function ( view ) {
        this.month = view.getMonth();
        this.year = view.getFullYear();
        this.render();
    },

    /**
     * 获取当前选择的日期
     *
     * @public
     * @return {Date}
     */
    getValueAsDate: function () {
        if(this._mode === 'multi') {
            return this._valueView.length > 1 ? this._valueView : this._valueView[0];
        }
        return this.valueAsDate || null;
    },

    /**
     * 选择日期
     *
     * @public
     * @param {Date} date 要选择的日期
     */
    setValueAsDate: function ( date ) {
        var me = this;
        if ( date instanceof Date ) {
            var pos = -1;

            if(this._mode === 'single') {
                me._resetSelected();
                me.valueAsDate = date;
            } else {
                T.array.each(me._valueView, function(item,index) {
                    // time 之差不超过 24 小时， item 与 date 的时间相差 8 个小时。
                    if( item.setHours(0) === date.getTime() ) {
                        pos = index;
                    }
                });
                // 这里要确保 me.valueAsDate 为 false ，防止 _resetSelected 和  _paintSelected 执行。
                me.valueAsDate = pos !== -1 ? me._valueView.splice(pos,1)[0] : !me._valueView.push(date);
                me._resetSelected();

            }

            me._paintSelected();
        } else if( date instanceof Array)  {
            me._valueView = date;
            me._resetSelected();
            me._paintSelected();
        }
    },

    /**
     * 绘制控件
     *
     * @public
     */
    render: function () {
        esui.Control.prototype.render.call( this );
        this.main.innerHTML = this._getHtml();
        this.setValueAsDate( this.valueAsDate || this.now );
    },

    /**
     * 日期的模板
     * @private
     */
    _tplItem: '<td year="{1}" month="{2}" date="{0}" class="{4}" style="{5}" id="{3}" onmouseover="{6}" onmouseout="{7}" onclick="{8}">{0}</td>',

    /**
     * 日期表格头的模板
     * @private
     */
    _tplHead: '<table border="0" cellpadding="0" cellspacing="0" class="{0}"><thead><tr>',

    /**
     * 标题显示配置
     */
    TITLE_WORDS: ['一', '二', '三', '四', '五', '六', '日'],

    /**
     * 获取控件的html
     *
     * @private
     * @return {string}
     */
    _getHtml: function () {
        var me = this,
            html        = [ esui.util.format( me._tplHead, me.__getClass( 'main' ) ) ],
            index       = 0,
            year        = me.year,
            month       = me.month,
            repeater    = new Date( year, month, 1 ),
            nextMonth   = new Date( year, month + 1, 1 ),
            begin       = 1 - ( repeater.getDay() + 6 ) % 7,
            titles      = me.TITLE_WORDS,
            tLen        = titles.length,
            tIndex,
            virtual,
            overClass   = me.__getClass( 'over' ),
            virClass    = me.__getClass( 'item-virtual' ),
            itemClass   = me.__getClass( 'item' ),
            currentClass,
            customClass,
            overHandler = "baidu.addClass(this, '" + overClass + "')",
            outHandler  = "baidu.removeClass(this, '" + overClass + "')";

        // 绘制表头
        for ( tIndex = 0; tIndex < tLen; tIndex++ ) {
            html.push( '<td class="' + me.__getClass('title') + '">' + titles[ tIndex ] + '</td>' );
        }
        html.push( '</tr></thead><tbody><tr>' );
        repeater.setDate( begin );

        // 绘制表体
        while ( nextMonth - repeater > 0 || index % 7 !== 0 ) {
            if ( begin > 0 && index % 7 === 0 ) {
                html.push( '</tr><tr>' );
            }

            virtual = (repeater.getMonth() != month);

            // 构建date的css class
            currentClass = itemClass;
            customClass = me._getCustomDateValue( 'customClass', repeater );

            virtual && (currentClass += ' ' + virClass);
            customClass && (currentClass += ' ' + customClass);

            html.push( esui.util.format(
                me._tplItem,
                repeater.getDate(),
                repeater.getFullYear(),
                repeater.getMonth(),
                me._getItemId( repeater ),
                currentClass,
                me._getCustomDateValue( 'customStyle', repeater ),
                ( virtual ? '' : overHandler ),
                ( virtual ? '' : outHandler ),
                ( virtual ? '' : me.__getStrRef() + "._selectByItem(this)" )
            ) );

            repeater = new Date( year, month, ++begin );
            index ++;
        }

        html.push( '</tr></tbody></table>' );
        return html.join( '' );
    },

    /**
     * 获取日期的用户自定义属性值
     *
     * @private
     * @param {string} name 属性名
     * @param {Date} date 日期
     * @return {string}
     */
    _getCustomDateValue: function ( name, date ) {
        var value = this[ name ];
        var valueType = typeof value;

        switch ( valueType ) {
            case 'string':
                return value;
                break;
            case 'function':
                return value.call( this, date ) || '';
                break
        }

        return '';
    },

    /**
     * 通过item的dom元素选择日期
     *
     * @private
     * @param {HTMLElement} item dom元素td
     */
    _selectByItem: function ( item ) {
        var date  = item.getAttribute( 'date' ),
            month = item.getAttribute( 'month' ),
            year  = item.getAttribute( 'year' );

        this._change( new Date( year, month, date ) );
    },

    onchange: new Function(),

    /**
     * 选择当前日期
     *
     * @private
     * @param {Date} date 当前日期
     */
    _change: function ( date ) {
        if ( !date ) {
            return;
        }

        if ( this.onchange( date ) !== false ) {
            this.setValueAsDate( date );
        }
    },

    /**
     * 清空选中的日期
     *
     * @private
     */
    _resetSelected: function () {
        var me = this,
            item;

        if ( me.valueAsDate ) {
            item = baidu.g( me._getItemId( me.valueAsDate ) );
            item && baidu.removeClass( item, me.__getClass( 'selected' ) );
            me.valueAsDate = null;
        }
    },

    /**
     * 绘制选中的日期
     *
     * @private
     */
    _paintSelected: function () {
        var me = this,
            item;

        if ( me._mode === 'single' && me.valueAsDate ) {
            var date = me.valueAsDate;
            item = baidu.g( me._getItemId( date ) );

            item && baidu.addClass( item, me.__getClass( 'selected' ) );
        } else if( me._valueView.length > 0 ) {
            var len = me._valueView.length;

            for( var i = 0; i < len; i ++ ) {
                item = baidu.g( me._getItemId( me._valueView[i] ) );
                item && baidu.addClass( item, me.__getClass( 'selected' ) );
            }
        }
    },

    /**
     * 获取日期对应的dom元素item的id
     *
     * @private
     * @param {Date} date 日期
     * @return {string}
     */
    _getItemId: function ( date ) {
        return this.__getId(
            date.getFullYear()
            + '-' + date.getMonth()
            + '-' + date.getDate()
        );
    }
};

baidu.inherits( esui.MonthView, esui.Control );