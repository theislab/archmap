


export interface AddAtlasDTO {
    name: string;
    batch_key: string;
    cell_type_key: string;
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
    inrevision?: boolean;
    isPrivate?: boolean;
    benchmarked?: false;
}

export interface UpdateAtlasDTO {
    benchmark_location?: string;
    benchmarked?: boolean;

  }