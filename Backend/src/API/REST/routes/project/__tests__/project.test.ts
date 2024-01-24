import mongoose from 'mongoose';
import supertest from 'supertest';
import dotenv from 'dotenv';
import { HTTP_Server } from '../../../../../http_server/http_server';
import API_Host from '../../../../_api_host';

dotenv.config();

let http_server: HTTP_Server; 
let apiHost: API_Host;
let token;



beforeAll(async () => {
  console.log('Connecting to test database...', process.env.TEST_DATABASE_URI);
  await mongoose.connect(process.env.TEST_DATABASE_URI, { /* options */ });

  http_server = new HTTP_Server(); // Initialize it here
  apiHost = new API_Host(http_server);
  await http_server.setup();
  await apiHost.init();
  const app = apiHost.getExpressApp();
  const loginDetails = {
    email: 'testuser@example.com',
    password: 'testpassword'
  };
  const response = await supertest(app).post('/v1/auth').send(loginDetails);

  expect(response.status).toBe(200);
  token = response.body.jwt; 
}, 10000);

afterAll(async () => {
  await mongoose.disconnect();
  if (http_server) {
    await http_server.shutdown(); // Use it here
  }
});

describe('Project Routes', () => {
  test('GET /projects should return all projects', async () => {
    const app = apiHost.getExpressApp();
    const response = await supertest(app).
    get('/v1/projects')
    .set('Authorization', `Bearer ${token}`);  // Set the authorization header with the token


    expect(response.status).toBe(200);
  });

  // Additional test cases for other scenarios and endpoints
});
