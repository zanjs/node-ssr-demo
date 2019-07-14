const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const NJKHtmlWebpackPlugin = require('../plugin/njk-html-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const ExtractTextWebapckPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin") 
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// 多入口
const entry = require('./webpack.entry');
const hostCDN = '/'
// const hostCDN = 'http://127.0.0.1:5000/'
const njktemplate = {
  'template': 'template',
  'error': 'error'
}

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
      cacheGroups: {
        commons: {
          chunks: "initial",
          name: "common",
          minChunks: 2,
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0, // This is example is too small to create commons chunks
          reuseExistingChunk: true // 可设置是否重用该chunk（查看源码没有发现默认值）
        }
      },
    },
    runtimeChunk: {
      name: entrypoint => `manifest.${entrypoint.name}`
    }
  },
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        include: [path.resolve('src')], //限制范围，提高打包速度
        exclude: /node_modules/
      },
      // {
      //   test: /\.css$/,
      //   use: ExtractTextWebapckPlugin.extract({
      //       fallback: 'style-loader',
      //       use: ['css-loader', 'postcss-loader'] // 不再需要style-loader放到html文件内
      //   }),
      //   include: path.join(__dirname, 'src'), //限制范围，提高打包速度
      //   exclude: /node_modules/
      // },
      { // 转换less 并交给MiniCssExtractPlug插件提取到单独文件
        test: /\.less$/,
        loader: ['css-hot-loader',MiniCssExtractPlugin.loader,  'css-loader','postcss-loader', 'less-loader'],
        exclude: /node_modules/
      },
      {
        test:/\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
        include: [path.resolve('src')],
        exclude: /node_modules/
      },
      // { // 转换less 并交给MiniCssExtractPlug插件提取到单独文件
      //   test: /\.less$/,
      //   loader: [MiniCssExtractPlugin.loader,  'css-loader', 'less-loader'],
      //   exclude: /node_modules/
      // },
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
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash:4].[ext]',
            outputPath: './font',
         }
        }]
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    // 删除上一次打包目录(一般来说删除自己输出过的目录 )
    new CleanWebpackPlugin(['dist', 'views'], {
      // 当配置文件与package.json不再同一目录时候需要指定根目录
      root: path.resolve() 
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp:/\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
        modules: false,
      },
      canPrint: true
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[hash:6].css",
      chunkFilename: "css/[name].[hash:6].css"
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
    ...Object.keys(njktemplate).map(item => new NJKHtmlWebpackPlugin({
      inject: false,
      filename: path.resolve('views/'+ item +'.html'),
      template: path.resolve('src/views/' + item + '.html')
    })),
    ...Object.keys(entry).map(item => new NJKHtmlWebpackPlugin({
      inject: false,
      filename: path.resolve('views/' + entry[item].split('/').slice(-2).join('/').replace('js', 'html')),
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
    })),
    // new ParallelUglifyPlugin({
    //   // 传递给 UglifyJS的参数如下：
    //   uglifyJS: {
    //     output: {
    //       /*
    //        是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，
    //        可以设置为false
    //       */
    //       beautify: false,
    //       /*
    //        是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
    //       */
    //       comments: false
    //     },
    //     compress: {
    //       /*
    //        是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用
    //        不大的警告
    //       */
    //       warnings: false,

    //       /*
    //        是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
    //       */
    //       drop_console: true,

    //       /*
    //        是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不
    //        转换，为了达到更好的压缩效果，可以设置为false
    //       */
    //       collapse_vars: true,

    //       /*
    //        是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成
    //        var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
    //       */
    //       reduce_vars: true
    //     }
    //   }
    // }),
  ]
});