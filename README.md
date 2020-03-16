# github-prune

Do you have many local Git branches, but most of them are super old?

**github-prune** quickly and safely deletes branches you don't need anymore!

## Purpose

Specifically, this tool will delete all local branches:

- Whose latest commit has been pushed to a PR, and
- Whose latest commit doesn't exist in a remote branch.

After running this tool, all remaining branches should be either branches that
have unpushed work or branches that you're still working on.

## Installing

**Step 1:**\
Install [Deno](https://deno.land). (On macOS: `brew install deno`)

**Step 2:**\
`deno install -f --allow-run github-prune https://github.com/szhu/github-prune/raw/master/lib/main.ts`

## Using

In your terminal, `cd` into the repo you want to clean up, then run

     ~/.deno/bin/github-prune

This tool will print out an description of what it does and asks you to confirm
before it does anything.

Advanced: Add `~/.deno/bin` to your `PATH` and you can run this as `github-prune`!

## Contributing

It's easy to set up this tool for development as well. Here's how to get up and
running:

1. Install [Deno](https://deno.land). (On macOS: `brew install deno`)
2. Clone this repo. Let's say you cloned it to `/path/to/github-prune`.
3. `cd` into the repo that you want to test this tool on.
4. Run: `deno --allow-run /path/to/github-prune/lib/main.ts`
