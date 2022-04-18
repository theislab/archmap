import {Document, model, Schema} from "mongoose";

export enum visibilityInstitutionStatus {
    "PRIVATE",
    "PUBLIC",
}

export interface IInstitution extends Document {
   name:string,
   country:string,
   profilePictureURL: string,
   backgroundPictureURL: string,
   adminIds: [Schema.Types.ObjectId],
   invitedMemberIds: [Schema.Types.ObjectId],
   visibility: string,
}

const institutionSchema = new Schema<IInstitution>({
    name: {
        type: String,
        required: true
    },

    country: {
        type: String, 
        require: true
    },

    profilePictureURL: {
        type: String, 
        require: false
    },

    backgroundPictureURL: {
        type: String, 
        require: false
    },

    adminIds: [{
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require: true
    }],

    invitedMemberIds: [{
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require: false
    }],

    visibility: {
        type: String,
        enum: visibilityInstitutionStatus,
        require: true
    },
    
}, {
    timestamps: true,
});

export const institutionModel = model<IInstitution>("Institution", institutionSchema);

