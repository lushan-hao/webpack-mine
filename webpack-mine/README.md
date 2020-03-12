##### 按照https://github.com/YvetteLau/webpack/进行学习的     
核心  
```
entry:入口   
output: 输出    
loader : 原模块按照需求转换   
plugins : 扩展插件
```   
开始   
```
安装 webpack  webpack-cli
webpack 默认入口是./src  默认打包到dist/main.js
```
将js转换为低版本
```
安装babel-loader   
配置webpack.config.js   创建 .babelrc    配置babel   
```  
mode  
```
规定模式   
```
浏览器查看页面   
```
安装html-webpack-plugin   
引入 ： const HtmlWebpackPlugin = require('html-webpack-plugin');   
配置
 plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", //文件入口
      filename: "index.html", //输出文件
      minify: {
        removeAttributeQuotes: false, //属性移除双引号
        collapseWhitespace: false //是否折叠空白
        //   hash : true                   //是否加上hash
      }
    })
  ]  
  
  
  html-webpack-plugin 的 config 的妙用   
  我们的脚手架不仅仅给自己使用，也许还提供给其它业务使用，
  
查看  
npm install webpack-dev-server -D   
修改package.json  
"scripts": {
    "dev": "NODE_ENV=development webpack-dev-server",
    "build": "NODE_ENV=production webpack"
},

```
定位源码   
```
devtool: 'cheap-module-eval-source-map' //开发环境下使用
```

处理文件样式   
```
npm install style-loader less-loader css-loader postcss-loader autoprefixer less -D
webpack 不能直接处理 css，需要借助 loader    
style-loader 动态创建 style 标签，将 css 插入到 head 中.
css-loader 负责处理 @import 等语句。   
``` 

处理图片   
```
我们可以使用 url-loader 或者 file-loader 来处理本地的资源文件。url-loader 和 file-loader 的功能类似，但是 url-loader 可以指定在文件大小小于指定的限制时，返回 DataURL，因此，个人会优先选择使用 url-loader。

```  
处理html里面的图片     
```
npm install html-withimg-loader -D  

```

入口配置   
```
entry: [
    './src/polyfills.js',
    './src/index.js'
]
```
出口配置   
```
const path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'), //必须是绝对路径
        filename: 'bundle.js',
        publicPath: '/' //通常是CDN地址
    }
}
```
每次打包前清空dist目录
```
npm install clean-webpack-plugin -D  
const { CleanWebpackPlugin } = require('clean-webpack-plugin');   
plugins: [
        //不需要传参数喔，它可以找到 outputPath
        new CleanWebpackPlugin() 
    ]
希望dist目录下某个文件夹不被清空  
new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns:['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
        })  
```

静态资源拷贝   
```
CopyWebpackPlugin，它的作用就是将单个文件或整个目录复制到构建目录。   
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    //...
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'public/js/*.js',
                to: path.resolve(__dirname, 'dist', 'js'),
                flatten: true,           //否则会把路径都拷贝过去
            }
        ], {
            ignore: ['other.js']     //过滤文件
        })
    ]
}
```
ProvidePlugin   
```
不需要 import 或 require 就可以在项目中到处使用
const webpack = require('webpack');
module.exports = {
    //...
    plugins: [
        new webpack.ProvidePlugin({
            React: 'react',
            Component: ['react', 'Component'],
            Vue: ['vue/dist/vue.esm.js', 'default'],
            $: 'jquery',
            _map: ['lodash', 'map']
        })
    ]
}
不用每次引用react vue ...
```
抽离CSS   
```
将CSS文件单独打包，这可能是因为打包成一个JS文件太大，影响加载速度，也有可能是为了缓存   
npm install mini-css-extract-plugin -D    
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css' //个人习惯将css文件放在单独目录下
        })
    ],
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader, //替换之前的 style-loader
                    'css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')({
                                        "overrideBrowserslist": [
                                            "defaults"
                                        ]
                                    })
                                ]
                            }
                        }
                    }, 'less-loader'
                ],
                exclude: /node_modules/
            }
        ]
    }
}
```
抽离出来的css文件进行压缩   
```
使用 mini-css-extract-plugin，CSS 文件默认不会被压缩，如果想要压缩，需要配置 optimization，首先安装 optimize-css-assets-webpack-plugin.   
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = {
    entry: './src/index.js',
    //....
    plugins: [
        new OptimizeCssPlugin()
    ],
}
```
按需加载   
```
npm install @babel/plugin-syntax-dynamic-import -D
webpack 遇到 import(****) 这样的语法的时候，会这样处理：
以**** 为入口新生成一个 Chunk
当代码执行到 import 所在的语句时，才会加载该 Chunk 所对应的文件（如这里的1.bundle.8bf4dc.js）
```
热更新   
```
首先配置 devServer 的 hot 为 true
并且在 plugins 中增加 new webpack.HotModuleReplacementPlugin()
```
多页应用打包   
```
module.exports = {
entry: {
        index: './src/index.js',
        login: './src/login.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:6].js'
    },
    //...
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', //打包后的文件名
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './public/login.html',
            filename: 'login.html', //打包后的文件名
            chunks: ['login']
        }),
    ]
}
```
resolve 配置   
```

```
区分不同的环境   
```
webpack-merge 专为 webpack 设计，提供了一个 merge 函数，用于连接数组，合并对象。   
webpack.config.base.js 中是通用的 webpack 配置   
```
定义环境变量   
DefinePlugin 中的每个键，是一个标识符.   
```
//webpack.config.dev.js
const webpack = require('webpack');
module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            DEV: JSON.stringify('dev'), //字符串
            FLAG: 'true' //FLAG 是个布尔类型
        })
    ]
}
//index.js
if(DEV === 'dev') {
    //开发环境
}else {
    //生产环境
}
```
利用webpack解决跨域问题   
```
配置代理

修改 webpack 配置:

//webpack.config.js
module.exports = {
    //...
    devServer: {
        proxy: {
            "/api": "http://localhost:4000"
        }
    }
}  

```
前端模拟数据   
```
使用 mocker-api mock数据接口   
npm install mocker-api -D   

```
















