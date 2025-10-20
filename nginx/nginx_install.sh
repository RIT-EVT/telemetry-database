#!/bin/bash
# Update package lists
echo "Updating package lists..."
sudo apt update -y

# Install NGINX
echo "Installing NGINX..."
sudo apt install nginx -y

# Start NGINX service
echo "Starting NGINX service..."
sudo systemctl start nginx

# Enable NGINX to start on boot
echo "Enabling NGINX to start on boot..."
sudo systemctl enable nginx

# Check NGINX status
echo "Checking NGINX status..."
sudo systemctl status nginx

echo "NGINX installation complete."