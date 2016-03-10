#!/usr/bin/env node
var meow = require("meow");
var bemoWebfonts = require("./index");
var fs = require("fs");

var parseOptions = {
  string: ['sass-path', 'fonts-dir', 'svg-dir'],
  alias: {
    'sass-path': ['S', 'sassPath'],
    'fonts-dir': ['f', 'fontsDir'],
    'svg-dir': ['s', 'svgDir'],
  },
};

var description = [
  "Usage",
  "  $ bemo-webfonts -s <SVG_DIR> -f <FONTS_DIR> -S <SASS_PATH>",
  "",
  "Options",
  "  -s, --svg-dir    Directory where SVGs can be found",
  "  -f, --fonts-dir  Directory where the webfonts will be generated",
  "  -S, --sass-path  Path where the BEMO SCSS variable file will be generated",
];

var cli = meow(description.join("\n"), parseOptions);
var args = cli.flags;

['svgDir', 'fontsDir', 'sassPath'].forEach(function(key) {
  if (!args[key]) {
    console.log("Missing --" + key + " argument!");
    process.exit(1);
  }
});

['svgDir', 'fontsDir'].forEach(function(key) {
  try {
    var stat = fs.statSync(args[key]);
    if (!stat.isDirectory()) {
      console.log(args[key] + " is not a directory!");
      process.exit(1);
    }
  } catch(e) {
    console.log(args[key] + " does not exist!");
    process.exit(1);
  }
});

bemoWebfonts.generate(args, function(err) {
  if (err) {
    console.log(err.message);
    process.exit(1);
  } else {
    console.log("Done!");
  }
});
