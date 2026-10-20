import logging
from logging.handlers import TimedRotatingFileHandler
import os
from flask import Flask

def setup_file_handlers(app: Flask, sever_folder: str):
    print("LOGGER: Setting up files!") # Debug code
    logger = app.logger #logging.getLogger(appname)

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

class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload

class ValidationError(AppError):
    """Raised when request validation fails."""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=400, payload=payload)

class NotFoundError(AppError):
    """Raised when a resource is not found."""
    def __init__(self, message, payload=None):
        super().__init__(message, status_code=404, payload=payload)

def setup_error_handling(app: Flask):
    @app.errorhandler(AppError)
    def handle_app_error(error):
        print("App Error:", error)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        print("Unexpected Error:", error)