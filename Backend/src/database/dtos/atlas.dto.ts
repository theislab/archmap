


export interface AddAtlasDTO {
    name: string;
    batchKey: string;
    cellTypeKey: string;
    previewPictureURL: string;
    classifierLabels: Array<string>;
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
    doi?: string;
    samples?: number;
    individuals?: number;
    datasets?: number;
}

export interface UpdateAtlasDTO {
    benchmark_location?: string;
    benchmarked?: boolean;

  }