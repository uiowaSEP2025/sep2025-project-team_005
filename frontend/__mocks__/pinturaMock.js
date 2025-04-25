// Mock export of Pintura JS library:
// Pintura ships as an ES module using export/import syntax, but ts-jest cannot process these modules without explicit configuration
module.exports = {
    getEditorDefaults: jest.fn(() => ({})),
};