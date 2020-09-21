# Constellation-Web Backend POC

This folder contains a proof of concept demonstrating the ability to provide a database backend to support a web version of constellation.
The Proof of concept has been developed using Python/Django/DjangoRest Framework as a technology stack accessing a local mysql database.
Future documentation will outline process for installing this backend.
Note this POC has been developed on Windows, but equally would work in a Linux environment with appropriate alterations to environment.

## Prerequisites
* A mysql instance is installed and running on localhost https://dev.mysql.com/downloads/installer/
* Python 3.* installed (POC developed with Python 3.8) https://www.python.org/downloads/

## Recommendations & Assumptions
The following steps assume pycharm (community edition) is installed:
* Install pycharm as an IDE which has integrated functionality to support virtual python environments (and Django - for the professional edition) https://www.jetbrains.com/pycharm/

## Database Setup
The following steps will change based on choice of database, but for MySQL the following steps should work:
* Access the mysql instance via the supplied shell as admin and create a new database "CREATE DATABASE constellation_db;" Note this database name corresponds to values set in the settings file and can be changed as appropriate, both in the database and in the settings.py file.
* Create a new user for the database created above with the command "CREATE USER 'consty'@'localhost' IDENTIFIED BY 'password';". Note this user and password corresponds to values set in the settings file and can be changed as appropriate, both in the database and in the settings.py file.
* Assign permissions to the database user "GRANT ALL PRIVILEGES ON constellation_db.* TO 'consty'@'localhost';"

## Setup Python Environment (Windows/PyCharm)
The following steps are used to prepare a valid python virtual environment, using PyCharm:
* In PyCharm, select **Open**, select the **django** subdirectory and press the **OK** button. This will open the Django project within PyCharm.
* Select **File->Settings**, expand the **Project:django** item and click on **Python Interpreter**.
* Click the Gear :gear: icon and select **Add...**.
* Ensure **New environment** is selected and set the following values:
  * **Location** to a new folder **venv** within  the **django** folder
  * **Base interpreter** to the location of the installed python application
* Press the **OK** button and wait for the virtual environment to be created (this may take a minute or so)
* Press **OK** again to close the **Settings** dialog (A new **venv** folder should be shown in PyCharm under the **django** folder 
* Select **View->Tool Windows->Terminal** to open a new terminal window and converm the command prompt is prefixed with **(venv)**, if not, close the **Local** tab and reopen.
* Enter the command "pip install -r requirements.txt" and wait for the required libraries are added

## Prepare Database For Use
The following steps are used to provision the database structure into the linked database identified above:
* In a terminal shell within PyCharm (as launched above), from within the django directory, enter the command "manage.py makemigrations"
* Confirm there were no errors and run the command "manage.py migrate"

## Start Backend Server
To start the backend server run the command "manage.py runserver", this command should trigger the launch of the backend server and identify the root URL to access it, ie "http://127.0.0.1:8000".