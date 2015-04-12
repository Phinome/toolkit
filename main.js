/**
 * Created by phinome on 3/31/15.
 * @description: A collection of snippets functions
 *
 */

"use strict";

var proxy = function(func , thisObject) {
    return (
        function() {
            return func.apply(thisObject,arguments);
        }
    )
};


/**
 * 循环遍历数组集合
 *
 * @inner
 * @param {Array} source 数组源
 * @param {function(Array,Number):boolean} iterator 遍历函数
 */
var each = function(source, iterator) {
    if (source instanceof Array) {
        for (var i = 0, len = source.length; i < len; i++) {
            if (iterator(source[i], i) === false) {
                break;
            }
        }
    }
};
