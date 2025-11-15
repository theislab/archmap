import express from "express";
import { ExtRequest } from "../../../definitions/ext_request";
import jwt from "jsonwebtoken";
import UserService from "../../../database/services/user.service";

const JWT_SECRET = process.env.JWT_SECRET || "";

// export default function check_auth() {
//   let router = express.Router();

//   router.use((req: ExtRequest, res, next) => {
//     req.is_authenticated = false;

//     if (req.header("auth") || req.header("Authorization")) {
//       const jwtToken = req.header("auth") || req.header("Authorization")?.split(" ")[1] || "";
//       try {
//         jwt.verify(jwtToken, JWT_SECRET, async function (err, decoded) {
//           if (err || !decoded || !decoded.email || !decoded.id) {
//             console.log(err?.name);
//             if (err?.name == "TokenExpiredError")
//               return res.status(440).send("JWT authentication token expired. Please log in again");

//             return res.status(401).send("Invalid authentication");
//           }

//           UserService.getUserById(decoded.id).then(
//             (result) => {
//               if (!result) {
//                 return res
//                   .status(401)
//                   .send("JWT authentication token invalid. Please log in again");
//               }
//               req.is_authenticated = true;
//               req.user_id = decoded.id;
//               req.email = result!.email;
//               req.is_administrator = result!.isAdministrator;
//               req.is_verified = result!.isEmailVerified;
//               next();
//             },
//             (err) => {
//               console.error(err);
//               return res.status(500).send("Error during authentication: Failed to fetch user");
//             }
//           );
//         });
//       } catch (e) {
//         return console.error(e); // abort on error;
//       }
//     } else {
//       return res.status(403).send("jwt missing.");
//     }
//   });

//   return router;
// }



export default function check_auth() {
  let router = express.Router();

  router.use(async (req: any, res, next) => {
    req.is_authenticated = false;

    const authHeader = req.header("auth") || req.header("Authorization");
    const jwtToken = authHeader?.split(" ")[1] || authHeader;

    if (!authHeader) {
      return next(); // No token provided, continue without authentication
    }

    try {
      const decoded = jwt.verify(jwtToken, JWT_SECRET) as { id: string; email: string };

      if (!decoded?.id) {
        return next(); // Invalid token, proceed without authentication
      }

      try {
        const user = await UserService.getUserById(decoded.id);

        if (user) {
          req.is_authenticated = true;
          req.user_id = user._id;
          req.email = user.email;
          req.is_administrator = user.isAdministrator;
          req.is_verified = user.isEmailVerified;
        }
      } catch (dbErr) {
        console.error("Database error fetching user:", dbErr);
      }
    } catch (err) {
      console.error("JWT Verification Error:", err);
    }

    next(); // Continue execution regardless of authentication success/failure
  });

  return router;
}





