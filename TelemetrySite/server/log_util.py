import logging
from logging.handlers import TimedRotatingFileHandler
import os
from flask import Flask

def setup_file_logging(app: Flask, sever_folder: str):
    log_dir = os.path.join(sever_folder, 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - '
        '%(filename)s:%(lineno)d - %(message)s'
    )

    # Makes a new log file every day, keeping 30 days worth of logs.
    time_handler = TimedRotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        when='midnight',
        interval=1,
        backupCount=30
    )
    time_handler.setFormatter(formatter)
    time_handler.setLevel(logging.INFO)

    # Setup the app logger stuff
    app.logger.addHandler(time_handler)
    app.logger.setLevel(logging.INFO)
