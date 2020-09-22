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
