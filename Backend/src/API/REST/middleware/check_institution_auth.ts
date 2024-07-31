import { Request } from "express";
import { ObjectId } from "mongoose";
import InstitutionService from "../../../database/services/institution.service";
import UserService from "../../../database/services/user.service";
import express from "express";
import { ExtRequest } from "../../../definitions/ext_request";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface ExtInstRequest extends Request {
  user_id?: ObjectId; // declare optional property "user_id"
}

export const institution_admin_auth = (req: ExtInstRequest, res: any, next: any) => {
  const current_user = req.user_id;
  const institution_id = req.params.id;

  try {
    InstitutionService.getInstitutionById(institution_id)
      .then((inst) => {
        if (!inst) {
          return res.status(404).send("There is no institution with id: " + institution_id);
        }
        if (!inst.adminIds.includes(current_user!)) {
          return res.status(401).send("Invalid permissions to do this operations!");
        }
        next();
      })
      .catch((error) => {
        return res
          .status(500)
          .send("Error during authentication: Failed to fetch the institution, " + error);
      });
  } catch (e) {
    return res
      .status(500)
      .send("Error during authentication: Failed to check auth for institution");
  }
};

export const institution_member_auth = (req: ExtInstRequest, res: any, next: any) => {
  const current_user = req.user_id;
  const institution_id = req.params.id;

  try {
    InstitutionService.getInstitutionById(institution_id)
      .then((inst) => {
        if (!inst) {
          return res.status(404).send("There is no institution with id: " + institution_id);
        }
        if (!inst.memberIds.includes(current_user!)) {
          return res.status(401).send("Invalid permissions to do this operations!");
        }
        next();
      })
      .catch((error) => {
        return res
          .status(500)
          .send("Error during authentication: Failed to fetch the institution, " + error);
      });
  } catch (e) {
    return res
      .status(500)
      .send("Error during authentication: Failed to check auth for institution");
  }
};

export const institution_admin_or_member_auth = (req: ExtInstRequest, res: any, next: any) => {
  const current_user = req.user_id;
  const institution_id = req.params.id;

  try {
    InstitutionService.getInstitutionById(institution_id)
      .then((inst) => {
        if (!inst) {
          return res.status(404).send("There is no institution with id: " + institution_id);
        }
        if (!(inst.adminIds.includes(current_user!) || inst.memberIds.includes(current_user!))) {
          return res.status(401).send("Invalid permissions to do this operations!");
        }
        next();
      })
      .catch((error) => {
        return res
          .status(500)
          .send("Error during authentication: Failed to fetch the institution, " + error);
      });
  } catch (e) {
    return res
      .status(500)
      .send("Error during authentication: Failed to check auth for institution");
  }
};

// Auth to check if the user.hasPermission is true or false. if false, then user cannot upload the atlas
export const upload_permission_auth = () => {
  let router = express.Router();
  router.use((req: ExtRequest, res, next) => {
    console.log("upload_permission_auth")
    req.is_authenticated = false;
    if(req.header("auth") || req.header("Authorization")) {
      const jwtToken = req.header("auth") || req.header("Authorization")?.split(" ")[1] || "";
      try {
        jwt.verify(jwtToken, JWT_SECRET, async function (err, decoded) {
          if(err || !decoded || !decoded.email || !decoded.id) {
            console.log(err?.name);
            if(err?.name == "TokenExpiredError")
              return res.status(440).send("JWT authentication token expired. Please log in again");

            return res.status(401).send("Invalid authentication");
          }

          UserService.getUserById(decoded.id).then(
            (result) => {
              if(!result) {
                return res.status(401).send("JWT authentication token invalid. Please log in again");
              }
              if(result.isAdministrator || result.hasPermission) {
                req.is_authenticated = true;
                req.user_id = decoded.id;
                req.email = result!.email;
                req.is_administrator = result!.isAdministrator;
                req.is_verified = result!.isEmailVerified; 

                next();
              } else {
                return res.status(401).send("User does not have permission to upload the atlas");
              }
            },
            (err) => {
              console.error(err);
              return res.status(500).send("Error during authentication: Failed to fetch user");
            }
          );
        });
      } catch(e) {
        return console.error(e); // abort on error;
      }
    } else {
      return res.status(403).send("JWT missing.");
    }
  });

  return router;
};




