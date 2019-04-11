## Tracking Status Tool

This tool is mainly a proof-of-concept currently. It hits a preset URL with puppeteer, listens for network requests, then checks them for hints of various tracking platforms that may be in use. It logs an object with the results of this process upon completion.

#### Setup

This tool requires Node and a package manager (NPM/Yarn).

After cloning, simply run the following from the project directory:  
`yarn` or `npm install`  

Then, run the `index.js` file using Node:  
`node .` or `node index`  