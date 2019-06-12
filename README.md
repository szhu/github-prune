# github-prune

This tool will delete all local branches:

- whose latest commit has been pushed to a PR, and
- whose Latest commit doesn't exist in a remote branch.

This ensures that the remaining branches reflect either unpushed work, or
branches in progress.

When this tool deletes local branches, it will print out the commit of each
branch it deletes. You should save the output of this tool in case you want to
use it later. An easy way to do this is with:

```sh
github-prune | tee -a github-prune-output.log
```

## Installing and using

### Option 1: Running directly from GitHub

If you run this tool only every now and then, this is the easiest option.

1. Install [Deno](https://deno.land)
2. cd into your repo.
3. Run: `deno run --reload --allow-run https://github.com/szhu/github-prune/raw/master/lib/main.ts`

### Option 2: Running from installed location

This option is more similar to a traditional install.

1. Clone this repo.
2. Either:
   - Make sure the `bin` folder in this repo is in your `$PATH`.
   - Create an alias to `bin/github-prune`.
3. cd into your repo.
4. Run: `github-prune`
