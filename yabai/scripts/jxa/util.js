function internalDeepCompare (obj1, obj2, objects) {
    var i, objPair;

    if (obj1 === obj2) {
        return true;
    }

    i = objects.length;
    while (i--) {
        objPair = objects[i];
        if (  (objPair.obj1 === obj1 && objPair.obj2 === obj2) ||
              (objPair.obj1 === obj2 && objPair.obj2 === obj1)  ) {                          
            return true;
        }                    
    }
    objects.push({obj1: obj1, obj2: obj2});

    if (obj1 instanceof Array) {
        if (!(obj2 instanceof Array)) {
            return false;
        }

        i = obj1.length;

        if (i !== obj2.length) {
            return false; 
        }

        while (i--) {
            if (!internalDeepCompare(obj1[i], obj2[i], objects)) {
                return false;
            }
        }
    }
    else {
        switch (typeof obj1) {
        case "object":                
            // deal with null
            if (!(obj2 && obj1.constructor === obj2.constructor)) {
                return false;
            }

            if (obj1 instanceof RegExp) {
                if (!(obj2 instanceof RegExp && obj1.source === obj2.source)) {
                    return false;
                }
            }                 
            else if (obj1 instanceof Date) {
                if (!(obj2 instanceof Date && obj1.getTime() === obj2.getTime())) {
                    return false;
                }
            } 
            else {    
                for (i in obj1) {
                    if (obj1.hasOwnProperty(i)) {       
                        if (!(obj2.hasOwnProperty(i) && internalDeepCompare(obj1[i], obj2[i], objects))) {
                            return false;
                        }
                    }
                }         
            }
            break;
        case "function": 
            if (!(typeof obj2 === "function" && obj1+"" === obj2+"")) {
                return false;
            }
            break;
        default:                 //deal with NaN 
            if (obj1 !== obj2 && obj1 === obj1 && obj2 === obj2) {
                return false;            
            }
        }
    }

    return true;
}

function deepCompare(obj1, obj2) {
    return internalDeepCompare(obj1, obj2, []);
}

exports.deepCompare = deepCompare
