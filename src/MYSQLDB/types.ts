export interface iSelectTinfo {
    columns: string,
    identifier?: string,
    order?: {
        column?: string,
        type?: "ASC" | "DESC",
        limit?: number
    }

}


export interface iUpdateTableData {
    columns:   string[];
    values:       any[];
    identifier?: string;
}

export type tLogMethods = "select" | "selectSync" | "add" | "addSync" | "update" | "updateSync" | "delete" | "deleteSync";


/**
 * Languages
 * ```
 * "EN" - English
 * "RU" - Russian
 * "HY" - Armenian
 * "ES" - Spanish
 * "DE" - German
 * "UK" - Ukrainian
 * ```
 */
export type tLanguages = "EN" | "RU" | "HY" | "ES" | "DE" | "UK";
