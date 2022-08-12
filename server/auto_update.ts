import { exec as exexCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(exexCb);

const updateServer = async () => {
    if (process.env.USER !== 'pi') {
        console.log('pretend update');
        return;
    }
    try {
        await exec('git fetch');
        const { stdout: localHash } = await exec('git rev-parse HEAD', {
            encoding: 'utf8',
        });
        const { stdout: remoteHash } = await exec(
            `git rev-parse 'main@{upstream}'`,
            { encoding: 'utf8' }
        );

        if (localHash !== remoteHash) {
            console.log(`localHash=${localHash}, remoteHash=${remoteHash}`);
            console.log(`Updating code...`);
            await exec('git pull');
            console.log(`Updated code`);
        }
    } catch {
        console.log('failed to pull');
    }
};

export { updateServer };
