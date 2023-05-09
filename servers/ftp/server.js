// See: https://levelup.gitconnected.com/how-to-upload-and-download-a-file-with-ftp-ftps-sftp-in-node-js-b50e196841f1

const express = require('express');
const ftp = require("ftp");
const fs = require('fs')
const multer = require('multer');
const upload = multer();

const app = express();
const serverPort = 3003;
const host = '102.220.22.193';
const username = 'resources';
const password = '09PlzXchWklbELZ3';


// CORS middleware
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Upload a file to the FTP server
async function uploadFileToFTP(localFile, remoteFile) {

  const client = new ftp();
  
  try {
    await new Promise((resolve, reject) => {
      client.on("ready", () => {
        client.put(localFile, remoteFile, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
          client.end();
        });
      });

      client.on("error", (err) => {
        reject(err);
      });

      client.connect({
        host: host,
        user: username,
        password: password
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

app.post('/upload', upload.single('file'), (req, res) => {

  const remoteFile = req.body.remoteFile;
  const localFile = req.file.buffer;
  
  if (!localFile) {
    console.log('Error: localFile not found or is empty');
    res.status(400).send('Error: localFile not found or is empty');
    return;
  }

  uploadFileToFTP(localFile, remoteFile)
    .then(() => {
      console.log('File uploaded successfully');
      res.status(200).send('File uploaded successfully');
    })
    .catch((err) => {
      console.log('Error uploading file to FTP server:', err);
      res.status(500).send('Error uploading file to FTP server');
    });
});


// Download a file from the FTP server
async function downloadFileFromFTP(remoteFile, localFile) {

  const client = new ftp();
  
  try {
    await new Promise((resolve, reject) => {
      client.on("ready", () => {
        client.get(remoteFile, (err, stream) => {
          if (err) {
            reject(err);
          } else {
            stream.once('close', () => {
              console.log('File downloaded successfully');
              client.end();
              resolve();
            });
            stream.pipe(fs.createWriteStream(localFile));
          }
        });
      });

      client.on("error", (err) => {
        reject(err);
      });

      client.connect({
        host: host,
        user: username,
        password: password
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}


app.get('/download', (req, res) => {

  const localFile = req.query.localFile;
  const remoteFile = req.query.remoteFile;

  downloadFileFromFTP(remoteFile, localFile).then(() => {
    res.download(localFile, function (err) {
      if (err) {
        console.log('Error sending file:', err);
        res.status(500).send('Error sending file');
      } else {
        console.log('File downloaded successfully');
      }
    });
  }).catch((err) => {
    console.log('Error downloading file from FTP server:', err);
    res.status(500).send('Error downloading file from FTP server');
  });

});



// Delete a file from the FTP server

async function deleteFileFromFTP(remoteFilePath) {

  const client = new ftp();
  
  try {
    await new Promise((resolve, reject) => {
      client.on('ready', () => {
        client.delete(remoteFilePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
          client.end();
        });
      });

      client.on('error', (err) => {
        reject(err);
      });

      client.connect({
        host: host,
        user: username,
        password: password
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}


app.delete('/delete', (req, res) => {
  const remoteFile = req.query.remoteFile;

  deleteFileFromFTP(remoteFile)
    .then(() => {
      console.log('File deleted successfully');
      res.status(200).send('File deleted successfully');
    })
    .catch((err) => {
      console.error('Error deleting file from FTP server:', err);
      res.status(500).send('Error deleting file from FTP server');
    });
});

// Enable CORS
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});

