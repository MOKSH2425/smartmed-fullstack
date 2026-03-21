const crypto = require("crypto");
const { HttpError } = require("./http-error");

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

const sign = (value, secret) =>
  crypto.createHmac("sha256", secret).update(value).digest("base64url");

const createToken = (payload, secret, expiresInSeconds) => {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: issuedAt,
      exp: issuedAt + expiresInSeconds,
    })
  );
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
};

const verifyToken = (token, secret) => {
  const [header, body, signature] = String(token || "").split(".");

  if (!header || !body || !signature) {
    throw new HttpError(401, "Invalid authentication token.");
  }

  const expectedSignature = sign(`${header}.${body}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new HttpError(401, "Authentication token signature is invalid.");
  }

  const payload = JSON.parse(base64UrlDecode(body));

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Authentication token has expired.");
  }

  return payload;
};

module.exports = { createToken, verifyToken };
