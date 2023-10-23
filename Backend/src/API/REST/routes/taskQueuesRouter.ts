import express, { Router } from "express";
import { validationMdw } from "../middleware/validation";
import { CloudTasksClient, protos } from "@google-cloud/tasks"



const exec_task_queues = (): Router => {

  let router = express.Router();
  router.post("/api/taskqueues",  validationMdw, async (req: any, res) => {
    try {  
        const project = "custom-helix-329116";
        const queue = 'gcp-test-queue';
        const location = 'europe-west3';
        const url = process.env.CLOUD_RUN_URL;
        const serviceAccountEmail = "app-engine-task-queue@custom-helix-329116.iam.gserviceaccount.com"
        

        const tasks = new CloudTasksClient({
          projectId: project,
          credentials: {
            client_email: process.env.TASK_QUEUE_EMAIL_ID,
            private_key: process.env.TASK_QUEUE_PRIVATE_KEY,
          },
        })

        // let { queryInfo } = req.body;

          const query_to_send = {
            "model": "scANVI",
            "atlas": "NSCLC",
            "output_path": "test_output/nsclc_scanvi_postman",
            "output_type": {
                "csv": false,
                "cxg": true
            },
            "model_path": "model.pt",
            "pre_trained_scANVI": true,
            "reference_data": "atlas/646ddfb9fd46b85aafce28cc/data.h5ad",
            "query_data": "query_test_data/nsclc_scanvi.h5ad",
            "ref_path": "model.pt",
            "scanvi_max_epochs_query": 5
          }

        const payload = query_to_send;
        // Construct the fully qualified queue name.
        const parent = tasks.queuePath(project, location, queue);

        const [tasks_in_queue] = await tasks.listTasks({parent: parent});
        const names = tasks_in_queue.map((t) => t.name)
        console.log(
          `${tasks_in_queue.length} tasks in queue ${queue} in location ${location} in project ${project}`,
            names
        )

        const task = {
            httpRequest: {
              headers: {
                  'Content-Type': 'application/json',
              },
              httpMethod: 'POST' as const,
              url,
              body: '', // or null
              oidcToken: {
                  serviceAccountEmail,
              },
            },
        };

        if(payload){
            task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString('base64');
        }
        console.log('Sending task:');
        console.log(task);
        const request = {parent: parent, task: task};

        //FIX THE CODE HERE
        const [response] = await tasks.createTask(request);
        console.log(`Created task ${response.name}`);
        res.status(200).send({ message: `Task ${response.name} created successfully` });
        
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).send({ error: 'Failed to create task' });
    }
  })
  return router;
}

export {exec_task_queues}