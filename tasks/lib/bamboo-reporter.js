/*jshint node:true */

"use strict";

var suite = 'jshint';

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

function encode(s) {
    var pairs = {
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
        "<": "&lt;",
        ">": "&gt;"
    };
    for (var r in pairs) {
        if (typeof (s) !== "undefined") {
            s = s.replace(new RegExp(r, "g"), pairs[r]);
        }
    }
    return s || "";
}

function failure_message(failures) {
    var count = failures.length;
    if (count === 1) {
        return "1 JSHINT Failure";
    } else {
        return count + " JSHint Failures";
    }
}

function failure_details(failures) {
    var msg = [];
    var item;
    for (var i = 0; i < failures.length; i++) {
        item = failures[i];
        msg.push(i + 1 + ". line " + item.line + ", char " + item.character + ": " + encode(item.reason));
    }
    return msg.join("\n");
}

exports.reporter = function (results, data, options, fileSrc) {

    var out = [],
        files = {},
        fileErr = 0,
        jsonResults = {},
        jsonStr = "",
        result;

    results.forEach(function (result) {
        result.file = result.file.replace(/^\.\//, '');
        if (!files[result.file]) {
            files[result.file] = [];
            fileErr = fileErr + 1;
        }
        files[result.file].push(result.error);
    });
    /*
    out.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
    out.push("<testsuite name=\"" + suite + "\" tests=\"" + (Object.keys(fileSrc).length === 0 ? 1 : Object.keys(fileSrc).length) + "\" failures=\"" + fileErr + "\" errors=\"0\">");

    // we need at least 1 empty test
    if (!fileSrc.length) {
        out.push("\t<testcase name=\"" + suite + "\" />");
    }
    */
    jsonResults.stats = {
        "suites": Object.keys(fileSrc).length,
        "tests": Object.keys(fileSrc).length,
        "passes": 0,
        "pending": 0,
        "failures": 0,
        "start": new Date,
        "end": "",
        "duration": 100
    };
    jsonResults.failures = [];
    jsonResults.passes = [];
    jsonResults.skipped = [];

    for (var file in fileSrc) {
        //file = path.relative(reporterOutputDir, fileSrc[file]);
        file = fileSrc[file];
        //out.push("\t<testcase name=\"" + file + "\">");
        result = {
            "title": "JSHint: " + file.replace(/.*[\\\/]/, ''),
            "fullTitle": "JSHint: " + file,
            "duration": 0
        };
        if (files.hasOwnProperty(file)) {
            /*
            out.push("\t\t<failure message=\"" + failure_message(files[file]) + "\">");
            out.push(failure_details(files[file]));
            out.push("\t\t</failure>");
            out.push("\t</testcase>");*/
            result.error = failure_message(files[file]) + ": " + failure_details(files[file]);
            jsonResults.failures.push(result);
        } else {
            //out.push("\t</testcase>");
            jsonResults.passes.push(result);
        }

    }
    //set stats now we have them
    jsonResults.stats.passes = jsonResults.passes.length;
    jsonResults.stats.failures = jsonResults.failures.length;
    jsonResults.stats.end = new Date;
    jsonResults.stats.duration = new Date - jsonResults.stats.start;
    jsonStr = JSON.stringify(jsonResults, null, 2);
    process.stdout.write(jsonStr);
    return jsonStr;
    /*
    out.push("</testsuite>");
    out = out.join("\n") + "\n";

    process.stdout.write(out);
    return out;
    */
};