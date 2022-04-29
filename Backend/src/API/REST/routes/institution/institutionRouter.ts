import express, { Router } from "express";

import { Schema } from "mongoose";

import InstitutionService from "../../../../database/services/institution.service";
import { AddInstitutionDTO } from "../../../../database/dtos/institution.dto";
import UserService from "../../../../database/services/user.service";

import check_auth from "../../middleware/check_auth";
import { check_institution_auth } from "../../middleware/check_institution_auth";

const create_institution = (): Router => {
    let router = express.Router();

    router
        .post("/institutions", check_auth(), async (req: any, res) => {

            const { name, country, profilePictureURL, backgroundPictureURL } = req.body;
            const admin_user_id = req.user_id;

            if (!(name && country && admin_user_id))
                return res.status(400).send("Missing parameters");

            const institution = await InstitutionService.getInstitutionByName(name);
            if (institution)
                return res.status(409).send("Institution with the given name already exists!");

            const user = await UserService.getUserById(admin_user_id);
            if (!user)
                return res.status(404).send("Admin that you are trying to assign does not exists!");

            try {
                const institutionToAdd: AddInstitutionDTO = {
                    name,
                    country,
                    profilePictureURL,
                    backgroundPictureURL,
                    adminIds: [admin_user_id]
                };
                const institution = await InstitutionService.addInstitution(institutionToAdd);

                return res.status(201).json(institution);
            } catch (err) {
                console.error("Error registering institution!");
                console.error(JSON.stringify(err));
                console.error(err);
                return res.status(500).send("Unable to create institution. (DB-error)");
            }
        })

    return router;
}

const invite_to_institution = (): Router => {
    let router = express.Router();

    router
        .put("/institutions/:id/invite", check_auth(), check_institution_auth, async (req: any, res) => {

            const { userId }: { userId: Schema.Types.ObjectId } = req.body;
            const institutionId_to_modify = req.params.id;

            try {

                if (!(userId))
                    return res.status(400).send("Missing parameter");

                if (! await UserService.getUserById(userId))
                    return res.status(404).send("User that you are trying to invite does not exists!");

                if (await InstitutionService.findMemeberOrInvitedById(userId, institutionId_to_modify))
                    return res.status(404).send("User that you are trying to invite to this institution already is an invited member or is a member!");

                const updatedInstitution = await InstitutionService.inviteToInstitution(institutionId_to_modify, userId)

                if (updatedInstitution) {
                    res.json(updatedInstitution);
                } else {
                    return res.status(409).send("Could not invite person to institution!");
                }

            } catch (error) {
                return res.status(500).send("Something went wrong: " + error)
            }

        })

    return router;
}

const make_user_admin_of_institution = (): Router => {
    let router = express.Router();

    router
        .put("/institutions/:id/admin", check_auth(), check_institution_auth, async (req: any, res) => {

            const { userId }: { userId: Schema.Types.ObjectId } = req.body;
            const institutionId_to_modify = req.params.id;
            const current_user = req.user_id

            try {

                if (!(userId))
                    return res.status(400).send("Missing parameter");

                if (! await UserService.getUserById(userId))
                    return res.status(404).send("User that you are trying to make as admin does not exists!");

                const institutionToBeUpdated = await InstitutionService.findMemeberById(userId, institutionId_to_modify)

                if (!institutionToBeUpdated)
                    return res.status(409).send("User that you are trying to make as admin is not a member!");

                if (institutionToBeUpdated?.adminIds.includes(userId))
                    return res.status(409).send("User is already an admin!");

                const updatedInstitution = await InstitutionService.makeUserAnAdminOfInstitution(institutionId_to_modify, userId)

                if (updatedInstitution) {
                    res.json(updatedInstitution);
                } else {
                    return res.status(409).send("Could not make the user admin of the institution!");
                }

            } catch (error) {
                return res.status(500).send("Something went wrong: " + error)
            }

        })

    return router;
}

const make_user_member_of_institution = (): Router => {
    let router = express.Router();

    router
        .put("/institutions/:id/join", check_auth(), check_institution_auth, async (req: any, res) => {

            const { userId }: { userId: Schema.Types.ObjectId } = req.body;
            const institutionId_to_modify = req.params.id;
            const current_user = req.user_id

            try {

                if (!(userId))
                    return res.status(400).send("Missing parameter");

                if (! await UserService.getUserById(userId))
                    return res.status(404).send("User that you are trying to make as member does not exists!");

                const institutionToBeUpdated = await InstitutionService.findInvitedMemeberById(userId, institutionId_to_modify)

                if (!institutionToBeUpdated)
                    return res.status(409).send("User that you are trying to make as member is not an invited member!");

                const updatedInstitution = await InstitutionService.makeUserMemberOfInstitution(institutionId_to_modify, userId)

                if (updatedInstitution) {
                    res.json(updatedInstitution);
                } else {
                    return res.status(409).send("Could not make the user member of the institution!");
                }

            } catch (error) {
                return res.status(500).send("Something went wrong: " + error)
            }

        })

    return router;
}


export { create_institution, invite_to_institution, make_user_admin_of_institution, make_user_member_of_institution }
