import mongoose from 'mongoose';

import seedDataForProject from './test_files/test-seed-data-project.json'; 
import seedDataForAtlas  from './test_files/test-seed-data-atlas.json';

import dotenv from 'dotenv';
import { projectModel } from './database/models/project';
import { atlasModel } from './database/models/atlas';
dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.TEST_DATABASE_URI, { 
      // Other options if needed
    });
    await projectModel.deleteMany({}); // Clear the collection
    await atlasModel.deleteMany({}); // Clear the collection
    await projectModel.insertMany(seedDataForProject); // Insert the seed data
    await atlasModel.insertMany(seedDataForAtlas); // Insert the seed data
    console.log('Database successfully seeded');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
