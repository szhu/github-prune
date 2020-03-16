export function out(output: string | string[]) {
  if (typeof output === "string") {
    Deno.stdout.writeSync(new TextEncoder().encode(output))
  } else {
    for (let line of output) {
      // Support hanging indents with little developer effort!
      let [_line, firstLineIndent, text] = line.match(
        /^([^A-Za-z0-9]* |)(.*)$/,
      )!
      let indent = firstLineIndent.replace(/[^ ]/g, " ")
      let wrapped = wordWrap(text, { width: 80, indent })
      wrapped = firstLineIndent + wrapped.slice(firstLineIndent.length)
      out(`${wrapped}\n`)
    }
  }
}

/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

const wordWrap = function(str: any, options: any) {
  options = options || {}
  if (str == null) {
    return str
  }

  var width = options.width || 50
  var indent = typeof options.indent === "string" ? options.indent : "  "

  var newline = options.newline || "\n" + indent
  var escape = typeof options.escape === "function" ? options.escape : identity

  var regexString = ".{1," + width + "}"
  if (options.cut !== true) {
    regexString += "([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)"
  }

  var re = new RegExp(regexString, "g")
  var lines = str.match(re) || []
  var result =
    indent +
    lines
      .map(function(line: any) {
        if (line.slice(-1) === "\n") {
          line = line.slice(0, line.length - 1)
        }
        return escape(line)
      })
      .join(newline)

  if (options.trim === true) {
    result = result.replace(/[ \t]*$/gm, "")
  }
  return result
}

function identity(str: any) {
  return str
}
