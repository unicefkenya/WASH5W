#!/bin/bash

FTP_USER="resources"
FTP_HOME="/home/$FTP_USER"
FTP_DIR="$FTP_HOME"

echo
echo "---------------------------------------------------------------------------------"
echo "Entering - Uninstall vsftpd and Pure-FTPd"
echo "---------------------------------------------------------------------------------"

echo
echo "Stopping the vsftpd service"
sudo service vsftpd stop

echo
echo "Removing the vsftpd package and its configuration files"
sudo apt purge -y vsftpd
sudo apt autoremove

echo
echo "Stopping the Pure-FTPd service"
sudo service pure-ftpd stop

echo
echo "Removing the Pure-FTPd package and its configuration files"
sudo apt purge -y pure-ftpd
sudo apt autoremove -y

echo
echo "Removing the user $FTP_USER and its home directory"
sudo userdel -r $FTP_USER

echo
echo "Removing the FTP directory $FTP_DIR"
sudo rm -rf $FTP_DIR

echo
echo "---------------------------------------------------------------------------------"
echo "Leaving - Uninstall vsftpd and Pure-FTPd"
echo "---------------------------------------------------------------------------------"

