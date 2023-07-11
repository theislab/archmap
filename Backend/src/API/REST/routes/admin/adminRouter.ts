import express, { Router } from "express";
import { userModel } from "../../../../database/models/user";
import check_auth from "../../middleware/check_auth";





const changePermissionById = async (id:string, permission:boolean) => {
    try {
      
      await userModel.findByIdAndUpdate(id, {
        hasPermission: permission,
      });
      console.log("User Permission Changed Successfully");
    } catch (err) {
      throw err;
    }
};

//route to give permission or deny permission to the user to upload the atlas
const change_permission =  (): Router => {
    const router = express.Router();
    router.put("/users/:id/permission", check_auth(),async (req, res) => {
        try {
            const id = req.params.id;
            const permission = req.body.permission;
            await changePermissionById(id, permission);

            
            res.status(200).send({
                message: "User permission changed successfully",
            });
        } catch (err) {
            console.log("err", err);
            res.status(500).send({
                message: err,
            });
        }
    });
    return router;
};

export {change_permission};
