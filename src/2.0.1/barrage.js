/*
 * barrage.js - a widget to show barrage.
 *
 * Released under the MIT license
 *
 * See https://github.com/riotkkwok/barrage for details
 *
 * Auther: Rio Kwok
 *
 * Version: 2.0.1
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
        text: {
            // mode 1
            '1': '<span class="bulletT-text ready" style="transition:{{trst}};" data-initTime="{{initTime}}">{{text}}</span>',
            // mode 2
            '2': '<span class="bulletT-text ready">{{text}}</span>'
        }
    },
    options = {

        // the container selecter
        container: '#bulletArea',

        // mandatory
        // display mode, 1 - horizontal, 2 - vertical
        mode: null,

        // the number of lines to show bullets
        // take effect only when mode is 1
        lines: 1,

        // discard the bullets cannot be handled immediately while receiving
        discard: true, 

        // defines the rule to discard, 0 - first come first serve, 1 - last come first serve, 2 - random
        // takes effect only when discard is true
        discardRule: 0, 

        // cache size, 0 or negative num - no cache
        // takes effect only when discard is false
        cacheSize: 10,

        // the max-length of character in the bullet
        charLimit: 50,

        // ms, 
        // while mode is 1, the duration to show each bullet in the container;
        // while mode is 2, the interval time to show the pending bullets, 
        // if equals to 0, the bullets are shot immediately;
        // Notice: if speed is larger than 0 but discard is true, nothing will be shot.
        speed: 5000,

        // the maximum number of bullets to show per time
        // takes effect only when mode is 2
        maxShot: 1,

        // the maximum number of bullets to show on screen
        // takes effect only when mode is 2
        screenSize: 10,

        // px, the horizontal spacing between bullets
        // takes effect only when mode is 1
        spacing: 10, 

        // run clean func per X bullets
        clean: 20, 

        // debug mode
        debug: false || location.hash === '#debug'

    },
    lineState = {
        list: [], // the available time for each bullet line.
        bulletInList: [],
        bulletCount: 0,
        maxTime: 0,
        intervalST: null,
        getIdleTrackIndex: function(){
            var t = [];
            if(options.mode === 1){
                for(var i=0; i<this.list.length; i++){
                    this.list[i] < (+new Date) && t.push(i);
                }
            }else if(options.mode === 2){
                t[0] = 0;
            }
            return t;
        },
        setIdleTime: function(listIndex, time){
            if(options.mode === 1){
                this.list[listIndex] = +new Date + time;
                if(!options.discard && options.cacheSize > 0){
                    setTimeout(this.idleHandler, time+10); // add 10ms to avoid timer calculation mistake
                }
            }else if(options.mode === 2){
                if(options.speed <= 0){
                    setTimeout(this.idleHandler, 0);
                }else{
                    this.intervalST || (this.intervalST = setInterval(this.idleHandler, options.speed));
                }
            }
        },
        idleHandler: function(){
            if(cacheList.length > 0 && !isStopped){
                options.debug && console.log('idleHandler() cacheList: '+cacheList.length);
                isTime2Fire = true;
                barrage.fire(cacheList.splice(0, cacheList.length));
                isTime2Fire = false;
            }
        }
    },
    dom = {
        tracks: [],
        stylesheet: {
            // mode 1
            '1': '.bulletT-track{position:relative;} .bulletT-text{position:absolute; left:100%; white-space:nowrap; z-index: 10;}',
            // mode 2
            '2': '.bulletT-track{position:absolute; bottom: 0;} .bulletT-text.ready{display: none;}'
        }
    },
    cacheList = [],
    isStopped = false,
    isInited = false,
    isTime2Fire = false;

    function insertStyle(){
        var s = document.createElement('style');
        s.innerHTML = dom.stylesheet[options.mode];
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
        if(options.mode === 1){
            return tmpl.text['1']
                .replace(/\{\{initTime\}\}/g, ((new Date).getMinutes()+':'+((new Date).getSeconds())))
                .replace(/\{\{trst\}\}/g, 'left 0s linear')
                .replace(/\{\{text\}\}/g, str);
        }else if(options.mode === 2){
            return tmpl.text['2'].replace(/\{\{text\}\}/g, str);
        }else{
            return '';
        }
    }

    function renderAnim(elm){
        var tmpL, tmpT;
        if(options.mode === 1){
            // calc the running speed and distance
            tmpL = -1 * (elm.offsetWidth + options.spacing);
            // tmpL = -1 * (parseInt(window.getComputedStyle(elm,null).width, 10) + options.spacing);
            tmpT = -1*tmpL / (w.width / options.speed) + options.speed;
            elm.style.cssText += 'transition-duration: ' + (tmpT / 1000).toFixed(2) + 's;';
            elm.style.cssText += 'left: ' + tmpL +'px;';
        }else if(options.mode === 2){
            ;
        }
        return tmpT || 0;
    }

    function load(bl, tracks){
        var tmpElm, len = 0;
        if(!bl || bl.length === 0){
            return;
        }

        if(typeof tracks === 'number'){
            len = tracks;
        }else if(tracks instanceof Array){
            len = tracks.length;
        }

        for(var i=0; i<len; i++){
            if(!bl || bl.length === 0) break;
            tmpElm = dom.tracks[tracks[i] || 0].appendChild(document.createElement('div'));
            tmpElm.outerHTML = renderBullet(bl.shift());
        }
    }

    function shoot(){
        var now = Date.now();
        var tmpT, bl = u.elm(options.container+' .bulletT-text.ready'),
            delList = [], delCount = 0,
            idleTrack = lineState.getIdleTrackIndex();
        for(var i=0; i<bl.length; i++){
            // render animation
            tmpT = renderAnim(bl[i]);

            if(options.mode === 1){
                // calc idle time
                lineState.maxTime = Math.max(lineState.maxTime, tmpT);
                lineState.setIdleTime(idleTrack[i], tmpT - options.speed);

                // calc the bullet to be cleaned
                lineState.bulletCount++;
                lineState.bulletInList[idleTrack[i]]++;
                if(lineState.bulletCount >= options.clean){
                    delCount = lineState.bulletCount;
                    delList = delList.concat(lineState.bulletInList);
                    clean(delList, lineState.maxTime);
                    lineState.maxTime = 0;
                    lineState.bulletCount = 0;
                    for(var j=0; j<lineState.bulletInList.length; j++){
                        lineState.bulletInList[j] = 0;
                    }
                }
            }
        }
        if(options.mode === 2){
            // calc the bullet to be cleaned
            lineState.bulletInList[0] = lineState.bulletCount = u.elm(options.container+' .bulletT-text').length - options.screenSize;
            delList = delList.concat(lineState.bulletInList);
            if(lineState.bulletCount > 0){
                clean(delList, 0);
                lineState.bulletInList[0] = lineState.bulletCount = 0;
            }
        }
        u.removeClass(bl, 'ready');
        tmpL = tmpT = bl = delList = delCount = null;
        options.debug && console.log('shoot() takes: '+ (Date.now() - now)+' ms');
    }

    function clean(list, time){
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
            if(!!isInited){
                return;
            }
            if(opt.mode === 1){
                w.width = u.elm(options.container)[0].offsetWidth;
                // w.width = parseInt(window.getComputedStyle(u.elm(options.container)[0],null).width, 10);
            }else if(opt.mode === 2){
                opt.lines != undefined && (opt.lines = 1);
            }else{
                console.error('Error: mode is illegal or undefined.');
                return;
            }
            u.extendObj(options, opt);
            renderTracks(options.lines);
            dom.tracks = u.elm(options.container+' .bulletT-track');
            insertStyle();
            if(options.mode === 2){
                lineState.setIdleTime();
            }
            isInited = true;
        },
        fire: function(bullets){
            var bl2load, 
                idleTrack = lineState.getIdleTrackIndex();

            if(bullets.length === 0 || isStopped){
                return;
            }

            // filter bullets
            if(!!options.discard){ // discard redundant bullets
                if(options.mode === 1){
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
                            console.error('Error: discardRule is illegal or undefined.');
                        }
                    }else{
                        bl2load = [].concat(bullets);
                    }
                }else if(options.mode === 2){
                    if(options.speed <= 0){
                        if(options.discardRule === 0){
                            bl2load = bullets.splice(0, options.maxShot);
                        }else if(options.discardRule === 1){
                            bl2load = bullets.splice(-1*options.maxShot);
                        }else{
                            // TODO
                            console.error('Error: discardRule is illegal or undefined.');
                        }
                    }else{ 
                        options.debug && console.log('Illegal value of discard and speed while mode is 2.');
                        return;
                    }
                    idleTrack = options.maxShot;
                }
            }else{ // cache redundant bullets
                if(options.mode === 1){
                    if(cacheList.length < options.cacheSize){
                        // TODO - wrong logic
                        cacheList = cacheList.concat(bullets.splice(0, options.cacheSize - cacheList.length));
                        bl2load = cacheList.splice(0, idleTrack.length);
                    }else{
                        bl2load = bullets.splice(0, idleTrack.length);
                    }
                    if(idleTrack.length === 0){ // no idle track
                        bl2load = null;
                        return;
                    }
                }else if(options.mode === 2){
                    if(options.speed <= 0 || !!isTime2Fire){
                        bl2load = bullets.splice(0, options.maxShot);
                        cacheList = cacheList.concat(bullets.splice(0, options.cacheSize - cacheList.length));
                    }else{
                        cacheList = cacheList.concat(bullets.splice(0, options.cacheSize - cacheList.length));
                    }
                    idleTrack = options.maxShot;
                }
            }

            // load bullets
            load(bl2load, idleTrack);

            // shoot the bullets
            shoot();
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
