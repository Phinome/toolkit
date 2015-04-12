(function (window, baidu, esui, undefined) {
    "use strict";
/**
 * 复合筛选树
 * 
 * @param {Object} options 参数
 */
esui.CheckboxTree = function(options) {
    this._type = 'checkboxtree';
    esui.TreeView.call(this, options);
    this.value = this.value || [];
};

esui.CheckboxTree.prototype = {
    _cachingValue: function () {
        this._valueMap = {};
        
        for ( var i = 0, len = this.value.length; i < len; i++ ) {
            this._valueMap[this.value[i]] = 1;
        }
    },

    render: function () {
        this._cachingValue();
        esui.TreeView.prototype.render.call(this);
    },
    
    getItemHtml: function (item) {
        var me = this;
        return esui.util.format(
                '<input class="{5}" type="checkbox" id="{0}" cnodeId="{1}" onclick="{3}"{4}/><label for="{0}">{2}</label>',
                this._getCBId(item),
                item.id,
                item.text,
                this.__getStrRef() + '._nodeCBClick(this)',
                (me._valueMap[item.id + ''] ? ' checked' : ''),
                me.__getClass( 'checkbox' )
            );
    },
    _nodeCBClick: function (dom) {
        var id = dom.getAttribute('cnodeId'),
            item  = this._dataMap[id];

        this._selectCBNode(id);
        //console.log(this.value, this._valueMap);
        this.onselect(this.value, this._valueMap, id, item);
    },
    _selectCBNode: function (nodeId) {
        var me = this
        var nodeData = this._dataMap[ nodeId ];
        var currCb = baidu.g(this._getCBId(nodeData));
        var checked = currCb.checked;
        
        this._updateCBChild( nodeId, checked );
        this._updateCBParent( nodeId );
        
        if ( checked ) {
            me._valueMap[ nodeId ] = 1;
        } else {
            delete me._valueMap[ nodeId ];
        }
        
        me._updateSelected();
    },
    _getCBId: function (item) {
        var me = this;
        return me.id + 'treenode' + item.id;
    },
    _updateCBParent: function (id /*, dontUpdateValue */) {
        var me = this;
        var nodeData = this._dataMap[id];
        var currCb = baidu.g(this._getCBId(nodeData));
        var parentUL = currCb.parentNode.parentNode.parentNode.parentNode;
        var parentId, parentData, children, childLen, checked, cb;
        var count, len;
        
        if (parentUL 
            && parentUL.tagName == 'UL' 
            && (parentId = parentUL.getAttribute('value'))
        ) {
            parentData = this._dataMap[parentId];
            children = parentData.children;
            childLen = children instanceof Array && children.length;
            checked = true;
            count = childLen;
            len = childLen;
            
            while ( childLen-- ) {
                cb = baidu.g(this._getCBId(children[childLen]));
                if ( !cb.checked) {
                    count--;
                    checked = false;
                    //break;
                }
            }
            

            if (count && !checked) {
                //baidu.g(this._getCBId(parentData)).indeterminate = true;
                baidu.g(this._getCBId(parentData)).checked = false;
                me._valueMap[parentId] = 1;
            } else {
                //baidu.g(this._getCBId(parentData)).indeterminate = false;
                baidu.g(this._getCBId(parentData)).checked = checked;
                me._valueMap[parentId] = checked;
            }
            
            // !dontUpdateValue && (me._valueMap[parentId] = !!checked);
        }
        
        parentId && this._updateCBParent(parentId, 1);
    },

    _updateCBChild: function ( id, checked ) {
        var me = this;
        var nodeData = this._dataMap[id];
        var children = nodeData.children;
        var childLen = children instanceof Array && children.length;
        var data;
        var cb;
        
        if ( childLen ) {
            while ( childLen-- ) {
                data = children[ childLen ];
                cb = baidu.g( this._getCBId( data ) );
                this._updateCBChild( data.id, checked );
                cb.checked = checked;
                if ( checked ) {
                    me._valueMap[ data.id ] = 1;
                } else {
                    delete me._valueMap[ data.id ];
                }
            }
        }
    },
    
    _treeSelectAll: function (checked) {
        this._valueMap = {};
        var treeMain = this.main;
        var cbs = treeMain.getElementsByTagName('input');
        var cbsLen = cbs.length;
        var cb;
        var cbId;
        
        while ( cbsLen-- ) {
            cb = cbs[cbsLen];
            cbId = cb.getAttribute('cnodeId');
            if ( cbId ) {
                cb.checked = !!checked;
                checked && (this._valueMap[cbId] = 1);
            }
        }
        
        this._updateSelected();
    },
    
    treeSelectAll: function () {
        this._treeSelectAll(true);
    },
    
    treeSelectNone: function () {
        this._treeSelectAll(false);
    },
    
    treeSelectReverse: function (data) {
        var doUpdate = 0;
        if ( !data ) {
            data = this.datasource;
            doUpdate = 1;
        }
        
        var children = data.children;
        var i;
        var len = children instanceof Array && children.length;
        var checked = true;
        var itemChecked;
        var cb = baidu.g( this._getTreeCBId( data ) );
        if (!cb) {return true;}
        if ( len ) {
            for ( i = 0; i < len; i++ ) {
                itemChecked = this.treeSelectReverse( children[ i ] );
                checked = checked && itemChecked;
            }
            cb.checked = checked;
        } else {
            checked = !cb.checked;
            cb.checked = checked;
        }
        
        this._valueMap[ data.id ] = checked;
        if ( doUpdate ) {
            this._updateSelected();
        }
        return checked;
    },
    
    _updateSelected: function (data) {
        if ( !data ) {
            this.value = [];
            data = this.datasource;
        }
        
        var childs = data.children;
        var len = childs instanceof Array && childs.length;
        var i;
        var checked = true;
        var item;
        var itemChecked;
        var values = [];
        
        if ( len ) {
            for ( i = 0; i < len; i++ ) {
                item = childs[ i ];
                itemChecked = this._updateSelected( item );
                checked = checked && itemChecked;
                itemChecked && values.push(item.id);
            }

            if ( values.length > 0 ) {
                this.value.push.apply(this.value, values);
            }
        } else {
            checked = !!this._valueMap[data.id];
        }
        
        this._valueMap[ data.id ] = checked;
        return checked;
    },
    
    
    /**
     * 设置控件为readOnly
     * 
     * @public
     * @param {boolean} readOnly
     */
    setReadOnly: function (readOnly) {
        this.readOnly = readOnly = !!readOnly;
        readOnly ? this.setState('readonly') : this.removeState('readonly');
    },
    
    
    /**
     * 获取当前选中的值
     * 
     * @public
     * @return {string}
     */
    getValue: function() {
        return this.value;
    },
    
    /**
     * 根据值选择选项
     *
     * @public
     * @param {string} value 值
     */
    setValue: function ( value ) {
        this.value = value;
    },
    
    onselect: new Function(),
    
    /**
     * 释放控件
     * 
     * @public
     */
    dispose: function () {
        var me = this;
        
        me.onchange = null;
        me.main.onclick = null;
        ui.Base.dispose.call(me);
    }
};

esui.CheckboxTree.getUID = function () {
    var index = 0;
    var prefix = '_CheckboxTree_';

    return function () {
        return prefix + (index++);
    };
}();

baidu.inherits(esui.CheckboxTree, esui.TreeView);

})(window, window.baidu, window.esui);
