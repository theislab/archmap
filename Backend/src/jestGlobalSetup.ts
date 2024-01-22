import { execSync } from 'child_process';
import path from 'path';

const globalSetup = async (): Promise<void> => {
  const seedFilePath = path.join(__dirname, 'seed.ts');
  execSync(`ts-node ${seedFilePath}`);
};

export default globalSetup;