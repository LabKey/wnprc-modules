export declare class Async {
    private randomPartGenerator;
    /**
     * Overrides the default, random character generator for generating ids.
     *
     * @param {() => string} val - New function to execute when generating ids (or null to restore the default)
     */
    RandomPartGenerator: (() => Promise<string>) | null;
    /**
     * Generates a new DefaultPrimateId with the passed prefix. If the prefix
     * is shorter than expected, it will be right-padded to the correct
     * length.
     *
     * @param {string} prefix - Prefix to prepend on the id
     * @returns {string} Newly-generated DefaultPrimateId value
     * @throws {Error} Will throw if the passed prefix is too long or if the random part generator is invalid.
     */
    Generate(prefix: string): Promise<string>;
    /**
     * Validates the passed DefaultPrimateId value based on its length and check digit.
     *
     * @param {string} id - DefaultPrimateId to validate
     * @returns {boolean} True if valid, false otherwise
     */
    IsValid(id: string): boolean;
    private GenerateRandomPart();
}
export declare class Sync {
    private randomPartGenerator;
    /**
     * Overrides the default, random character generator for generating ids.
     *
     * @param {() => string} val - New function to execute when generating ids (or null to restore the default)
     */
    RandomPartGenerator: (() => string) | null;
    /**
     * Generates a new DefaultPrimateId with the passed prefix. If the prefix
     * is shorter than expected, it will be right-padded to the correct
     * length.
     *
     * @param {string} prefix - Prefix to prepend on the id
     * @returns {string} Newly-generated DefaultPrimateId value
     * @throws {Error} Will throw if the passed prefix is too long or if the random part generator is invalid.
     */
    Generate(prefix: string): string;
    /**
     * Validates the passed DefaultPrimateId value based on its length and check digit.
     *
     * @param {string} id - DefaultPrimateId to validate
     * @returns {boolean} True if valid, false otherwise
     */
    IsValid(id: string): boolean;
    private GenerateRandomPart();
}
