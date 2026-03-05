module.exports = {
    apps: [
        {
            name: "orbitos-api",
            cwd: "./core-api",
            script: "dist/server.js",
            interpreter: "node",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 4000
            }
        },
        {
            name: "orbitos-bot",
            cwd: "./bot-engine",
            script: "dist/index.js",
            interpreter: "node",
            watch: false,
            env: {
                NODE_ENV: "production"
            }
        },
        {
            name: "orbitos-web",
            cwd: "./",
            script: "npm",
            args: "run start",
            interpreter: "node",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 3001
            }
        }
    ]
}
