


export interface AddAtlasDTO {
    name: string;
    previewPictureURL: string;
    modalities: Array<string>;
    numberOfCells: number;
    species: Array<string>;
    compatibleModels: string[];
    uploadedBy: string;
    atlasUrl: string;
    atlasUploadId?: string;
    classifierUploadId?: string;
    vars?: string;
    counts?: string;
}