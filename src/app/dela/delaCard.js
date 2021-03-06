
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


require('DelaApp').directive('delaCard', CardDirective);