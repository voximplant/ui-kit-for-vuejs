module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    module: {
      rules: [
        {
          resourceQuery: /blockType=i18n/,
          type: 'javascript/auto',
          loader: '@intlify/vue-i18n-loader',
        },
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  },
};
