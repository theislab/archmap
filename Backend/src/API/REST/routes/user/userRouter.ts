import express, { Router } from "express";
import { visibilityStatus } from "../../../../database/models/team";
import TeamService from "../../../../database/services/team.service";
import check_auth from "../../middleware/check_auth";
import { ExtRequest } from "../../../../definitions/ext_request";
import UserService from "../../../../database/services/user.service";

/**
 *  Returns all the teams that the user belongs to.
 */
const get_teams_of_user = (): Router => {
  let router = express.Router();

  router.get("/users/ownteams", check_auth(), async (req: ExtRequest, res: any) => {
    try {
      const teams = req.user_id === undefined ? [] : await TeamService.getTeamsOfUser(req.user_id);
      return res.status(200).json(teams);
    } catch (e) {
      console.error("Error in get_teams_of_user()");
      console.error(JSON.stringify(e));
      console.error(e);
      return res.status(500).send("Internal error.");
    }
  });
  return router;
};

const get_users = (): Router => {
  let router = express.Router();

  router.get("/users", check_auth(), async (req: ExtRequest, res: any) => {
    try {
      const keyword = req.query?.keyword?.toString();
      const sort = req.query?.sortBy?.toString();
      const users = await UserService.searchUsers(keyword, sort);
      return res.status(200).json(users);
    } catch (e) {
      console.error("Error in /users");
      console.error(JSON.stringify(e));
      console.error(e);
      return res.status(500).send("Internal error.");
    }
  });
  return router;
};

const get_user_by_id = (): Router => {
  let router = express.Router();

  router.get("/users/:id", check_auth(), async (req: ExtRequest, res: any) => {
    try {
      const user_id = req.params.id;
      const user =await UserService.getUserById(user_id);
      if (!user) {
        return res.status(404).send("User with user id: " + user_id + " was not found!");
      }

      const {email, password, isEmailVerified, isAdministrator,
        ...filtered_user} = user.toObject();

      return res.status(200).json(filtered_user);
    } catch (e) {
      console.error("Error in /users/:id");
      console.error(JSON.stringify(e));
      console.error(e);
      return res.status(500).send("Internal error.");
    }
  });
  return router;
};

/**
 * Route for deleting temporary users that were granted access for the non-login version.
 * @returns Router
 */
const delete_temp_users = (): Router => {
  let router = express.Router();
  router.delete("/temp_users", async (req: ExtRequest, res: any) => {
    try{
      // delete all expired temporary users
      let obj = await UserService.deleteTemporaryUsers();

      res.status(200).json({ deletedCount: obj.deletedCount });
    }catch (err){
      console.error(err);
      return res.status(500).send("Internal server error");
    }});

  return router;
}

export { get_teams_of_user, get_users, get_user_by_id, delete_temp_users };
