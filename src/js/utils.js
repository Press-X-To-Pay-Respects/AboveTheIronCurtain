/*
Collection of utility functions.
*/

var Utils = {
    containsObject: function(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }

        return false;
    },
    distance: function(x1, y1, x2, y2) {
       return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
};

module.exports = Utils;