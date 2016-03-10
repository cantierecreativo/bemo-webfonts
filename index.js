var fs = require("fs");
var path = require("path");
var glob = require("glob");
var async = require("async");
var svgicons2svgfont = require("svgicons2svgfont");
var svg2ttf = require("svg2ttf");
var ttf2woff = require("ttf2woff");
var ejs = require("ejs");

module.exports = {
  generate: function(options, cb) {
    async.waterfall([
      this.generateGlyphs.bind(
        this,
        options.svgDir
      ),
      this.generateSass.bind(
        this,
        options.sassPath
      ),
      this.generateSvgFont.bind(
        this,
        path.join(options.fontsDir, "icons.svg")
      ),
      this.generateTtfFromSvgFont.bind(
        this,
        path.join(options.fontsDir, "icons.ttf")
      ),
      this.generateWoffFromTtf.bind(
        this,
        path.join(options.fontsDir, "icons.woff")
      )
    ], cb);
  },
  generateGlyphs(svgDir, cb) {
    glob(path.join(svgDir, "*.svg"), function (err, files) {
      if (err) {
        return cb(err);
      }

      if (files.length === 0) {
        return cb(new Error("no SVGs found at " + svgDir));
      }

      var baseCodePoint = 0xF101;
      cb(null, files.map(function(file, i) {
        return {
          codepoint: String.fromCharCode(baseCodePoint + i),
          name: path.basename(file, ".svg"),
          stream: fs.createReadStream(file),
        };
      }));
    });
  },
  generateSass: function(sassPath, glyphs, cb) {
    var template = ejs.compile(
      fs.readFileSync(
        path.join(__dirname, '_icon-glyphs.scss.ejs'),
        'utf-8'
      )
    );

    fs.writeFile(
      sassPath,
      template({ glyphs: glyphs }),
      function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null, glyphs);
        }
      }
    );
  },
  generateSvgFont: function(svgFontPath, glyphs, cb) {
    var stream = svgicons2svgfont({
      fontName: 'icons',
      normalize: false,
      round: 10e12,
      fontHeight: 512,
      descent: 0,
      log: function () {},
      error: function (err) { console.log("** ERROR: " + err) },
    });

    stream.pipe(fs.createWriteStream(svgFontPath))
      .on('finish', function() {
        cb(null, svgFontPath);
      })
      .on('error', function(err) {
        cb(err);
      });

    glyphs.forEach(function(glyph) {
      glyph.stream.metadata = {
        unicode: [glyph.codepoint],
        name: glyph.name
      }
      stream.write(glyph.stream);
    });

    stream.end();
  },
  generateTtfFromSvgFont: function(ttfFontPath, svgFontPath, cb) {
    var svgFont = fs.readFileSync(svgFontPath, 'utf-8');
    fs.writeFile(
      ttfFontPath,
      new Buffer(svg2ttf(svgFont).buffer),
      function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null, ttfFontPath);
        }
      }
    );
  },
  generateWoffFromTtf: function(woffFontPath, ttfFontPath, cb) {
    var input = fs.readFileSync(ttfFontPath);

    var ttfFont = new Uint8Array(input);
    fs.writeFile(
      woffFontPath,
      new Buffer(ttf2woff(ttfFont, {}).buffer),
      function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null, woffFontPath);
        }
      }
    );
  }
}
