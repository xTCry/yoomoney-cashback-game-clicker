import Readline from 'readline';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const rl = Readline.createInterface(process.stdin, process.stdout);
export const questionAsync = (question) =>
    new Promise<string>((resolve) => {
        rl.question(question, resolve);
    });
