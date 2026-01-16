// Simple transformer to replace import.meta.env with a global mock
const tsJest = require('ts-jest').default;

const tsJestTransformer = tsJest.createTransformer({
  tsconfig: {
    jsx: 'react-jsx',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
  },
  isolatedModules: true,
});

module.exports = {
  process(src, filename, config, options) {
    // Replace import.meta.env with globalThis.__importMetaEnv__
    let transformedSrc = src;
    
    // Replace import.meta.env with global mock
    transformedSrc = transformedSrc.replace(
      /import\.meta\.env/g,
      'globalThis.__importMetaEnv__'
    );
    
    // Use ts-jest for TypeScript transformation
    return tsJestTransformer.process(transformedSrc, filename, config, options);
  },
};
