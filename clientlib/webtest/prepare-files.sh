#!/bin/sh

echo "prepare-files.sh script running"
echo "Warning: we assume that 'npm install' has already been done in the 'clientlib' directory."

cp ../node_modules/snarkjs/build/snarkjs.min.js ./
cp ../../other/circuit16.wasm ./circuit16.wasm
cp ../../other/circuit16.zkey ./circuit16.zkey
../node_modules/.bin/snarkjs zkey export verificationkey ../../other/circuit16.zkey ./verification_key.json
../node_modules/.bin/browserify ../src/main.js --standalone anonvote > ./anonvote-browser.js

echo "Files ready."
echo "You can serve the index.html file from a http server such as:"
echo "> python3 -m http.server 8080"
