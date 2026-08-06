# Repository Specific Guidelines — A² ReVamp Gym

## Windows Batch Launchers (START_APP.bat / STOP_APP.bat)
- Always include `cd /d "%~dp0"` at line 1 of `.bat` scripts to set the working directory to the repository root.
- Avoid using labels (`:LABEL`) inside parenthesized `if ( ... )` blocks in `.bat` scripts, as this breaks the Windows `cmd.exe` parser (`8 was unexpected at this time`).
- Use `ping 127.0.0.1 -n N >nul` for delays instead of `timeout /t N` to support both interactive and non-interactive execution without input redirection errors.
- Support both modern `docker compose` and legacy `docker-compose`.

## Docker & PostgreSQL Configuration
- Include `?sslmode=disable` on local container `DATABASE_URL` connections to avoid SSL negotiation log warnings in Postgres.
- Always include a `healthcheck` on the `postgres` container service with `condition: service_healthy` on dependent services (`api`).

## Git Directives
- Do NOT run `git push` commands unless explicitly instructed by the user.
