module.exports = {
    mode: "development",
    entry: {
        "prac2-1": "./src/prac2-1.js",
        "prac2-2": "./src/prac2-2.js",
        "prac2-3": "./src/prac2-3.js",
        "prac2-4": "./src/prac2-4.js",
        "prac2-5": "./src/prac2-5.js",
        "prac2-6": "./src/prac2-6.js",
        "prac2-7": "./src/prac2-7.js",
        "prac2-8": "./src/prac2-8.js",
        "prac2-9": "./src/prac2-9.js"
    },
    output: {
        filename: "[name].js"
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
                test: /\.glsl$/,
                use: {
                    loader: "webpack-glsl-loader"
                }
            },
            {
                test: /\.m?js$/,
                type: "javascript/auto",
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    }
};