const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const isDev = process.env.NODE_ENV === "development";
const config = require("./public/config")[isDev ? "dev" : "build"];
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = {
  mode: isDev ? "development" : "production",
  entry: "./src/index.js", //webpack的配置文件
  output: {
    path: path.resolve(__dirname, "dist"), //必须是绝对路径
    filename: "bundle.[hash].js",
    publicPath: "/" //通常是CDN地址
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  corejs: 3
                }
              ]
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader, //替换之前的 style-loader
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function() {
                return [
                  require("autoprefixer")({
                    overrideBrowserslist: ["defaults"]
                  })
                ];
              }
            }
          },
          "less-loader"
        ],
        exclude: /node_modules/
      },
      {
        test: /.html$/,
        use: "html-withimg-loader"
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              outputPath: "assets",
              limit: 10240, //10K
              esModule: false
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  //   数组放着所有webpack插件
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html", //打包后的文件名
      config: config.template,
      hash: true //是否加上hash，默认是 false
    }),
    //不需要传参数喔，它可以找到 outputPath
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: "public/js/*.js",
        to: path.resolve(__dirname, "dist", "js"),
        flatten: true
      }
      //还可以继续配置其它要拷贝的文件
    ]),
    new MiniCssExtractPlugin({
      filename: "css/[name].css" //个人习惯将css文件放在单独目录下
    }),
    new OptimizeCssPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    port: "3000", //默认是8080
    quiet: false, //默认不启用
    inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
    stats: "errors-only", //终端仅打印 error
    overlay: false, //默认不启用
    clientLogLevel: "silent", //日志等级
    compress: true, //是否启用 gzip 压缩
    hot: true
  },
  devtool: "cheap-module-eval-source-map" //开发环境下使用
};
