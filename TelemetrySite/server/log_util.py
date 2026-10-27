import logging
from logging.handlers import TimedRotatingFileHandler
import os
from flask import Flask, Request

def setup_file_handlers(app: Flask, sever_folder: str):
    print("LOGGER: Setting up files!") # Debug code
    logger = app.logger

    log_dir = os.path.join(sever_folder, 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - '
        '%(filename)s:%(lineno)d - %(message)s'
    )

    def file_namer(default_name):
        splited = default_name.split(".log")
        new_name = splited[0]+splited[1]+".log"
        return new_name

    # Makes a new log file every day, keeping 30 days worth of logs.
    time_handler = TimedRotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        when='midnight',
        delay=True, # If delay is set to False, everything catches on fire.
        interval=1,
        backupCount=30
    )
    time_handler.setFormatter(formatter)
    time_handler.setLevel(logging.INFO)
    time_handler.suffix = "%m-%d-%Y.log"
    time_handler.rotation_filename = file_namer

    # Separate error log for easier troubleshooting
    error_handler = TimedRotatingFileHandler(
        os.path.join(log_dir, 'error'),
        when='midnight',
        delay=True, # If delay is set to False, everything catches on fire.
        interval=1,
        backupCount=30
    )
    error_handler.setFormatter(formatter)
    error_handler.setLevel(logging.ERROR)
    error_handler.suffix = "%m-%d-%Y.log"
    error_handler.rotation_filename = file_namer

    # Setup the app logger stuff
    logger.addHandler(time_handler)
    logger.addHandler(error_handler)
    logger.setLevel(logging.DEBUG)

def log_info(app: Flask, request: Request, header: str, user_id: str, response: str):
    app.logger.info(f"{header} | User ID: {user_id} | IP: {request.remote_addr} | Method: {request.method} | Path: {request.path} | Response: {response}")

def log_warning(app: Flask, request: Request, header: str, user_id: str, reason: str, response: str):
    app.logger.warning(f"{header} | User ID: {user_id} | IP: {request.remote_addr} | Method: {request.method} | Path: {request.path} | Reason: {reason} | Response: {response}")