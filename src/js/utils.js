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
    },
    lerp: function(a, b, t) {
       if (t < 0 || t > 1) {
          console.log('bad range for Utils.lerp(), must be between 0 and 1');
          return 0;
       }
       return a + t * (b - a);
    }
};

module.exports = Utils;