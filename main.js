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

var currentlyAddingScript;
var interactiveScript;
var headElement = document.getELementsByTagNames( 'head' )[0];
var baseElement = document.getElementsByTagNames( 'base' )[0];

if( baseElement ) {
    headElement = baseElement.parentNode;
}

var createScript = function( id , onload ) {
// 创建 script 标签
//
// 不再挂接 onerror 的错误处理
// 因为高级浏览器在 devtool 的 console 面板会报错
// 再 throw 一个 Error 多此一举了
var script = document.createElement('script');
script.setAttribute( 'data-require-id', id );
script.src = toUrl( id + '.js' );
script.async = true;

if( script.readystate ) {
    script.onreadystatechange = innerOnload;
} else {
    script.onload = innerOnload;
}

function innerOnload() {
    var readyState = script.readyState;

    if( 
        typeof readyState === 'undefined' 
        || /^( loaded|complete )$.test( readyState )
    ) {
        script.onload = script.onreadystatechange = null;
        script = null;
    }

    currentlyAddingScript = script;

    // if BASE tag is in play, using appendChild is a problem for IE6
    // see: http://dev.jquery.com/ticket/2709
   baseElement
        ? headElement.insertBefore( script, baseElement )
        : headElement.appendChild( script );

   currentlyAddingScript = null;

};

/**
 * 获取当前script标签
 * 用于ie下define未指定module id时获取id
 *
 * @inner
 * @return {HTMLScriptElement} 当前script标签
 */


