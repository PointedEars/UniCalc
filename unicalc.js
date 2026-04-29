/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

var superscript_ASCII2UC_map = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  "+": "⁺",
  "-": "⁻",
  'T': 'ᵀ',
  'a': 'ᵃ',
  'b': 'ᵇ',
  'g': 'ᵍ',
  'i': 'ⁱ',
  'k': 'ᵏ',
  'n': 'ⁿ',
};

var subscript_ASCII2UC_map = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "+": "₊",
  "-": "₋",
  '=': '₌',
  "(": "₍",
  ")": "₎",
  'a': 'ₐ',
  'e': 'ₑ',
  'h': 'ₕ',
  'k': 'ₖ',
  'l': 'ₗ',
  'm': 'ₘ',
  'n': 'ₙ',
  'o': 'ₒ',
  'p': 'ₚ',
  's': 'ₛ',
  't': 'ₜ',
  'x': 'ₓ'
};

/**
 * Return a new object where the property names and values of the source object
 * have been switched.
 *
 * Note that the new object inherits from the source object.  Existing properties,
 * including methods, are preserved and inherited from the same prototype.
 *
 * @param {Object} obj Source object
 * @returns {Object}
 */
Object.switch = function (obj) {
  var switched = Object.create(obj);

  Object.keys(obj).forEach(function (key) {
    var value = obj[key];
    if (value in switched) {
      throw jsx.object.ObjectError('A property with the name "' + value
        + '" already exists and would be overwritten by switching property names and values.'
        + ' This must be handled manually.');
    }

    switched[value] = key;
  });

  return switched;
};

var superscript_UC2ASCII_map = Object.switch(superscript_ASCII2UC_map);
var subscript_UC2ASCII_map = Object.switch(subscript_ASCII2UC_map);

function toASCII (unicode)
{
  var ascii = new jsx.regexp.String(unicode.value).replace(
    jsx.regexp.RegExp(
        "(?<operand>[−×∕])|(?<root>[√])|(?<delim>'+)"
      + "|(?<superscript>[⁰ⁱ¹²³\\u2074-\\u207e]+)"
      + "|(?<subscript>[\\u2080-\\u208e]+)"
      + "|\\b(?<greek>[αγπ])\\b",
      "g"),
    function (match) {
      var groups = this.groups;
      if (groups["operand"])
      {
        switch (match)
        {
          case "−": return "-";
          case "×": return "*";
          case "∕": return "/";
        }
      }

      if (groups["root"])
      {
        switch (match)
        {
          case "√": return "sqrt";
        }
      }

      if (groups["delim"])
      {
        return "";
      }

      if (groups["superscript"])
      {
        var superscript = match.replace(
          /./g,
          function (match) {
            if (match in superscript_UC2ASCII_map) {
              return superscript_UC2ASCII_map[match];
            }

            /* Superscript 4 to 9 */
            if (/[\u2074-\u2079]/.test(match))
            {
              return String.fromCharCode(
                0x30 + (match.charCodeAt(0) - 0x2070));
            }

            return match;
          });

        return "^(" + superscript + ")";
      }

      if (groups["subscript"])
      {
        var subscript = match.replace(/./g, function (match) {
            if (match in subscript_UC2ASCII_map) {
              return subscript_UC2ASCII_map[match];
            }

            /* Subscript 4 to 9 */
            if (/[\u2080-\u208e]/.test(match))
            {
              return String.fromCharCode(
                0x30 + (match.charCodeAt(0) - 0x2080));
          }

          return match;
        });

        return "_(" + subscript + ")";
      }

      if (groups["greek"])
      {
        var greek_map = {
          "α": "alpha ",
          "γ": "gamma ",
          "π": "pi "
        };

        return greek_map[match];
      }

      return match;
    });

  unicode.form.elements["q"].value = ascii;
}

function toUnicode (ascii)
{
  var unicode = new jsx.regexp.String(ascii.value).replace(
    jsx.regexp.RegExp(
      "(?<operand>[-*/])"
      + "|\\b(?<root>(sq|cub)rt)\\b"
      + "|\\^(?<superscript>\\{(?<superscript-in-braces>.+?)\\}|(?<superscript-standalone>\\S+))"
      + "|_(?<subscript>\\{(?<subscript-in-braces>.+?)\\}|(?<subscript-standalone>\\S+))"
      + "|(?=\\d|\\b)?(?<greek>alpha|gamma)\\b",
      "g"),
    function (match) {
      var groups = this.groups;
      if (groups["operand"])
      {
        return jsx.object.getProperty({
          "-": "−",
          "*": "×",
          "/": "∕"
        }, match);
      }

      if (groups["root"])
      {
        switch (match)
        {
          case "cubrt": return "∛";
          case "sqrt": return "√";
          default:
            return match;
        }
      }

      if (groups["superscript"])
      {
        var superscript = (groups['superscript-in-braces'] || groups['superscript-standalone']).replace(
          /./g,
          function (match) {
            if (match in superscript_ASCII2UC_map) {
              return superscript_ASCII2UC_map[match];
            }

            if (/[4-9]/.test(match)) {
              return String.fromCharCode(match.charCodeAt(0) - 0x30 + 0x2070);
            }

            return match;
          });

        return superscript;
      }

      if (groups["subscript"])
      {
        var subscript = (groups['subscript-in-braces'] || groups['subscript-standalone']).replace(
          /./g,
          function (match) {
            if (match in subscript_ASCII2UC_map) {
              return subscript_ASCII2UC_map[match];
            }

            if (/[4-9]/.test(match)) {
              return String.fromCharCode(match.charCodeAt(0) - 0x30 + 0x2080);
            }

            return match;
          });

        return subscript;
      }

      if (groups["greek"])
      {
        var greek_map = {
          "alpha": "α",
          "gamma": "γ",
          "pi":    "π"
        };

        return greek_map[match];
      }

      return match;
    });

  ascii.form.elements["unicode"].value = unicode;
}

function calc (form)
{
  return !window.open(
    form.action + "?q=" + encodeURIComponent(form.elements["q"].value),
    form.target,
    "width=720,height=630,resizable");
}
