module.exports = {
    mode: "development",
    entry: {
        "prac3-1": "./src/prac3-1.js",
        "prac3-2": "./src/prac3-2.js",
        "prac3-3": "./src/prac3-3.js",
        "prac3-4": "./src/prac3-4.js"
    },
    output: {
        filename: "[name].js"
    },
    devServer: {
        host: "localhost",
        port: 8083,
        static: {
            directory: __dirname
        },
        client: {
            webSocketURL: "ws://localhost:8083/ws"
        },
        devMiddleware: {
            writeToDisk: true
        }
    },
    performance: {
        hints: false,
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    },
    module: {
        rules: [
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
