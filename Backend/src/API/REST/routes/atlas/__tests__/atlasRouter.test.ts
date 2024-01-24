import express from 'express';
import request from 'supertest';
import upload_start_upload_for_atlas_route from '../../file_upload/start_upload_for_atlas';


const app = express();
app.use(express.json());
app.use('/api/atlases', upload_start_upload_for_atlas_route); // Mount your router on the express app

describe('Atlas Router', () => {

  it('should retrieve atlas details successfully', async () => {
    // Mock any necessary functionality or data
    // Perform the request using supertest
    // const response = await request(app).get('/api/atlases/atlas/123');
    // Expectations
    // expect(response.status).toBe(200);
  });

  // More tests for other endpoints
});
