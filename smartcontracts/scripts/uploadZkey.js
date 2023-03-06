require("dotenv").config();

const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const ipfsApiSecretKey = process.env.IPFS_API_KEY;
const ipfsProjectId = process.env.IPFS_PROJECT_ID;
const ipfsGateway = "https://ipfs.infura.io:5001";
const publicIpfsGateway = "https://anon-vote.infura-ipfs.io";
const zkeyPath = "../other/circuit16.zkey";

async function uploadFile() {
    const fileStream = fs.createReadStream(zkeyPath);
    const formData = new FormData();
    formData.append('file', fileStream);

    try {
        const response = await axios.post(`${ipfsGateway}/api/v0/add?pin=true&wrap-with-directory=true&only-hash=false`, formData, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                'Authorization': `Basic ${Buffer.from(`${ipfsProjectId}:${ipfsApiSecretKey}`).toString('base64')}`
            }
        });
        if (response.status !== 200) {
            throw new Error("Failed to upload file");
        }
        // Parse the second line of the response as JSON
        const data = JSON.parse(response.data.split('\n')[1]);
        return `${publicIpfsGateway}/ipfs/${data.Hash}/circuit16.zkey`;
    } catch (error) {
        console.error(error);
    }
}

uploadFile().then(url => console.log(url));