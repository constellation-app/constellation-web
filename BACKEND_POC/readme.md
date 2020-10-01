# Constellation-Web Backend POC

This folder contains a proof of concept demonstrating the ability to provide a database backend to
support a web version of constellation. The Proof of concept has been developed using a technology
stack that utilises a Django Rest Framework backend accessing a MariaDB database. All of this runs
in a Python environment via a Docker image.

<a href="https://www.docker.com">
<img src="https://www.docker.com/sites/default/files/d8/Docker-R-Logo-08-2018-Monochomatic-RGB_Moby-x1.png" alt="Docker" width="100" height="100">
</a>
<a href="https://www.django-rest-framework.org/">
<img src="https://www.django-rest-framework.org/img/logo.png" alt="Docker" width="226" height="100">
</a>
<a href="https://mariadb.org/">
<img src="https://mariadb.org/wp-content/themes/twentynineteen-child/icons/mariadb_org_rgb_h.svg" alt="Docker" width="226" height="100">
</a>
<a href="https://www.rabbitmq.com/">
<img src="https://www.rabbitmq.com/img/logo-rabbitmq.svg" alt="RabbitMQ" width="226" height="100">
</a>

## Recommendations & Assumptions
This code has been optimized to work using PyCharm Community Edition as an IDE. While this is not
essential, it does make life much easier.
<a href="https://www.jetbrains.com/pycharm/download/#section=windows">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/PyCharm_Logo.svg/1200px-PyCharm_Logo.svg.png" alt="Pycharm" width="100" height="100">
</a>

## Setup Python Environment 
The following steps are designed to provide a virtual environment within PyCharm that corresponds to
the environment that is provided within the Docker container - this allows better IDE integration and
support while developing.
1. OpenPycharm, select Open and select the BACKEND_POC directory that this readme file is contained in.
2. Select Ctrl-Alt-S to open the Settings->Properties for the project.
3. In the Settings dialog, select the **Project: BACKEND_POC** and select **Python Interpreter**.
4. Click the Gear :gear: icon and select **Add...**.
5. Ensure **New environment** is enabled, use the default **Location** which should be a **venv** 
subdirectory of the BACKEND_POC directory.
6. Point the **Base interpreter** value at the python install (most likely set by default), and press
the **OK** button.
7. Finally, to update the virtual environment to include additional required packages, open a terminal
window from within the PyCharm project, confirm the prompt is preceeded with **(venv)** and that the
current directory is the **BACKEND_POC** directory. Enter the command  "pip install -r requirements.txt"
to install the required Python packages.

## Docker Setup
The Constellation web backend is designed to run in a Docker container. As such, Docker (and Docker
Compose) needs to be installed on the host machine. Installation of Docker varies between platforms and
is left to the reader to perform.
The following steps assume the user is running Docker from a Windows environment>
1. Open a powershell window, and navigate to the **BACKEND_POC** directory.
2. Execute the command "docker-compose up --build"
3. Wait for the Docker container to complete installation.
4. In a browser, navigate to **http://127.0.0.1:8000/** to view the Swagger REST API summary.

## Application Use
Users can  use the Swagger GUI directly to interact with the backend application, alternatively, the
Swagger API describes the available REST endpoints. These endpoints can be accessed directly. For
instance, the **attrib_types** endpoint provides a GET and a POST endpoint, both listing the URL
**/attrib_types/**. To access these endpoints using the direct REST GUI go to
**http://127.0.0.1:8000/attrib_types/**. These endpoints can be accessed directly from any frontend
client.

To view database content:
1. Open Docker Dashboard (in windows right click on docker icon in taskbar and select Dashboard)
2. Expand the backend_poc entry
3. Highlight the **backend_poc_db_8" instance and click on the CLI icon.
4. In the shell that opens, enter "mysql -p" and enter the root password defined in**docker-compose.yml**
5. Enter "use database docker-db";
Use normal SQL commands to interrogate the database.

## Message Broker
The default installation integrates a RabbitMQ message broker hooked into the Django application
using the Celery package. This implementation allows two key functionalities:
1. long running tasks to be configured to run asynchronously. An example task **import_starfile_task**
is found in **worker/tasks.py**. When triggered (via a call in the star file import code) a request to
execute is placed on a queue and processed by one of the available Celery worker processes. Users can
view the celery queues by going to **http://127.0.0.1:5555/**. Further information can be found at the
link https://pypi.org/project/django-celery/.
2. A set of RabbitMQ **Exchanges** are constructed that external applications can subscribe to using
standard RabbitMQ/message broker functionality. The following exchanges are provided:
    1. CONSTELLATION.Schema
    2. CONSTELLATION.Graph
    3. CONSTELLATION.Vertex
    4. CONSTELLATION.Transaction
3. A demo message consumer has been constructed called **sample_client.py** which can be run with the
command **python sample_client.py** - run iin a virtual environment using the supplied **requirements.txt**
configuration. This demo just sits in a loop and pulls messages off of the 4 identified exchanges which
it connects to with its own message queues. This functionality somewhat mirrors how external applications
may wish to interact with the message queue. The content supplied in the queue is essentially ID information
identifying records that are created/modified/deleted, which would alert subscribers to changes within
the web-constellation application and allow them to pull the changes using standard REST endpoints.
 

## View Models
To autogenerate a model diagram, the **graph_models** functionlaity from **django-extensions**
has been used. To use this refer to documentation here 
https://django-extensions.readthedocs.io/en/latest/graph_models.html, and here
https://simpleit.rocks/python/django/generate-uml-class-diagrams-from-django-models/
which outlines the process.
There is a dependency on the application GraphViz - found here https://graphviz.org/. Install this
application and add a link to its bin directory to your computers path (and restart PyCharm).
To generate graph, run the following command:
><em>python manage.py graph_models -a -g -I Schema,Graph,GraphAttrib,Vertex,VertexAttrib,Transaction,TransactionAttrib,GraphAttribDefGraph,GraphAttribDefVertex,G
raphAttribDefTrans,SchemaAttribDefGraph,SchemaAttribDefVertex,SchemaAttribDefTrans,AttribType,SchemaBaseAttribDef,GraphBaseAttribDef -o models.png</em>

Note, this lists explict models to plot.


