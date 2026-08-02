# Security Architecture

- **Helmet**: HTTP Security Headers.
- **Rate Limiting**: Auth rate limiting (15 requests / 15 minutes).
- **NoSQL Injection**: `express-mongo-sanitize` stripping `$` operators.
- **JWT HttpOnly Cookies**: Refresh tokens stored in `httpOnly` secure cookies with token rotation.
- **Password Hashing**: Bcryptjs with 12 salt rounds.
