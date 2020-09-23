@ECHO OFF
REM Helper script to help copy star files to the Docker container in
REM preperation to upload to database with the /import REST endpoint
SET FILENAME=%~nx1
SET PATH=%~dp0
IF "%1" == "" GOTO ShowUsage
  SET FILEPATH=%1%
  IF "%FILEPATH:~-4%"=="star" (
    IF exist %FILEPATH% (
	  copy %FILEPATH% %PATH%\import
	  ECHO INFO: %FILEPATH% uploaded, use the text {"filename": "%FILENAME%"} in /import POST body
    ) ELSE (
      ECHO ERROR: The file %FILEPATH% doesn't exist
    )
    GOTO Done
  ) ELSE (
    ECHO ERROR: The file %FILEPATH% is not a .star file
	GOTO Done
  )
  IF exist %FILEPATH% (
    ECHO File: %FILEPATH% exists
  ) ELSE (
    ECHO ERROR: The file %FILEPATH% doesn't exist
  )
  GOTO Done
:ShowUsage
  ECHO USAGE: %0% [file to copy]
:Done