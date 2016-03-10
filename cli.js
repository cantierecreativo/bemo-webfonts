#!/usr/bin/env node
var minimist = require("minimist");
var bemoWebfonts = require("./index");

var parseOptions = {
  string: ['sass-path', 'fonts-dir', 'svgs-dir'],
  alias: {
    'sass-path': ['S', 'sassPath'],
    'fonts-dir': ['f', 'fontsDir'],
    'svgs-dir': ['s', 'svgsDir'],
  },
};
var args = minimist(process.argv.slice(2), parseOptions);
bemoWebfonts.generate(args, function() {
  console.log("Done!");
});
