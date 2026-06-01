/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

var blackboard_map = jsx.object.getDataObject({
  'C': 'ℂ',
  'H': 'ℍ',
  'N': 'ℕ',
  'P': 'ℙ',
  'Q': 'ℚ',
  'R': 'ℝ',
  'Z': 'ℤ'
});

var greek_map = {
  'alpha': 'α',
  'beta': 'β',
  'gamma': 'γ',
  'delta': 'δ',
  'epsilon': 'ε',
  'zeta': 'ζ',
  'eta': 'η',
  'theta': 'θ',
  'iota': 'ι',
  'kappa': 'κ',
  'lambda': 'λ',
  'mu': 'μ',
  'nu': 'ν',
  'xi': 'ξ',
  'omicron': 'ο',
  'pi': 'π',
  'rho': 'ρ',
  'varsigma': 'ς',
  'sigma': 'σ',
  'tau': 'τ',
  'upsilon': 'υ',
  'phi': 'φ',
  'chi': 'χ',
  'psi': 'ψ',
  'omega': 'ω',
  'Alpha': 'Α',
  'Beta': 'Β',
  'Gamma': 'Γ',
  'Delta': 'Δ',
  'Epsilon': 'Ε',
  'Zeta': 'Ζ',
  'Eta': 'Η',
  'Theta': 'Θ',
  'Iota': 'Ι',
  'Kappa': 'Κ',
  'Lambda': 'Λ',
  'Mu': 'Μ',
  'Nu': 'Ν',
  'Xi': 'Ξ',
  'Omicron': 'Ο',
  'Pi': 'Π',
  'Rho': 'Ρ',
  'Sigma': 'Σ',
  'Tau': 'Τ',
  'Upsilon': 'Υ',
  'Phi': 'Φ',
  'Chi': 'Χ',
  'Psi': 'Ψ',
  'Omega': 'Ω'
};

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
  'alpha': 'ᵅ',
  'b': 'ᵇ',
  'g': 'ᵍ',
  'i': 'ⁱ',
  'k': 'ᵏ',
  'n': 'ⁿ',
  'beta': 'ᵝ',
  'inf': '\u1AB2' /* U+1AB2 COMBINING INFINITY */
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
  'beta': 'ᵦ',
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
      throw new jsx.object.ObjectError('A property with the name "' + value
        + '" already exists and would be overwritten by switching property names and values.'
        + ' This must be handled manually.');
    }

    switched[value] = key;
  });

  return switched;
};

var superscript_UC2ASCII_map = Object.switch(superscript_ASCII2UC_map);
var subscript_UC2ASCII_map = Object.switch(subscript_ASCII2UC_map);

var rxUC2ASCII = jsx.regexp.RegExp(
  "(?<operator>[−×∕])|(?<root>[√])|(?<delim>'+)"
  + "|(?<superscript>[⁰ⁱ¹²³\\u2074-\\u207e]+)"
  + "|(?<subscript>[\\u2080-\\u208e]+)"
  + "|\\b(?<greek>[αγηπ])\\b",
  "g");

function toASCII (unicode)
{
  var ascii = new jsx.regexp.String(unicode.value).replace(
    rxUC2ASCII,
    function (match) {
      var groups = this.groups;
      if (groups["operator"])
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

        return "^{" + superscript + "}";
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

        return "_{" + subscript + "}";
      }

      if (groups["greek"])
      {
        var greek_map = {
          "α": "alpha ",
          "γ": "gamma ",
          'η': 'eta ',
          'θ': 'theta ',
          "π": "pi "
        };

        return greek_map[match];
      }

      return match;
    });

  unicode.form.elements["q"].value = ascii;
}

