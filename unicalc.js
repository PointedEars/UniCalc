function toASCII (unicode)
{
  var ascii = new jsx.regexp.String(unicode.value).replace(
    jsx.regexp.RegExp(
        "(?<operand>[−×∕])|(?<root>[√])|(?<delim>'+)"
      + "|(?<exponent>[⁰¹²³\u2074-\u2079⁺⁻⁽⁾]+)"
      + "|\\b(?<const>g)\\b",
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
          default:
            return match;
        }
      }

      if (groups["delim"])
      {
        return "";
      }

      if (groups["exponent"])
      {
        var exponent = match.replace(
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

        return "^(" + exponent + ")";
      }

      if (groups["const"])
      {
        switch (match)
        {
          case "g": return "9.81 m/s^2";
        }
      }

      return match;
    });

  unicode.form.elements["q"].value = ascii;
}

function toUnicode (ascii)
{
  var unicode = new jsx.regexp.String(ascii.value).replace(
    jsx.regexp.RegExp(
      "(?<operand>[-*/])|\\b(?<root>(sq|cub)rt)\\b|\\^(?<exponent>[\\d()]+)",
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

      if (groups["exponent"])
      {
        var exponent = groups["exponent"].replace(
          /./g,
          function (match) {
            switch (match)
            {
              case "0": return "⁰";
              case "1": return "¹";
              case "2": return "²";
              case "3": return "³";
              case "+": return "⁺";
              case "-": return "⁻";
              case "=": return "⁼";
              case "(": return "⁽";
              case ")": return "⁾";
              default:
                if (/[4-9]/.test(match))
                {
                  return String.fromCharCode(
                    match.charCodeAt(0) - 0x30 + 0x2070);
                }

                return match;
            }
          });

        return exponent;
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