#!/bin/bash

# Update package list
sudo apt update -y


# Setup Python Environment

sudo apt install python3.10-venv

cd ./backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

cd ..

# Install NGINXif it isn't installed yet
command -v nginx || sudo apt install nginx

# NGINX installs at ~/etc/nginx
# there is a config file in ./nginx/template_nginx.config
# We need to move our config file into the nginx directory
# Before we move it, we need to copy the contents to a new file
# called nginx.conf.

cp ./nginx/template_nginx.conf ./nginx/nginx.conf
sudo mv ./nginx/nginx.conf /etc/nginx/

# We update the root location of the web server
folder_path=$(pwd)
sed -i "s|root place_holder;|root \"$(pwd)/frontend\";|" ./nginx/nginx.conf

sudo systemctl is-active --quiet nginx

if [ $? -eq 0 ]; then
    # If nginx is running
    # Restart nginx
    
    sudo systemctl restart nginx
else
    # If nginx is not running
    # Setup and run nginx
    
    sudo systemctl start nginx
    sudo systemctl enable nginx
    sudo systemctl status nginx
fi