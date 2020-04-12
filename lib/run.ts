export async function run(cmd: string[]) {
  // console.log(JSON.stringify(cmd))
  let process = Deno.run({ cmd })
  let status = await process.status()
  if (!status.success) {
    throw new Error(`Error when running command: ${JSON.stringify(cmd)}`)
  }
}

export async function runAndGetOutput(cmd: string[]) {
  let process = Deno.run({ cmd, stdout: "piped" })
  let output = await process.output()
  let status = await process.status()
  if (!status.success) {
    throw new Error(`Error when running command: ${JSON.stringify(cmd)}`)
  }
  return new TextDecoder("utf-8").decode(output)
}

export async function runAndGetOutputLines(cmd: string[]) {
  let lines = (await runAndGetOutput(cmd)).split("\n")
  if (!lines[lines.length - 1]) lines.pop()
  return lines
}
