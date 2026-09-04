/** The different types of boards. */
type BoardNames = "tms" | "imu" | "bms" | "tmu" | "pvc" | "mc";
/** All parts we collect context data in the form of configs for. BoardNames + bike.  */
type ConfigTypes = BoardNames | "bike";

/** Translation for the name we save configs under. ConfigTypes + "SavedName". */
type ConfigNames = `${ConfigTypes}SavedName`;

/**
 * Hold context for individual boards. Any board specific pieces go in "data"
 */
interface BoardConfig {
    hardwareRevision: string;
    firmwareCommitHash: string;
    name: string;

    data: Record<string, string>;
}

/**
 * Represent the configs for the Bike Context section.
 */
interface BikeConifg {
    name: string;

    /** Any board configs that are saved under this one. */
    savedConfigs: Record<BoardNames, string>;
    platform: string;
}

/**
 * Store all configs needed for context.
 */
interface ConfigStorage {
    tms: BoardConfig[];
    imu: BoardConfig[];
    bms: BoardConfig[];
    tmu: BoardConfig[];
    pvc: BoardConfig[];
    mc: BoardConfig[];
    bike: BikeConifg[];
}

/** Format for our data in database */
interface ContextData {
    /** Name of event */
    name: string;
    /** Date it occurred on */
    date: Date;
    /** True if this is race data, false if test or other */
    isRace: boolean;
    /** Location of event */
    location: string;
    /** If this data uploaded is junk/something went wrong */
    isJunkData: boolean;

    run: {
        /** Indicates which run this is */
        orderNumber: number;

        context: {
            /** Name of bike rider */
            riderName: string;
            /** Weight of rider in kg */
            riderWeight: number;
            /** Humidity of the day */
            humidity: number;
            /** Air Temperature of the day */
            airTemp: number;
            /** Speed of the wind of the day */
            windSpeed: number;
            /** Direction the wind is coming from */
            windDirection: number;
            /** Feedback the rider has while riding */
            riderFeedback: string;
            /** How far the bike traveled */
            distanceCovered: number;
            /** Time the bike started */
            startTime: Date;

            bikeConfig: {
                /** Name of the platform */
                platformName: string;
                /** Pressure of the tires */
                tirePressure: number;
                /** Volume of coolant in bike */
                coolantVolume: number;
                /** Saved name of this config */
                bikeSavedName: string;
            };
        };
    };
}

export type { BoardNames, ConfigTypes, ConfigNames, ContextData, BikeConifg, BoardConfig, ConfigStorage };
