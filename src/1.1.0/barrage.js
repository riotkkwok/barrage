/*
 * barrage.js - a widget to show barrage.
 *
 * Released under the MIT license
 *
 * See https://github.com/riotkkwok/barrage for details
 *
 * Auther: Rio Kwok
 *
 * Version: 1.1.0
 *
 */
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
        addClass: function(elms, cln){
            var tmp;
            if(!cln || !cln.trim()){
                return;
            }
            for(var i=0; i<elms.length; i++){
                tmp = elms[i].className;
                if(tmp.split(' ').indexOf(cln) < 0){
                    elms[i].className += ' '+cln;
                }
            }
        },
        removeClass: function(elms, cln){
            var tmp;
            if(!cln || !cln.trim()){
                return;
            }
            for(var i=0; i<elms.length; i++){
                tmp = elms[i].className;
                if(tmp.split(' ').indexOf(cln) >= 0){
                    elms[i].className = tmp.replace(cln, '');
                }
            }
        },
        extendObj: function(sObj, tObj){
            for(var key in tObj){
                if(tObj.hasOwnProperty(key)){
                    sObj[key] = tObj[key];
                }
            }
        },
        limitBytes: function(str) {
            var totalLength = 0;
            var charCode;
            for (var i = 0; i < str.length; i++) {
                charCode = str.charCodeAt(i);
                if (charCode <= 0x007f) {
                    totalLength += 1;
                } else if (charCode <= 0x07ff) {
                    totalLength += 2;
                } else if (charCode <= 0xffff) {
                    totalLength += 3;
                } else {
                    totalLength += 4;
                }
                if(totalLength > options.charLimit){
                    str = str.substring(0, i-1);
                    break;
                }
            }
            return str;
        }
    },
    w = {
        width: window.innerWidth,
    },
    tmpl = {
        track: '<div class="bulletT-track"></div>',
        text: '<span class="bulletT-text ready" style="transition:{{trst}};" data-initTime="{{initTime}}">{{text}}</span>',
    },
    options = {

        // the container selecter
        container: '#bulletArea',

        // the number of lines to show bullets
        lines: 3,

        // discard the bullet cannot be handle at the same time
        discard: true, 

        // take effect only when discard is true; 0 - first come first serve, 1 - last come first serve, 2 - random
        discardRule: 0, 

        // cache size, take effect only when discard is false, 0 or negative num - no cache
        cacheSize: 0,

        // the max-length of character in the bullet
        charLimit: 50,

        // ms, the duration to show each bullet in the container
        speed: 5000, 

        // px, the horizontal spacing between bullets
        spacing: 10, 

        // run clean func per X bullets
        clean: 20, 

        // debug mode
        debug: false || location.hash === '#debug'

    },
    lineState = {
        list: [],
        bulletInList: [],
        bulletCount: 0,
        maxTime: 0,
        getIdleTrackIndex: function(){
            var t = [];
            for(var i=0; i<this.list.length; i++){
                this.list[i] < (+new Date) && t.push(i);
            }
            return t;
        },
        setIdleTime: function(listIndex, time){
            this.list[listIndex] = +new Date + time;
            if(!options.discard && options.cacheSize > 0){
                setTimeout(this.idleHandler, time+10); // add 10ms to avoid timer calculation mistake
            }
        },
        idleHandler: function(){
            if(cacheList.length > 0 && !isStopped){
                barrage.fire(cacheList.splice(0, cacheList.length));
            }
        }
    },
    dom = {
        tracks: [],
        stylesheet: '.bulletT-track{position:relative;} .bulletT-text{position:absolute; left:100%; white-space:nowrap; z-index: 10;}',
    },
    cacheList = [],
    isStopped = false;

    function insertStyle(){
        var s = document.createElement('style');
        s.innerHTML = dom.stylesheet;
        u.elm('head')[0].appendChild(s);
    }

    function renderTracks(num){
        var str = '';
        for(var i=0; i<num; i++){
            str += tmpl.track;
            lineState.list.push(0);
            lineState.bulletInList.push(0);
        }
        u.elm(options.container)[0].innerHTML = str;
    }

    function renderBullet(str){
        str = u.limitBytes(str);
        return tmpl.text
            .replace(/\{\{initTime\}\}/g, ((new Date).getMinutes()+':'+((new Date).getSeconds())))
            .replace(/\{\{trst\}\}/g, 'left 0s linear')
            .replace(/\{\{text\}\}/g, str);
    }

    function shoot(){
        var now = Date.now();
        var tmpL, tmpT, bl = u.elm(options.container+' .bulletT-text.ready'),
            delList = [], delCount = 0,
            idleTrack = lineState.getIdleTrackIndex();
        for(var i=0; i<bl.length; i++){
            tmpL = -1 * (bl[i].offsetWidth + options.spacing);
            // tmpL = -1 * (parseInt(window.getComputedStyle(bl[i],null).width, 10) + options.spacing);
            tmpT = -1*tmpL / (w.width / options.speed) + options.speed;
            bl[i].style.cssText += 'transition-duration: ' + (tmpT / 1000).toFixed(2) + 's;';
            bl[i].style.cssText += 'left: ' + tmpL +'px;';
            lineState.maxTime = Math.max(lineState.maxTime, tmpT);
            lineState.setIdleTime(idleTrack[i], tmpT - options.speed);
            lineState.bulletCount++;
            lineState.bulletInList[idleTrack[i]]++;
            if(lineState.bulletCount >= options.clean){
                delCount = lineState.bulletCount;
                delList = delList.concat(lineState.bulletInList);
                clean(delCount, delList, lineState.maxTime);
                lineState.maxTime = 0;
                lineState.bulletCount = 0;
                for(var j=0; j<lineState.bulletInList.length; j++){
                    lineState.bulletInList[j] = 0;
                }
            }
        }
        u.removeClass(bl, 'ready');
        tmpL = tmpT = bl = delList = delCount = null;
        options.debug && console.log(Date.now() - now);
    }

    function clean(count, list, time){
        setTimeout(function(){
            var tmp;
            for(var i=0; i<options.lines; i++){
                tmp = dom.tracks[i].children;
                if(!list[i] || list[i]<=0 || tmp.length === 0 || list[i] > tmp.length){
                    continue;
                }
                for(var j=list[i]-1; j>=0; j--){
                    tmp[j].remove();
                }
            }
            list = null;
        }, time);
    }

    var barrage = {
        init: function(opt){
            u.extendObj(options, opt);
            w.width = u.elm(options.container)[0].offsetWidth;
            // w.width = parseInt(window.getComputedStyle(u.elm(options.container)[0],null).width, 10);
            renderTracks(options.lines);
            dom.tracks = u.elm(options.container+' .bulletT-track');
            insertStyle();
        },
        fire: function(bullets){
            var bl2load, tmpElm,
                idleTrack = lineState.getIdleTrackIndex();

            if(bullets.length === 0 || isStopped){
                return;
            }

            // filter bullets
            if(!!options.discard){ // discard redundant bullets
                if(idleTrack.length === 0){ // no idle track
                    return;
                }
                if(bullets.length > idleTrack.length){
                    if(options.discardRule === 0){
                        bl2load = bullets.splice(0, idleTrack.length);
                    }else if(options.discardRule === 1){
                        bl2load = bullets.splice(-1*idleTrack.length);
                    }else{
                        // TODO
                    }
                }else{
                    bl2load = [].concat(bullets);
                }
            }else{ // cache redundant bullets
                if(cacheList.length < options.cacheSize){
                    cacheList = cacheList.concat(bullets.splice(0, options.cacheSize - cacheList.length));
                    bl2load = cacheList.splice(0, idleTrack.length);
                }else{
                    bl2load = bullets.splice(0, idleTrack.length);
                }
                if(idleTrack.length === 0){ // no idle track
                    bl2load = null;
                    return;
                }
            }

            // load bullets
            for(var i=0; i<idleTrack.length; i++){
                tmpElm = dom.tracks[idleTrack[i]].appendChild(document.createElement('div'));
                tmpElm.outerHTML = renderBullet(bl2load.shift());
            }

            // shoot the bullets
            shoot();

            // return bl2load;
        },
        clearAll: function(){
            var tmp;
            lineState.bulletCount = 0;
            lineState.maxTime = 0;
            for(var i=0; i<options.lines; i++){
                lineState.bulletInList[i] = 0;
                tmp = dom.tracks[i].children;
                for(var j=tmp.length-1; j>=0; j--){
                    tmp[j].remove();
                }
            }
            cacheList = [];
            return true;
        },
        clearCache: function(){
            cacheList = [];
            return true;
        },
        resume: function(){
            isStopped = false;
        },
        stop: function(){
            isStopped = true;
        }
    };

    if(typeof define != 'undefined' && define.amd){
        return barrage;
    } else {
        window.barrage = barrage;
    }
});
