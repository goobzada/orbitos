import chalk from 'chalk';

export const log = {
    info: (msg: string) => console.log(chalk.cyan(`[INFO] ${msg}`)),
    success: (msg: string) => console.log(chalk.green(`[OK] ${msg}`)),
    warn: (msg: string) => console.log(chalk.yellow(`[WARN] ${msg}`)),
    error: (msg: string) => console.error(chalk.red(`[ERROR] ${msg}`)),
    event: (msg: string) => console.log(chalk.magenta(`[EVENT] ${msg}`)),
    api: (msg: string) => console.log(chalk.blue(`[API] ${msg}`)),
};
