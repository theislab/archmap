Build the image:
docker built -t load_balancer .

Start the container: 
docker run -it --rm -p 8080:8080 load_balancer

