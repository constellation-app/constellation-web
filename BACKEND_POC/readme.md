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

## Setup Python Environment
TODO
(In python shell traverse to the django subdirectory and run the commands "manage.py makemigrstions" and "manage.py migrate" to create)

## Prepare Database For Use
TODO

## Start Backend Server
TODO