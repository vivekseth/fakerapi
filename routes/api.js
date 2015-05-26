var express = require('express');
var router = express.Router();
var faker = require('faker');

var BASE_URL = "http://localhost:3000/api/";

/* -------- */

function isArray(a) {
    return Object.prototype.toString.call( a ) === '[object Array]';
}

function isObject(a) {
    return Object.prototype.toString.call( a ) === '[object Object]';
}

function isString(a) {
    return Object.prototype.toString.call( a ) === '[object String]';
}

function isNumber(a) {
    return Object.prototype.toString.call( a ) === '[object Number]';
}

function isBoolean(a) {
    return Object.prototype.toString.call( a ) === '[object Boolean]';
}

function isUndefined(a) {
    return Object.prototype.toString.call( a ) === '[object Undefined]';
}

function isNull(a) {
    return Object.prototype.toString.call( a ) === '[object Null]';
}

/* -------- */

function isNilType(a) {
    return (isUndefined(a) || isNull(a));
}

function isComplexType(a) {
    return (isArray(a) || isObject(a));
}

function isParseCandidate(a) {
    return ( 
        isString(a) 
        && a.indexOf("<<") == 0
        && a.indexOf(">>") == (a.length - 2)
    );
}

/* -------- */

function convertToFakedData(parseCandidate) {
    try {
        var formatString = parseCandidate.substring(2, parseCandidate.length-2);
        
        // TODO accept function arguments. 
        // parse: 
        // - components, 
        // - arguments, 
        // - convert arguments to numbers if possible

        var components = formatString.split(".");
        var last = faker;
        for (var i=0; i<components.length; i++) {
            if (!last) {
                break;
            }
            var c = components[i];
            last = last[c];
        }

        if (!last) {
            return "<<ERROR>>";
        } else {
            return last();
        }

    } catch (e) {
        return "<<ERROR>>";
    }
}

/* -------- */

function traverseJSON(jsonRoot, newRoot) {
    if (!isComplexType(jsonRoot)) { // base case
        if (!isParseCandidate(jsonRoot)) {
            return jsonRoot;
        } else {
            return (convertToFakedData(jsonRoot));
        }
    } else { // recursive case
        if (isObject(jsonRoot)) {
            var temp = {};
            for (i in jsonRoot) {
                var out = traverseJSON(jsonRoot[i]);
                if (!isNilType(out)) {
                    temp[i] = out;
                }
            }
            return temp;
        } else if (isArray(jsonRoot)) {
            var temp = [];
            for (var i=0; i<jsonRoot.length; i++) {
                var out = traverseJSON(jsonRoot[i]);
                if (!isNilType(out)) {
                    temp[i] = out;
                }
            }
            return temp;
        } else {
            throw "unsupported type error";
        }
    }
}

function convertJSON(json) {
    var newRoot = {};
    if (isArray(json)) {
        newRoot = [];
    }
    return traverseJSON(json, newRoot);
}

/* GET home page. */
router.all('/faker', function(req, res, next) {
    var jsonData = {};
    
    if (req.body && req.body.json) {
        try {
            jsonData = convertJSON(JSON.parse(req.body.json));
        } catch(e) {
            console.log("error parsing json");
        }
    } else if (req.query && req.query.json) {
        try {
            jsonData = convertJSON(JSON.parse(req.query.json));
        } catch(e) {
            console.log("error parsing json");
        }
    }

    res.json(jsonData);
});

router.get('/console', function(req, res, next) {
    res.render('index', { title: 'Express', "URL": "" });
});

router.post('/console', function(req, res, next) {
    var URL = "";
    if (req.body.json) {
        try {
            var parsedJSON = JSON.parse(req.body.json);
            URL = BASE_URL + "faker?json=" + encodeURIComponent(JSON.stringify(parsedJSON));
            console.log(URL);
        } catch(e) {
            console.log("error parsing json");
        }
    }

    res.render('index', { "title": 'Express', "URL": URL });
});

module.exports = router;
