#!/bin/bash

echo
echo "---------------------------------------------------------------------------------"
echo "Entering - Install Pure-FTPd"
echo "---------------------------------------------------------------------------------"

# Initialise variables
echo
echo "Initialising variables"
FTP_PASV_MIN_PORT=40000
FTP_PASV_MAX_PORT=40100


# Enable safer and more predictable behavior
echo
echo "Enabling safer and more predictable behavior"
set -euo pipefail

# Update the local package index
echo
echo "Updating the local package index"
sudo apt update

# Install Pure-FTPd
echo
echo "Installing Pure-FTPd"
sudo apt install -y pure-ftpd

# Backup default Pure-FTPd configuration
echo
echo "Backing up default Pure-FTPd configuration"
sudo cp /etc/pure-ftpd/pure-ftpd.conf /etc/pure-ftpd/pure-ftpd.conf.bak

# Configure Pure-FTPd
echo
echo "Configuring Pure-FTPd"
sudo sed -i 's|# PassivePortRange.*|PassivePortRange '$FTP_PASV_MIN_PORT' '$FTP_PASV_MAX_PORT'|g' /etc/pure-ftpd/pure-ftpd.conf
sudo sed -i 's|PureDB.*|PureDB /etc/pure-ftpd/pureftpd.pdb|g' /etc/pure-ftpd/pure-ftpd.conf
sudo sed -i 's|# CallUploadScript.*|CallUploadScript yes|g' /etc/pure-ftpd/pure-ftpd.conf
sudo sed -i 's|# FSCharset.*|FSCharset UTF-8|g' /etc/pure-ftpd/pure-ftpd.conf
sudo sed -i 's|# PAMAuthentication.*|PAMAuthentication yes|g' /etc/pure-ftpd/pure-ftpd.conf
sudo sed -i 's|# UnixAuthentication.*|UnixAuthentication yes|g' /etc/pure-ftpd/pure-ftpd.conf

# Allow connections in active mode through the firewall
echo
echo "Allowing connections in active mode  through the firewall"
sudo ufw allow ftp

# Allow connections in passive mode through the firewall
echo
echo "Allowing connections in passive mode through the firewall"
sudo ufw allow $FTP_PASV_MIN_PORT:$FTP_PASV_MAX_PORT/tcp

# Restart Pure-FTPd service
echo
echo "Restarting Pure-FTPd service"
sudo systemctl restart pure-ftpd

# Create FTP user
echo
echo "Creating FTP user"
FTP_USER="resources"
FTP_PASSWORD=$(openssl rand -base64 12)
sudo useradd -m -d /home/${FTP_USER} -s /bin/bash ${FTP_USER}
echo "${FTP_USER}:${FTP_PASSWORD}" | sudo chpasswd
sudo chown -R ${FTP_USER}:${FTP_USER} /home/${FTP_USER}

# Print out FTP configurations
echo
echo "Printing out FTP configurations"
echo "FTP user: ${FTP_USER}"
echo "FTP password: ${FTP_PASSWORD}"
echo "Passive mode port range: $FTP_PASV_MIN_PORT-$FTP_PASV_MAX_PORT"


echo "---------------------------------------------------------------------------------"
echo "Leaving - Install Pure-FTPd"
echo "---------------------------------------------------------------------------------"

