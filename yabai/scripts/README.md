# Bash and JXA scripts for Yabai

## Why bash and JXA
The JXA environment adds about 50ms minimum overhead compared to an equivilent bash command.
This results in some pretty noticable lag from a UX perspective.

Therefore only actions that are invoked in response to user input are performed via bash, and the more complicated "background" functionality is written and invoked as JXA.

# JXA

## Running commands

There is an entrypoint script/file `run`. It provides the basic "require" function for all other js files. Its first argument is the file to invoke, all other positional arguments after that are passed to the invoked file.

The main entrypoint file is `main.js`

Example:
```bash
run ./main.js update-state
```

## Running tests
From within the JXA directory simply run `make test`.
