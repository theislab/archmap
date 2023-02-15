var express = require("express");
var gcloud = require("../utils/gcloud-services");

var router = express.Router();

/**
 * Create new service
 */
router.post("/service", async function (req, res) {
  if (!req.body.location)
    return res.status(400).json({ error: "Bad request body." });

  const LOCATION = req.body.location;
  // Unique name based on timestamp and a random 6-digit number.
  const SERVICE_NAME = `cellxgene-annotate-${Date.now()}${Math.random()*999999 | 0}`;
  // call gcloud command to deploy new service
  let serviceURL = await gcloud.gCloudRunDeploy(SERVICE_NAME, LOCATION);
  // Set the IAM if it could not be set properly. 
  await gcloud.gCloudSetIAM(SERVICE_NAME);

  if (serviceURL == -1)
    return res.status(400).send("Could not create cellxgene service.");

  return res.status(200).json({ SERVICE_NAME, url: serviceURL });
});

/**
 * Get all existing services.
 */
router.get("/services", async function (req, res) {
  try{
    let services = await gcloud.getAllServices();
    res.status(200).json(services);
  }catch(err){
    console.log(err);
    return res.status(500).send("error occurred.");
  }
});

/**
 * Delete all services that have elapsed the stated timeout
 */
router.delete('/services', async function (req, res){
  try{
    let services = await gcloud.deleteAllCellxgeneServices();
    console.log(`Deleted:${services}`); 
    return res.status(200).json(service);
  }catch(err){
    console.log(err);
    return res.status(500).send("error occurred.");
  }
});

/**
 * Get information about an existing service with the corresponding id.
 */
router.get("/service/:id", async function (req, res) {
  let serviceName = req.params.id;
  try{
    let service = await gcloud.getService(serviceName);
    return res.status(200).json(service);
  }catch(err){
    console.log(err);
    return res.status(400).send("Bad body format.");
  }
});



module.exports = router;
