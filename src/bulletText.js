!function(factory){
    if(typeof define === 'function' && define.amd){
        // AMD
        define(factory);
    } else {
        // Browser globals
        factory();
    };
}(function(){
    var u = { // utility
        elm: function(selector){
            return document.querySelectorAll(selector);
        },
        ,
    },
    tmpl = {
        track: '<div class="bulletT-track"></div>',
        text: '<span class="bulletT-text" style="margin-left:{{left}};">{{text}}</span>',
    };
    options = {};

    var config = {};
    var bulletText = {
        init: function(opt){
            ;
        },
        fire: function(bullets){},
    };

    if(typeof define != 'undefined' && define.amd){
        return bulletText;
    } else {
        window.bulletText = bulletText;
    }
});