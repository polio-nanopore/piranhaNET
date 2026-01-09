export interface AppSettings {
    //Run settings
    outputFolder: string,
    userName: string,
    institute: string,
    orientation: "vertical" | "horizontal",
    protocol: "stool" | "environmental" | "isolate",
    positiveControl: string,
    negativeControl: string,
    //Piranha output settings
    publishFolder: string,
    outputPrefix: string,
    overwriteOutput: boolean,
    outputIntermediateFiles: boolean,
    allMetadataToHeader: boolean,
    dateStamp: boolean,
    // Piranha analysis settings
    analysisMode: string,
    medakaModel: string,
    minMappingQuality: number,
    minReadLength: number,
    maxReadLength: number,
    minReadDepth: number,
    minReadPercentage: number,
    primerLength: number
}

const defaultAppSettings = {
    //Run settings
    outputFolder: "",
    institute: "",
    orientation: "vertical",
    protocol: "stool",
    positiveControl: "positive",
    negativeControl: "negative",
    //Piranha output settings
    publishFolder: "",
    outputPrefix: "analysis",
    overwriteOutput: false,
    outputIntermediateFiles: false,
    allMetadataToHeader: false,
    dateStamp: false,
    // Piranha analysis settings
    analysisMode: "vp1",
    medakaModel: "r941_min_hac_variant_g507",
    minMappingQuality: 0,
    minReadLength: 1000,
    maxReadLength: 1300,
    minReadDepth: 50,
    minReadPercentage: 0,
    primerLength: 30
};

const key = "piranhaNETAppSettings";

export const loadSettings = () => {
    const saved = localStorage.getItem(key);
    if (saved) {
        return JSON.parse(saved) as AppSettings;
    } else {
        return {...defaultAppSettings};
    }
};

export const saveSettings = (appSettings: AppSettings) => {
    console.log("saving settings to store")
    localStorage.setItem(key, JSON.stringify(appSettings));
};