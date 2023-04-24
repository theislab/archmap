from flask import Flask, request
import os
import init as scarches
from threading import Thread
from utils import utils, parameters
import traceback

app = Flask(__name__)

# Returns the file extension of the given query file path
def return_file_extension(file_path):
    allowed_extensions = ['.h5ad', '.rds']
    file_extension = os.path.splitext(file_path)[1]
    if file_extension not in allowed_extensions:
        raise ValueError('File extension not allowed: ' + file_extension + '. Allowed extensions are: ' + str(allowed_extensions) + '.')
    return file_extension

def get_from_config(configuration, key):
    if key in configuration:
        return configuration[key]
    return None

#TODO  add swagger documentation here
@app.route('/query', methods=['POST'])
def query():
    try:
        config = request.get_json(force=True)
        config[parameters.FILE_EXTENSION] = return_file_extension(get_from_config(config, parameters.QUERY_DATA_PATH))
        run_async = get_from_config(config, parameters.RUN_ASYNCHRONOUSLY)
        if run_async is not None and run_async:
            actual_config = scarches.merge_configs(config)
            thread = Thread(target=scarches.query, args=(config,))
            thread.start()
            return actual_config, 200
        else:
            actual_configuration = scarches.query(config)
            return actual_configuration, 200
    except Exception as e:
        traceback.print_exc()
        return {'error': str(e)}, 500


@app.route("/liveness")
def liveness():
    return "up"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
