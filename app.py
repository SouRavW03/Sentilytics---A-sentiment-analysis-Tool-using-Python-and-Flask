
# ? APP.PY

# Importing dependencies.
from flask import Flask
from views import views
from dotenv import load_dotenv  # Import for loading environment variables
import os  # Import to access environment variables

# Load environment variables from .env file
load_dotenv()

# Accessing the environment variables (just an example, you can use them as needed)
huggingface_cache = os.getenv('S:\# New PROJECT CACHE DIR\huggingface_cache')
torch_cache = os.getenv('S:\# New PROJECT CACHE DIR\torch_cache')


# Creating a Flask application and registering the view.
app = Flask(__name__)
app.register_blueprint(views, url_prefix="/")

# Run the Flask application.
if __name__ == "__main__":
    app.run(debug=True)