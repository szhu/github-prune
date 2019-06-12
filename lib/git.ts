import { run, runAndGetOutput, runAndGetOutputLines } from "./run.ts"

export type GitBranch = string
export type GitCommit = string
export type GitRemote = string

export interface GitBranchAndCommit {
  branch: GitBranch
  commit: GitCommit
}

export async function gitDeleteBranch(branch: GitBranch) {
  await run(["git", "branch", "-D", branch])
}

export async function gitFetchPrune(remote: GitRemote, fetchSpec: string[]) {
  await runAndGetOutput([
    "git",
    "fetch",
    "--prune",
    remote,
    ...fetchSpec,
  ])

}

export async function gitGetBranchesAndCommits() {
  let lines = await runAndGetOutputLines([
    "git",
    "for-each-ref",
    "--format",
    "%(objectname) %(refname:short)",
    "refs/heads",
  ])
  return lines.map((line) => {
    let [commit, branch] = line.split(" ", 2)
    return { commit, branch } as GitBranchAndCommit
  })
}

export async function gitGetCommitsAhead(base: GitBranch, compare: GitBranch) {
  return (await runAndGetOutputLines([
    "git",
    "log",
    "--format=%H",
    `${base}..${compare}`,
  ])) as GitCommit[]
}

// async function gitGetPrBranches() {
//   let branches: GitBranch[] = await runAndGetOutputLines([
//     "git",
//     "branch",
//     "-r",
//     "--format",
//     "%(refname:short)",
//   ])
// }

export async function gitGetRemoteBranchesContainingCommit(commit: GitCommit) {
  return await runAndGetOutputLines([
    "git",
    "branch",
    "-r",
    "--format",
    "%(refname:short)",
    "--contains",
    commit,
  ])
}

export async function getGetRemoteFetchConfig(remote: GitRemote) {
  return (await runAndGetOutput([
    "git",
    "config",
    "--local",
    `remote.${remote}.fetch`,
  ])).trim()
}
