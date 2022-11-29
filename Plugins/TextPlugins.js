/*
 * @LastEditors: haols
 */
class TestPlugins {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync('TestPlugins', (compilation, callback) => {
      const assets = compilation.assets;
      let content = `## 文件名          资源大小`;
      console.log('compilation.hooks', Object.keys(compilation.hooks).join('\n'));
      Object.entries(assets).forEach(([filename, statObj]) => {
        content += `\n ${filename}          ${statObj.size()}`;
      });
      assets[this.filename] = {
        source: () => {
          return content;
        },
        size() {
          return content.length;
        }
      }
      callback();
    })
  };
};
module.exports = TestPlugins
