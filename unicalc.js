function toASCII (unicode)
{
  var ascii = new jsx.regexp.String(unicode.value).replace(
    jsx.regexp.RegExp(
        "(?<operand>[−×∕])|(?<root>[√])|(?<delim>'+)"
      + "|(?<superscript>[⁰¹²³\u2074-\u2079⁺⁻⁽⁾⁼]+)"
      + "|(?<subscript>[₀₁₂₃₊₍₎₌]+)"
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
            switch (match)
            {
              case "⁰": return "0";
              case "¹": return "1";
              case "²": return "2";
              case "³": return "3";
              case "⁺": return "+";
              case "⁻": return "-";
              case "⁼": return "=";
              case "⁽": return "(";
              case "⁾": return ")";
              default:
                if (/[\u2074-\u2079]/.test(match))
                {
                  return String.fromCharCode(
                    0x30 + (match.charCodeAt(0) - 0x2070));
                }

                return match;
            }
          });

        return "^(" + superscript + ")";
      }

      if (groups["subscript"])
      {
        var subscript_map = {
          "₀": "0",
          "₁": "1",
          "₂": "2",
          "₃": "3",
          "₊": "+",
          "₌": "=",
          "₍": "(",
          "₎": ")"
        };

        var subscript = match.replace(/./g, function (match) {
          return subscript_map[match];
        });

        return "^(" + subscript + ")";
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
      + "|\\^(?<superscript>[\\d=()+-]+)"
      + "|_(?<subscript>[\\d()+]+)"
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
        var superscript = groups["superscript"].replace(
          /./g,
          function (match) {
            switch (match)
            {
              case "0": return "⁰";
              case "1": return "¹";
              case "2": return "²";
              case "3": return "³";
              case "=": return "⁼";
              case "(": return "⁽";
              case ")": return "⁾";
              case "+": return "⁺";
              case "-": return "⁻";
              default:
                if (/[4-9]/.test(match))
                {
                  return String.fromCharCode(
                    match.charCodeAt(0) - 0x30 + 0x2070);
                }

                return match;
            }
          });

        return superscript;
      }

      if (groups["subscript"])
      {
        var subscript = groups["subscript"].replace(
          /./g,
          function (match) {
            switch (match)
            {
              case "0": return "₀";
              case "1": return "₁";
              case "2": return "₂";
              case "3": return "₃";
              case "(": return "₍";
              case ")": return "₎";
              case "+": return "₊";
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