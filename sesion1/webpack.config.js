module.exports = {
    mode: "development",
    entry: {
        "prac1-1": "./src/prac1-1.js",
        "prac1-2": "./src/prac1-2.js",
        "prac1-3": "./src/prac1-3.js",
        "prac1-4": "./src/prac1-4.js",
        "prac1-5": "./src/prac1-5.js",
        "prac1-6": "./src/prac1-6.js"
    },
    output: {
        filename: '[name].js'
    },
    devServer: {
        static: {
            directory: __dirname
        },
        devMiddleware: {
            writeToDisk: true
        }
    },
    performance: {
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                type: 'javascript/auto',
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    }
};
