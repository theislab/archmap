import {Document, model, Schema} from "mongoose";

export enum visibilityStatus {
    "PRIVATE",
    "PUBLIC",
    "BY_INSTITUTION",
}
export interface IProject extends Document {
   title:string,
   description:string,
   profilePictureURL: string,
   backgroundPictureURL: string,
   adminIds: [Schema.Types.ObjectId],
   invitedMemberIds: [Schema.Types.ObjectId],
   memberIds: [Schema.Types.ObjectId],
   visibility: string,
   projectJobs: [Schema.Types.ObjectId],
}

const projectSchema = new Schema<IProject>({
    title: {
        type: String,
        required: true
    },

    description: {
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
        require: false
    }],

    invitedMemberIds: [{
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require: false
    }],

    memberIds: [{
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require: false
    }],

    visibility: {
        type: String,
        enum: visibilityStatus,
        required: true
    },

    projectJobs: [{
        type: Schema.Types.ObjectId, 
        ref: 'ProjectJob',
        require: false
    }],
    
}, {
    timestamps: true,
});

export const projectModel = model<IProject>("Project", projectSchema);

