// Mock file for imported css styling from Pintura
// Had to make this work around for jest testing because existing mocks in jest.config.ts could not identify this imported css as a module,
// and as this css is from Pintura directly we need to work around this rather than being able to directly mark it as a module like with our
// other css files
module.exports = {};