import express from "express";
import jwt from "jsonwebtoken";
import UserService from "../../../database/services/user.service";
import bcrypt from "bcrypt";
import { validationMdw } from "../middleware/validation";
import dotenv from "dotenv";

const INCORRECT_CREDENTIALS = "The email or password is incorrect";
if(process.env.JWT_SECRET === undefined) {
 dotenv.config();
}
const JWT_SECRET = process.env.JWT_SECRET || "";

export default function auth_route() {
  let router = express.Router();

  router.post("/auth", validationMdw, async (req, res) => {
    const { email, password } = req.body;
    UserService.getUserByEmail(email, true).then((user) => {
      if (!user) {
        console.log("User not found")
        return incorrectCredentialsResp(res);
      }

      bcrypt.compare(password, <string>user.password, (err, match) => {
        console.log({ err, match });
        if (err || !match) {
          if (err) console.error(err);
          return incorrectCredentialsResp(res);
        }

        if (!user.isEmailVerified) {
          return res.status(401).send({ msg: "User not verified" });
        }

        delete user.password;
        const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdministrator? user.isAdministrator : false, permissionToUpload: user.hasPermission ? user.hasPermission: false }, JWT_SECRET, {
          expiresIn: "20h",
        });

        /* user without the password field */
        const { password, ...userSecure } = user.toObject();
        console.log(userSecure)

        return res.status(200).json({
          msg: "Login success",
          user: userSecure,
          jwt: token,
        });
      });
    });
  });

  return router;
}

function incorrectCredentialsResp(res: any) {
  return res.status(401).json({ msg: INCORRECT_CREDENTIALS });
}
