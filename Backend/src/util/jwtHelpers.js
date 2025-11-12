import jwt from "jsonwebtoken";

export function generatePublicAtlasToken() {
  return jwt.sign(
    { role: "public", scope: "atlas:read" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" } // optional expiration
  );
}
