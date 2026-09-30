# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub:
[**Report a vulnerability**](https://github.com/hyamero/stackmap/security/advisories/new). Don't open a public
issue or pull request for them.

Include what an attacker could do, the stackmap version (`npx @hyamero/stackmap --version`), and a diagram or steps
that reproduce it. You'll get a reply within a week. Once a fix is released, the advisory is published with credit
to you unless you'd rather stay anonymous.

## Supported versions

Only the latest release gets security fixes.

## Scope

The parts most worth a look:

- **The delivered HTML file.** It's self-contained and makes no network requests. Diagram text is rendered as
  text, and a `source.url` or card link can only produce an `http(s)` link. Anything that runs script from a
  diagram, or makes the file reach the network, is in scope.
- **`stackmap serve`.** It binds `127.0.0.1` only and serves the one diagram it was given. Reaching other files,
  or reaching it from another machine, is in scope.
- **The CLI** reading a diagram and writing its output.
