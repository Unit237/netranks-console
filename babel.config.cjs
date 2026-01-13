module.exports = {
  plugins: [
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            // Transform import.meta.env to process.env or a global
            if (
              path.node.meta.name === 'import' &&
              path.parent.type === 'MemberExpression' &&
              path.parent.property.name === 'env'
            ) {
              path.parentPath.replaceWithSourceString('globalThis.__importMetaEnv__');
            }
          },
        },
      };
    },
  ],
};
