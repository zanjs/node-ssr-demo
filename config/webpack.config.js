const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const NJKHtmlWebpackPlugin = require('../plugin/njk-html-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// 多入口
let entry = {
  home: 'src/js/home/home.js',
  user: 'src/js/user/user.js'
}

const hostCDN = 'http://127.0.0.1:5000/'

module.exports = evn => ({
  mode: evn.production ? 'production' : 'development',
  // 给每个入口 path.reslove 
  entry: Object.keys(entry).reduce((obj, item) => (obj[item] = path.resolve(entry[item])) && obj, {}),
  output: {
    publicPath: evn.production ? hostCDN : '/',
    filename: 'js/[name].[hash:8].js',
    path: path.resolve('dist')
  },
  optimization: {
    splitChunks: {
      chunks: 'initial',
      automaticNameDelimiter: '.',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 1
        }
      }
    },
    runtimeChunk: {
      name: entrypoint => `manifest.${entrypoint.name}`
    }
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       // 注意: priority属性
  //       // 其次: 打包业务中公共代码
  //       common: {
  //         name: "common",
  //         chunks: "all",
  //         minSize: 2,
  //         priority: 0
  //       },
  //       // 首先: 打包node_modules中的文件
  //       vendor: {
  //         name: "vendor",
  //         test: /[\\/]node_modules[\\/]/,
  //         chunks: "all",
  //         priority: 10
  //       }
  //     }
  //   }
  // },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      { // bable 根据需要转换到对应版本 
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      { // 转换less 并交给MiniCssExtractPlug插件提取到单独文件
        test: /\.less$/,
        loader: [MiniCssExtractPlugin.loader,  'css-loader', 'less-loader'],
        exclude: /node_modules/
      },
      { //将css、js引入的图片目录指到dist目录下的images 保持与页面引入的一致
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            outputPath: './img',
         }
        }]
      },
      // {
      //   test: /\.(htm|html)$/i,
      //   loader: withImg
      // },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: './font',
         }
        }]
      }
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    // 删除上一次打包目录(一般来说删除自己输出过的目录 )
    new CleanWebpackPlugin(['dist', 'views'], {
      // 当配置文件与package.json不再同一目录时候需要指定根目录
      root: path.resolve() 
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[hash:6].css",
      chunkFilename: "[id].css"
    }),
    // 将src下的静态资源平移到dist目录
    new CopyWebpackPlugin(
      [{
        from: path.resolve('src/static'),
        to: path.resolve('dist/static')
      }
    ]),
    // 将src下的njk模板平移到 编译后的 Views 目录
    new CopyWebpackPlugin(
      [{
        from: path.resolve('src/views/_component'),
        to: path.resolve('views/_component')
      }
    ]),
    ...Object.keys(entry).map(item => new NJKHtmlWebpackPlugin({
      inject: false,
      filename: path.resolve('views/' + entry[item].split('/').slice(-2).join('/').replace('js', 'html')),
      // 基准页面
      template: path.resolve('src/views/' + entry[item].split('/').slice(-2).join('/').replace('js', 'html'))
    })),
    // HtmlWebpackPlugin 每个入口生成一个html 并引入对应打包生产好的js
    ...Object.keys(entry).map(item => new HtmlWebpackPlugin({
      // 模块名对应入口名称
      chunks: [item],
      // hash: true,
      minify: {
        removeComments: evn.production ? true : false, // 移除HTML中的注释
        collapseWhitespace: evn.production ? true : false, // 删除空白符与换行符
        minifyCSS: true// 压缩内联css
      },
      // 输入目录 (可自行定义 这边输入到views下面的_layout)
      filename: path.resolve('views/_layout/' + entry[item].split('/').slice(-2).join('/').replace('js', 'html')),
      // 基准模板
      template: path.resolve('src/views/_layout/template.html')
    }))
  ]
});