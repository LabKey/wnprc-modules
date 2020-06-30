module.exports = {
    "roots": [
        "<rootDir>/src"
    ],
    "globals": {
        "LABKEY": {}
    },
    "transform": {
        "^.+\\.tsx?$": "ts-jest",
        ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
}