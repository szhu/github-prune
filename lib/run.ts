export async function run(args: string[]) {
  // console.log(JSON.stringify(args))
  let process = Deno.run({ args })
  let status = await process.status()
  if (!status.success) {
    throw new Error(`Error when running command: ${JSON.stringify(args)}`)
  }
}

export async function runAndGetOutput(args: string[]) {
  // console.log(JSON.stringify(args))
  let process = Deno.run({ args, stdout: "piped" })
  let status = await process.status()
  if (!status.success) {
    throw new Error(`Error when running command: ${JSON.stringify(args)}`)
  }
  return new TextDecoder("utf-8").decode(await process.output())
}

export async function runAndGetOutputLines(args: string[]) {
  let lines = (await runAndGetOutput(args)).split("\n")
  if (!lines[lines.length - 1]) lines.pop()
  return lines
}
