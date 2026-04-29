module.exports = {
    mode: "development",
    entry: {
        "prac6-1": "./src/prac6-1.js",
        "prac6-2": "./src/prac6-2.js",
        "prac6-3": "./src/prac6-3.js",
        "prac6-4": "./src/prac6-4.js"
    },
    output: {
        filename: "[name].js"
    },
    devServer: {
        host: "localhost",
        port: 8080,
        static: {
            directory: __dirname
        },
        client: {
            webSocketURL: "ws://localhost:8080/ws"
        },
        devMiddleware: {
            writeToDisk: true
        }
    },
    performance: {
        hints: false
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
