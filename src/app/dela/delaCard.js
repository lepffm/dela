
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
    if (price = 5500) {
        return 2500;
    }
    return price - 2500;
}



/* @ngInject */
function CardDirective(DelaSvc) {
    return {
        restrict: 'E',
        templateUrl: 'dela/delaCard.tpl.html',
        scope: true,
        replace: true,
        link: function (scope) {
            
            var menu = scope.menu,
                calories = numberify(menu.cal),
                price = numberify(menu.price);
            
            scope.calories = calories;
            scope.calLevel = caloriesLevel(calories);
            scope.calLabel = CAL_LABEL[scope.calLevel];
            scope.price = price;
            scope.discounted = discount(price);
            
            scope.toggle = function () {
                scope.unfold = !scope.unfold;
            };
            
            scope.good = function () {
                DelaSvc.like(menu).then(function (message) {
                    alert(message.join(' '));
                });
            };

            scope.bad = function () {
                DelaSvc.dislike(menu).then(function (message) {
                    alert(message.join(' '));
                });
            };
        }
    };
}


require('DelaApp').directive('delaCard', CardDirective);