var rxASCII2UC = jsx.regexp.RegExp(
  '(?<operator>(!=|:=|=:|<?==>|<==|<=|>=|<?-->|<--|\\|->|\\^!|[-*/])|(?:\\\\|\\b)(?<operator-macro>approx|neq?|int|(?:not ?)?in|sum))'
  + '|\\\\(?<blackboard>[' + Object.keys(blackboard_map).join('') + '])'
  + '|\\b(?<root>(sq|cub)rt)\\b'
  + '|\\^(?<superscript>\\{(?<superscript-in-braces>.+?)\\}|(?<superscript-standalone>[^\\s*/(){}\\]\\[^_]+))'
  + '|_(?<subscript>\\{(?<subscript-in-braces>.+?)\\}|(?<subscript-standalone>[^\\s*/(){}\\]\\[^_]+))'
  + '|(?:\\s|\\b|\\\\?)(?<greek>' + Object.keys(greek_map).sort(function (a, b) { return (b.length - a.length); }).join('|') + ')(?:\\s(?![-+*/=])|\\b)',
  "g");

/**
 * Return the Unicode equivalent for a LaTeX-like formula.
 *
 * @param {string} ascii
 * @return {string}
 *  The converted string.
 */
function toUnicode (ascii)
{
  var unicode = new jsx.regexp.String(ascii).replace(
    rxASCII2UC,
    function (match) {
      var groups = this.groups;

      if (groups['operator-macro'])
      {
        return jsx.object.getProperty({
          'approx': '≈',
          'not in': '∉',
          'notin': '∉',
          'int': '∫',
          'neq': '≠',
          'ne': '≠',
          'in': '∈',
          'ne': '≠',
          'sum': '∑'
        }, groups['operator-macro']);
      }

      if (groups["operator"])
      {
        return jsx.object.getProperty({
          '!=': '≠',
          ':=': '≔',
          '=:': '≕',
          '<=': '≤',
          '>=': '≥',
          '-->': '→',
          '<--': '←',
          '<-->': '↔',
          '|->': '↦',
          '==>': '⇒',
          '<==': '⇐',
          '<==>': '⇔',
          '^!': 'ᵎ',
          "-": "−",
          "*": "×",
          "/": "∕"
        }, match);
      }

      if (groups['blackboard']) {
        return jsx.object.getProperty(blackboard_map, groups['blackboard']);
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
        var superscript_all_converted = true;

        var superscript_ASCII = groups['superscript-in-braces'] || groups['superscript-standalone'];
        var superscript_UC = superscript_ASCII.replace(
          /alpha|beta|inf(?:ty)?|./g,
          function (match) {
            if (match in superscript_ASCII2UC_map) {
              return superscript_ASCII2UC_map[match];
            }

            if (/[4-9]/.test(match)) {
              return String.fromCharCode(match.charCodeAt(0) - 0x30 + 0x2070);
            }

            superscript_all_converted = false;

            return match;
          });

        if (!superscript_all_converted) {
          if (groups['superscript-in-braces']) {
            return '^{' + toUnicode(superscript_ASCII) + '}';
          }

          return '^' + superscript_ASCII;
        }

        return superscript_UC;
      }

      if (groups["subscript"])
      {
        var subscript_all_converted = true;

        var subscript_ASCII = groups['subscript-in-braces'] || groups['subscript-standalone'];
        var subscript_UC = subscript_ASCII.replace(
          /beta|./g,
          function (match) {
            if (match in subscript_ASCII2UC_map) {
              return subscript_ASCII2UC_map[match];
            }

            if (/[4-9]/.test(match)) {
              return String.fromCharCode(match.charCodeAt(0) - 0x30 + 0x2080);
            }

            subscript_all_converted = false;

            return match;
          });

        if (!subscript_all_converted) {
          if (groups['subscript-in-braces']) {
            return '_{' + toUnicode(subscript_ASCII) + '}';
          }

          return '_' + subscript_ASCII;
        }

        return subscript_UC;
      }

      if (groups['greek'])
      {
        return greek_map[groups['greek']];
      }

      return match;
    });

  return unicode;
}

function updateUnicode (asciiControl)
{
  asciiControl.form.elements['unicode'].value = toUnicode(asciiControl.value);
}

function calc (form)
{
  return !window.open(
    form.action + "?q=" + encodeURIComponent(form.elements["q"].value),
    form.target,
    "width=720,height=630,resizable");
}
