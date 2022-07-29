import { execSync } from 'child_process';

let gitPuller = null;

if (process.env.USER === 'pi') {
  gitPuller = setTimeout(() => {
    try {
      execSync('git fetch');
      const localHash = execSync('git rev-parse HEAD', { encoding: 'utf8' });
      const remoteHash = execSync(`git rev-parse 'main@{upstream}'`, {
        encoding: 'utf8',
      });

      if (localHash !== remoteHash) {
        console.log(`localHash=${localHash}, remoteHash=${remoteHash}`);
        console.log(`Updating code...`);
        execSync('git pull');
        console.log(`Updated code`);
      }
    } catch {
      console.log('failed to pull');
    }
  }, 60_000);
}

export {};
