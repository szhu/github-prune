import {
  gitGetBranchesAndCommits,
  gitGetRemoteBranchesContainingCommit,
  gitGetCommitsAhead,
  gitDeleteBranch,
  getGetRemoteFetchConfig,
  gitFetchPrune,
} from "./git.ts"
import { out } from "./out.ts"

export async function main(_args: string[]) {
  // Print usage notes, wait for user to confirm.
  {
    out([
      "This tool will delete all local branches:",
      "- whose latest commit has been pushed to a PR, and",
      "- whose Latest commit doesn't exist in a remote branch.",
      "",
      "This ensures that the remaining branches reflect either unpushed work, or branches in progress.",
      "",
      "When this tool deletes local branches, it will print out the commit of each branch it deletes. You should save the output of this tool in case you want to use it later. An easy way to do this is with:",
      "",
      "    $ <this tool> | tee -a github-prune-output.log",
      "",
      "Press enter to continue, or ^C to abort.",
    ])

    // TODO: 1000 is arbitrary. Fix when we have a better way to readLine:
    // https://github.com/denoland/deno/issues/1805
    Deno.stdin.readSync(new Uint8Array(1000))
  }

  // Fetch everything from GitHub:
  // - All remote branches -> remotes/origin/<branchname>
  // - All PR branches -> remotes/origin/pull/<PR number>/head
  // - The default branch -> remotes/origin/HEAD
  //   There is no assumption that this is named "master".
  // Currently we assume the GitHub remote is named "origin".
  {
    out(`Fetching all branches and PRs from "origin"...\n`)
    let expectedConfig = `+refs/heads/*:refs/remotes/origin/*`
    let config = await getGetRemoteFetchConfig("origin")
    if (config !== expectedConfig) {
      out([
        `Unexpected fetch config for remote "origin".`,
        `  Expected: ${JSON.stringify(expectedConfig)}`,
        `  Got:      ${JSON.stringify(config)}`,
        "You appear to have a config different from default one set by `git clone`. This tool only supports the default config for now. Since we don't know what your config does, this tool will abort to avoid potentially causing damage to your repo. If your config is safe, please contribute code to this tool that handles it.",
      ])
      Deno.exit(1)
    }
    await gitFetchPrune("origin", [
      "+refs/heads/*:refs/remotes/origin/*",
      "+refs/pull/*/head:refs/remotes/origin/pull/*/head",
      "+HEAD:refs/remotes/origin/HEAD",
    ])
    out(`Done.\n`)
    out("\n")
  }

  // For each branch, figure out whether it should be deleted, and delete it if
  // necessary.
  {
    let branchesAndCommits = await gitGetBranchesAndCommits()
    for (let { branch, commit } of branchesAndCommits) {
      out(`Checking branch ${branch}:\n`)

      // This check shouldn't need to exist. It solves two practical issues:
      // 1. When the branch tip is part of master, there are a lot of matching
      //    branches, and the output is slow. This check is near-instant.
      // 2. There is actually a bug in deno that prevents the output from being
      //    returned at all when the output is >64kb:
      //    https://github.com/denoland/deno/issues/2505
      let commitsAheadDefault = await gitGetCommitsAhead("origin/HEAD", branch)
      if (commitsAheadDefault.length === 0) {
        out([
          "  Branch tip is part of the default branch.",
          "  ✅  Keeping branch, since it's either the default branch or newly branched off the default branch. But you can safely delete this branch without data loss.",
          "",
        ])
        continue
      }

      let remoteBranches = await gitGetRemoteBranchesContainingCommit(commit)
      let prBranches = remoteBranches.filter((branch) =>
        branch.match(/^origin\/pull\/\d+\/head$/),
      )
      let branchBranches = remoteBranches.filter((branch) =>
        branch.match(/^origin\/[^/]+$/),
      )
      if (branchBranches.length > 0) {
        // If there is a remote branch of the same name, that's the only one that
        // we need to show the user. This specifically handles branches like
        // "master" and "release", whose tips are often in other branches.
        if (branchBranches.indexOf(`origin/${branch}`) !== -1) {
          branchBranches = [`origin/${branch}`]
        }
        out([
          `  Exists as remote branch(es): ${JSON.stringify(branchBranches)}`,
          "  ✅  Keeping branch, since the remote is still there.",
          "",
        ])
      } else if (prBranches.length > 0) {
        out([
          `  Exists only as PR(s): ${JSON.stringify(prBranches)}`,
          "  ❌  Deleting branch, since the PR's remote branch is gone.",
        ])
        await gitDeleteBranch(branch)
        out([""])
      } else {
        out([
          "  Tip of branch doesn't exist anywhere on the remote.",
          "  ✅  Keeping branch, since there are unpushed commits.",
          "",
        ])
      }
    }
  }
}

main(Deno.args.slice(1)).catch((e) => {
  console.error(e.toString())
  Deno.exit(1)
})
