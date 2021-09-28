import dotenv from 'dotenv';
import convict from 'convict';
import Fs from 'fs-extra';

dotenv.config();

const pathFile = './config.json';

const schema = {
    yoomoney: {
        cookies: {
            SessionToken: {
                default: '',
                format: String,
            },
        },
        login: {
            default: '',
            format: String,
        },
        password: {
            default: '',
            format: String,
        },
    },
};

export const config = convict(schema);

if (!Fs.existsSync(pathFile)) {
    console.log(`Created new config file "${pathFile}"`);
    Fs.outputFileSync(pathFile, config.toString());
}

config.loadFile(pathFile).validate();
