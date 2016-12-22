require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"DelaApp":[function(require,module,exports){
module.exports = angular.module('DelaApp', [
    'templates-html',
    'naver-weather',
    'firebaseApp',
    'ngTouch'
]).config(/* @ngInject */ ["$compileProvider", "$httpProvider", function ($compileProvider, $httpProvider) {
    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync(true);
}]);

},{}],1:[function(require,module,exports){
angular.module('templates-html', ['dela/delaCard.tpl.html', 'dela/loading.tpl.html']);

angular.module("dela/delaCard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dela/delaCard.tpl.html",
    "<div class=\"dela-card\" ng-class=\"{fold:!unfold}\">\n" +
    "    <div class=\"dela-card-header\">\n" +
    "        <span class=\"cal-level {{::calLevel}}\">{{::calLabel}}</span>\n" +
    "        <span class=\"zone {{::menu.zoneId}}\">{{::menu.zoneId}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"dela-card-content\">\n" +
    "        <img ng-src=\"{{::menu.imgSrc}}\" alt=\"{{::menu.en}}\" ng-click=\"toggle()\" />\n" +
    "        <div class=\"dela-card-section {{::menu.sectionId}}\">\n" +
    "            {{::menu.sectionName}}\n" +
    "        </div>\n" +
    "        <div class=\"dela-card-menu\" ng-click=\"toggle()\">\n" +
    "            <p><span class=\"title-ko\">{{::menu.ko}}</span></p>\n" +
    "            <p><span class=\"title-en\">{{::menu.en}}</span></p>\n" +
    "            <p>{{::calories | number}} kcal</p>\n" +
    "            <p ng-if=\"!menu.soldout\"><span class=\"price\">{{::price | number}} 원</span> <span class=\"discounted\">({{::discounted | number}} 원)</span></p>\n" +
    "            <p ng-if=\"menu.soldout\"><span class=\"soldout\">SOLD OUT</span></p>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- <div class=\"dela-card-footer\">\n" +
    "            <div class=\"vote\">\n" +
    "                <div class=\"gauge-box\">\n" +
    "                    <span class=\"gauge gauge-good\" ng-style=\"{width:likes + '%'}\"><b>{{likes}}%</b></span>\n" +
    "                    <span class=\"gauge gauge-bad\" ng-style=\"{width:dislikes + '%'}\"><b>{{dislikes}}%</b></span>\n" +
    "                </div>\n" +
    "                <div class=\"btn btn-good\" ng-click=\"good()\">\n" +
    "                    <span class=\"badge\">{{like | badge}}</span>\n" +
    "                </div>\n" +
    "                <div class=\"btn btn-bad\" ng-click=\"bad()\">\n" +
    "                    <span class=\"badge\">{{dislike | badge}}</span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div> -->\n" +
    "        <!-- <div class=\"dela-card-emblem\">\n" +
    "            <span ng-if=\"ratingOrder\" class=\"rating rating_{{ratingOrder}}\"></span>\n" +
    "        </div> -->\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("dela/loading.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dela/loading.tpl.html",
    "<div class=\"loading-wrap\">\n" +
    "    <img src=\"images/loading_apple.gif\" alt=\"loading\" />\n" +
    "</div>");
}]);

},{}],2:[function(require,module,exports){


function Count(count) {
    this.keyCode = count.keyCode;
    this.like = parseInt(count.likeCount);
    this.dislike = parseInt(count.dislikeCount);
}

Count.prototype = {
    getLikeRatio: function () {
        return this.getTotal() ? parseInt((this.like * 10000) / this.getTotal()) / 100 : 0;
    },
    getDislikeRatio: function () {
        return this.getTotal() ? parseInt((this.dislike * 10000) / this.getTotal()) / 100 : 0;
    },
    getTotal: function () {
        return this.like + this.dislike;
    }
};


var COUNT_URL = 'https://script.google.com/macros/s/AKfycbx-WG_T_qYlQIeSH2xbeyz1Ejw8HVqNtS7BFILZFVxXYzk1Idk/exec?callback=JSON_CALLBACK&action=';

/* @ngInject */
function CountSvc ($rootScope, JSONPSvc, Counts) {

    function counts(keyCodes, background) {
        return JSONPSvc.request(COUNT_URL + 'counts&keyCodes=' + _.map(keyCodes, function (keyCode) {
            return encodeURIComponent(keyCode);
        }).join(','), background).then(function (counts) {

            var countList = rating(_.map(counts, function (count) {
                return new Count(count);
            }));

            $rootScope.$broadcast('updateCounts', Counts.list = countList);
            return Counts.list;
        });
    }


    function rating(counts) {
        var filtered = _.filter(counts, function (count) {
            return count.like >= 5;
        });

        filtered.sort(function (l, h) {
            if (l.getLikeRatio() === h.getLikeRatio()) {
                return h.like - l.like;
            }
            return h.getLikeRatio() - l.getLikeRatio();
        });

        filtered[0] && (filtered[0].order = 1);
        filtered[1] && (filtered[1].order = 2);
        filtered[2] && (filtered[2].order = 3);

        return counts;
    }

    function like(card) {
        return JSONPSvc.request(COUNT_URL + 'good&keyCode=' + encodeURIComponent(card.keyCode));
    }

    function dislike(card) {
        return JSONPSvc.request(COUNT_URL + 'bad&keyCode=' + encodeURIComponent(card.keyCode));
    }

    function getCountByKeyCode(keyCode) {
        return _.findWhere(Counts.list, {
                keyCode: keyCode
            }) || new Count({ keyCode: keyCode, likeCount: 0, dislikeCount: 0 });
    }

    this.counts = counts;
    this.like = like;
    this.dislike = dislike;
    this.getCountByKeyCode = getCountByKeyCode;
}
CountSvc.$inject = ["$rootScope", "JSONPSvc", "Counts"];



require('DelaApp').service('CountSvc', CountSvc).value('Counts', {});
},{"DelaApp":"DelaApp"}],3:[function(require,module,exports){


function Card(menu) {

    // Zone info
    this.zoneId = menu.zoneId;

    // Section info
    this.sectionId = menu.sectionId;
    this.sectionName = _.unescape(menu.sectionName);

    // Menu info
    this.keyCode = menu.keyCode;
    this.cal = menu.cal;
    this.en = _.unescape(menu.en);
    this.ko = _.unescape(menu.ko);
    this.price = menu.price;
    this.soldout = menu.soldout;
    this.imgSrc = menu.product ? 'http://sdsfoodmenu.co.kr:9106/foodcourt/menu?menuId=' + menu.product : 'images/no-image.png';
}

var DELA_URL = 'https://script.google.com/macros/s/AKfycbxFhifcCIQst4i75OPBiPVwYwv154Si2woBJRTYBuxd817FrFeO/exec?callback=JSON_CALLBACK&action=';

/* @ngInject */
function DelaSvc(JSONPSvc, CountSvc, Cards, StoreSvc, FirebaseSvc) {

    this.getMenus = getMenus;
    this.getCards = getCards;
    this.getCounts = getCounts;

    function getMenus() {
        // return JSONPSvc.request(DELA_URL + 'menus').then(afterGetMenus);
        return FirebaseSvc.getJamsilMenu().then(function (data) {
            Cards.list = data.menus;
            Cards.time = data.time;

            return Cards;
        });
    }



    function getMenuHash(cards) {
        return CryptoJS.SHA1(cards.map(function (card) {
            return card.keyCode;
        }).join('')).toString();
    }

    function afterGetMenus(data) {
        Cards.list = getCards(data.menus);
        Cards.hash = data.menuHash; // getMenuHash(Cards.list);
        Cards.time = data.menuTime;
        StoreSvc.storeMenuHash(Cards.hash);
        getCounts();
        return Cards;
    }

    function getCards(menus) {
        return _.map(menus, function (menu) {
            return new Card(menu);
        });
    }



    function getCounts() {
        CountSvc.counts(Cards.list.map(function (card) {
            return card.keyCode;
        }), true);
    }
}
DelaSvc.$inject = ["JSONPSvc", "CountSvc", "Cards", "StoreSvc", "FirebaseSvc"];


/* @ngInject */
function DelaCtrl($document, $scope, DelaSvc, NaverWeatherAPI, StockSvc, FirebaseSvc) {

    DelaSvc.getMenus().then(function (cards) {
        $scope.menus = cards.list;
        $scope.time = cards.time;
    });

    $scope.orderFactor = ['', 'cal', 'price'];
    $scope.orderName = ['Place', 'Calories', 'Price'];
    $scope.orderIndex = 0;

    NaverWeatherAPI.getWeather().then(function (info) {
        try {
            $scope.weatherImg = info.weather.iconURL;
            $scope.weatherText = info.weather.weatherText;
            $scope.weatherTemperature = parseInt(info.weather.temperature);
            $scope.weatherPosition = [info.region.doName, info.region.siName, info.region.dongName].join(' ');
            $scope.weatherRcode = info.region.rcode;

            if (info.weather.weatherCode == "5") {
                $document.find('body').letItSnow();
            }
        } catch (e) {
            // do not anything
        }
    });

    StockSvc.getSDS().then(function (stock) {
        $scope.sdsStockSymbol = stock.symbol;
        $scope.sdsStockName = stock.Name;
        $scope.sdsStockPrice = stock.Bid || stock.LastTradePriceOnly;
        $scope.sdsStockChange = stock.Change;
        $scope.sdsStockChangeinPercent = stock.ChangeinPercent;
        $scope.sdsStockState = stock.Change[0] == '+' ? 'red' : stock.Change[0] == '-' ? 'blue' : '';
        /* $scope.sdsStockCurrency = stock.Currency; */
    });

    function toggleOrder() {
        $scope.orderIndex = ($scope.orderIndex + 1) % 3;
    }

    $scope.toggleOrder = toggleOrder;
}
DelaCtrl.$inject = ["$document", "$scope", "DelaSvc", "NaverWeatherAPI", "StockSvc", "FirebaseSvc"];


require('DelaApp').service('DelaSvc', DelaSvc).controller('DelaCtrl', DelaCtrl).value('Cards', {}).run(/* @ngInject */ ["$document", "$interval", function ($document, $interval) {

    $interval(function () {
        var footerSlide = $document.find('.footer a.slide');

        if (footerSlide.hasClass('out')) {
            footerSlide.removeClass('out');
        } else {
            footerSlide.addClass('out');
        }
    }, 5000);
}]);

},{"DelaApp":"DelaApp"}],4:[function(require,module,exports){

var CAL_LEVEL = {
        'SUPER_HIGH': 'super-high',
        'HIGH': 'high',
        'NORMAL': 'normal',
        'LOW': 'low',
        'SUPER_LOW': 'super-low'
    },
    CAL_LABEL = {
        'super-high': '초고칼로리',
        'high': '고칼로리',
        'normal': '표준칼로리',
        'low': '저칼로리',
        'super-low': '초저칼로리'
    };


function getZoneName(zoneId) {
    switch (zoneId) {
        case 'ZONE01':
            return 'B1F';
        case 'ZONE02':
            return 'B2F';
        default:
            return '';
    }
}

function numberify(str) {
    return str.replace(/\D/g, '');
}

function caloriesLevel(calories) {
    if (calories > 900) {
        return CAL_LEVEL.SUPER_HIGH;
    } else if (calories > 850) {
        return CAL_LEVEL.HIGH;
    } else if (calories < 600) {
        return CAL_LEVEL.SUPER_LOW;
    } else if (calories < 650) {
        return CAL_LEVEL.LOW;
    } else {
        return CAL_LEVEL.NORMAL;
    }
}

function discount(price) {
    if (price == 5500) {
        return 2500;
    }
    return price - 2500;
}



/* @ngInject */
function CardDirective(CountSvc, DelaSvc, StoreSvc) {

    return {
        restrict: 'E',
        templateUrl: 'dela/delaCard.tpl.html',
        scope: true,
        replace: true,
        link: function (scope) {

            var menu = scope.menu,
                calories = numberify(menu.cal),
                price = numberify(menu.price);

            scope.zoneName = getZoneName(menu.zoneId);
            scope.calories = calories;
            scope.calLevel = caloriesLevel(calories);
            scope.calLabel = CAL_LABEL[scope.calLevel];
            scope.price = price;
            scope.discounted = discount(price);
            
            function setCount(count) {
                scope.like = count.like;
                scope.dislike = count.dislike;
                scope.likes = count.getLikeRatio();
                scope.dislikes = count.getDislikeRatio();
                scope.ratingOrder = count.order;
            }

            scope.$on('updateCounts', function () {
                setCount(CountSvc.getCountByKeyCode(menu.keyCode));
            });

            scope.toggle = function () {
                scope.unfold = !scope.unfold;
            };

            scope.good = function () {
                
                if (!StoreSvc.getSupportLocalStorage()) {
                    return alert('Currently browser can not use some features.\n- Vote');
                }

                if (StoreSvc.isVotedHash(menu.keyCode)) {
                    return alert('You already voted');
                }

                CountSvc.like(menu).then(function () {
                    var count = CountSvc.getCountByKeyCode(menu.keyCode);
                    count.like++;
                    setCount(count);
                    StoreSvc.storeVoteHash(menu.keyCode);
                }).then(DelaSvc.getCounts);
            };

            scope.bad = function () {

                if (!StoreSvc.getSupportLocalStorage()) {
                    return alert('Currently browser can not use some features.\n- Vote');
                }

                if (StoreSvc.isVotedHash(menu.keyCode)) {
                    return alert('You already voted');
                }

                CountSvc.dislike(menu).then(function () {
                    var count = CountSvc.getCountByKeyCode(menu.keyCode);
                    count.dislike++;
                    setCount(count);
                    StoreSvc.storeVoteHash(menu.keyCode);
                }).then(DelaSvc.getCounts);
            };
        }
    };
}
CardDirective.$inject = ["CountSvc", "DelaSvc", "StoreSvc"];


require('DelaApp').directive('delaCard', CardDirective);
},{"DelaApp":"DelaApp"}],5:[function(require,module,exports){
/* @ngInject */
function FirebaseSvc($q) {

    this.getJamsilMenu = getJamsilMenu;

    function getJamsilMenu() {
        return $q(function (resolve, reject) {
            return firebase.database().ref('delacourt/jamsil').on('value', function (data) {
                resolve(data.val());
            }, reject);
        });
    }
}
FirebaseSvc.$inject = ["$q"];



angular.module('firebaseApp', []).service('FirebaseSvc', FirebaseSvc);

},{}],6:[function(require,module,exports){

/* @ngInject */
function JSONPSvc($http, LoadingSvc) {

    function request(url, background) {

        if (!!background) {
            return $http.jsonp(url).then(function (res) {
                return res.data;
            });
        }

        var resolver = LoadingSvc.loading();

        return $http.jsonp(url).then(function (res) {
            resolver();
            return res.data;
        }, resolver);
    }

    this.request = request;
}
JSONPSvc.$inject = ["$http", "LoadingSvc"];

require('DelaApp').service('JSONPSvc', JSONPSvc);
},{"DelaApp":"DelaApp"}],7:[function(require,module,exports){

/* @ngInject */
function LoadingSvc($templateCache, $q) {
    
    var loadingTemplate = $templateCache.get('dela/loading.tpl.html'),
        element = angular.element(loadingTemplate);
    
    function loading() {
        
        var defer = $q.defer();
        
        element.appendTo('body');
        
        defer.promise.then(function () {
            element.remove();
        });
        
        return function () {
            defer.resolve();
        };
    }
    
    this.loading = loading;
}
LoadingSvc.$inject = ["$templateCache", "$q"];

require('DelaApp').service('LoadingSvc', LoadingSvc);
},{"DelaApp":"DelaApp"}],8:[function(require,module,exports){

var WEST_CAMPUS = 'https://script.google.com/macros/s/AKfycbyJ_LVJvLMYQEYyycw0yJkZj6mbuEGQkjMuZEEq3ZiUl4IFB5lx/exec?lat=37.518142&lng=127.10065';

/* @ngInject */
function NaverWeatherAPI($q) {

    function getWeather() {
        return $q.reject();

        // return $http.jsonp(WEST_CAMPUS + '&callback=JSON_CALLBACK').then(function (res) {
        //     return res.data.result;
        // });
    }

    this.getWeather = getWeather;

}
NaverWeatherAPI.$inject = ["$q"];



angular.module('naver-weather', []).service('NaverWeatherAPI', NaverWeatherAPI);

},{}],9:[function(require,module,exports){


var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22018260.ks%22)%0A%09%09&format=json&diagnostics=true&env=http%3A%2F%2Fdatatables.org%2Falltables.env&callback=JSON_CALLBACK';

/* @ngInject */
function StockSvc ($http) {
    
    function getSDS() {
        return $http.jsonp(url).then(function (res) {
            return res.data.query && res.data.query.results && res.data.query.results.quote;
        });
    }
    
    this.getSDS = getSDS;
}
StockSvc.$inject = ["$http"];

require('DelaApp').service('StockSvc', StockSvc);
},{"DelaApp":"DelaApp"}],10:[function(require,module,exports){

var ls = window.localStorage;

/* @ngInject */
function StoreSvc(Cards) {
    
    var supportLocalStorage = true;

    function loadMenuHash() {
        return ls.getItem('dela-mini-recent-menu-hash');
    }

    function storeMenuHash(menuHash) {
        var recentMenuHash = loadMenuHash();

        if (menuHash === recentMenuHash) {
            return;
        }

        try {
            ls.setItem('dela-mini-vote-hash', JSON.stringify([]));
            ls.setItem('dela-mini-recent-menu-hash', menuHash);
        } catch (e) {
            supportLocalStorage = false;
            alert('Currently browser can not use some features.\n- Vote');
        }
    }

    function loadVoteHashs() {
        return JSON.parse(ls.getItem('dela-mini-vote-hash'));
    }

    function isVotedHash(keyCode) {
        var voteHashs = loadVoteHashs(),
            voteCode = Cards.hash + keyCode;

        return _.contains(voteHashs, voteCode);
    }

    function storeVoteHash(keyCode) {
        var voteHashs = loadVoteHashs(),
            voteCode = Cards.hash + keyCode;

        voteHashs.push(voteCode);
        ls.setItem('dela-mini-vote-hash', JSON.stringify(voteHashs));
    }

    function getSupportLocalStorage() {
        return supportLocalStorage;
    }

    this.loadMenuHash = loadMenuHash;
    this.storeMenuHash = storeMenuHash;
    this.loadVoteHashs = loadVoteHashs;
    this.isVotedHash = isVotedHash;
    this.storeVoteHash = storeVoteHash;
    this.getSupportLocalStorage = getSupportLocalStorage;
}
StoreSvc.$inject = ["Cards"];

require('DelaApp').service('StoreSvc', StoreSvc);
},{"DelaApp":"DelaApp"}],11:[function(require,module,exports){


/* @ngInject */
function BadgeFilter() {
    return function (num) {
        if (num < 1000) {
            return "" + num;
        } else {
            return '999+';
        }
    };
}

require('DelaApp').filter('badge', BadgeFilter);
},{"DelaApp":"DelaApp"}],12:[function(require,module,exports){
var PRICE = /([+-]?)([0-9]+)(\.[0-9]*)/;

/* @ngInject */
function KoreanStock($filter) {
    var numberFilter = $filter('number');
    return function (price) {
        var tokens = price.match(PRICE);
        return tokens[1] + numberFilter(tokens[2]);
    }
}
KoreanStock.$inject = ["$filter"];

require('DelaApp').filter('kstock', KoreanStock);
},{"DelaApp":"DelaApp"}],13:[function(require,module,exports){
/*!
 * Let it snow
 * http://drawain.hu/let-it-snow-jquery-plugin
 * MIT licensed
 *
 * Copyright (C) 2012 Fincza András, http://drawain.hu
 */
(function($, window, undefined) {
    "use strict";

    var requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    $.fn.letItSnow = function() {

        return this.each(function() {
            var $container = $(this),

                createSnowFlake = function() {
                    var	$flake = $('<div class="let_it_snow"></div>'),
                        top = '-50px',
                        left = Math.floor(Math.random() * $container.width());

                    // Add snowflake type 1 or type 2 (different images)
                    $flake.addClass('snow_type_' + Math.ceil(Math.random()*2));

                    $flake.css({ top: top, left: left + 'px', opacity: 1 });

                    $container.append($flake);
                    
                    $flake.addClass('snow_duration_' + Math.ceil(Math.random()*5));
                    $flake.addClass('snow_delay_' + Math.ceil(Math.random()*5));
                    $flake.addClass('snow_anim_' + Math.ceil(Math.random()*5));

                    setTimeout(function() {
                        setTimeout(function() {
                            $flake.remove();
                        }, 3000);

                        requestAnimFrame(createSnowFlake);
                    }, 6000 + Math.floor(Math.random() * 1000));
                };

            for (var i=0; i<25; i++) {
                setTimeout(createSnowFlake, i * 200 * Math.random());
            }

        });
    };

}(jQuery, window));
},{}]},{},["DelaApp",2,3,4,5,6,7,8,9,10,11,12,13,1]);
