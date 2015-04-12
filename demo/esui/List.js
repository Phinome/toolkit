(function (window, core, esui, undefined) {
    "use strict";
    /**
     * datasource = {
     *    title : 'root',
     *    id: -1,
     *    children : [
     *      {
     *         title : 'xxx',
     *         id : xxx,
     *         children : [
     *         
     *         ]
     *      }
     *    ]
     * }
     */

    esui.List = function (options) {
        // 类型声明，用于生成控件子dom的id和class
        this._type = 'list';
        
        // 标识鼠标事件触发自动状态转换
        //this._autoState = 1;

        esui.Control.call(this, options);
    };

    esui.List.prototype = {
        __createDSMap : function () {
            var me = this,
                ds = me.datasource || [];

            me.map = {};
            core.array.each(ds, function (item) {
                me.map[item.id] = item;
            });
        },
        _tplNull : '<dd class="{0}">无</dd>',
        _tplMain : '<dl class="{0}"><dt class="{1}">{2}</dt><dl id="{4}">{3}</dl></dl>',
        _tplItem : '<dd class="{1}" id="{4}">{0}<i class="{2}" onclick="{3}"></i></dd>',
        _getMainHtml : function () {
            var itemHtml = [],
                me = this;

            baidu.array.each(me.datasource, function (item) {
                itemHtml.push(esui.util.format(
                    me._tplItem,
                    item.text,
                    me.__getClass('item'),
                    me.__getClass('item-remove'),
                    me.__getStrCall('_removeItem', item.id),
                    me.__getId('Item' + item.id)
                ));
            });
            return esui.util.format(
                me._tplMain,
                me.__getClass('block'),
                me.__getClass('title'),
                me.title,
                itemHtml.join('') || esui.util.format(me._tplNull, me.__getClass('item')),
                me.__getId('Body')
            );
        },
        _getBody : function () {
            return core.g(this.__getId('Body'));
        },
        /**
         * 渲染控件
         * 
         * @public
         */
        render: function () {
            var me   = this,
                main = me.main,
                ds = me.datasource;
            
            if (!me._isRendered) {

                esui.Control.prototype.render.call(me);
                // 初始化状态事件
                //main.onclick = me._getHandlerClick();
                me._isRendered = true;
            }
            this.__createDSMap();
            main.innerHTML = me._getMainHtml();
        },
        _getItemById : function (id) {
            return this.map[id] || null;
        },
        onremove : new Function(),
        _removeItemById : function (id) {
            var me = this,
                datasource = [];

            delete me.map[id];
            core.array.each(me.datasource, function (item) {
                if (item.id !== id) {
                    datasource.push(item);
                }
            });
            me.datasource = datasource;
            core.dom.remove(this.__getId('Item' + id));
            if (me.datasource.length <= 0) {
                me._getBody().innerHTML = esui.util.format(me._tplNull, me.__getClass('item'));
            }
        },
        _removeItem : function (id) {
            var me = this;
            if (this.onremove(id, this._getItemById(id)) !== false) {
                me._removeItemById(id);
            }
        },
        /**
         * 释放控件
         * 
         * @private
         */
        __dispose: function () {
            this.onclick = null;
            esui.Control.prototype.__dispose.call(this);
        }
    };

    core.inherits(esui.List, esui.Control);

})(window, window.baidu, window.esui);