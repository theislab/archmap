import mongoose from 'mongoose';
import supertest from 'supertest';
import dotenv from 'dotenv';
import { HTTP_Server } from '../../../../http_server/http_server';
import API_Host from '../../../_api_host';
import { userModel } from '../../../../database/models/user';


dotenv.config();

let http_server: HTTP_Server; 
let apiHost: API_Host;
const uniqueEmail = `testuser_${new Date().getTime()}@example.com`;


beforeAll(async () => {
  console.log('Connecting to test database...', process.env.TEST_DATABASE_URI);
  await mongoose.connect(process.env.TEST_DATABASE_URI, { /* options */ });

  http_server = new HTTP_Server(); // Initialize it here
  apiHost = new API_Host(http_server);
  await http_server.setup();
  await apiHost.init();
});

afterAll(async () => {
  await userModel.deleteMany({ email: uniqueEmail });
  await mongoose.disconnect();
  if (http_server) {
    await http_server.shutdown(); // Use it here
  }
});

describe('Register Routes', () => {
  test('POST /v1/register should return all projects', async () => {
    const app = apiHost.getExpressApp();
    const user = {
        first_name: 'Test',
        last_name: 'User',
        email: uniqueEmail,
        password: 'testpassword',
        note: 'Test note',
        permissionRequested: true
    };
    const response = await supertest(app).post('/v1/register').send(user);
    expect(response.status).toBe(201);
  });

  // Additional test cases for other scenarios and endpoints
});
