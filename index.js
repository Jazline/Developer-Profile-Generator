var inquirer = require("inquirer");
var fs = require('fs');
const axios = require("axios");
require("dotenv").config();
convertFactory = require('electron-html-to');
var open = require("open");
var path = require("path");

const api = {
    getUser(username) {
        return axios
        .get(
            `https://api.github.com/users/${username}?client_id=${
        process.env.CLIENT_ID
        }&client_secret=${process.env.CLIENT_ID}`
        )
        .catch(err => {
            console.log(`User not found`);
            process.exit(1);
        });
    },
    getTotalStars(username) {
        return axios
        .get(
        `https://api.github.com/users/${username}/repos?client_id=${
            process.env.CLIENT_ID
        }&client_secret=${process.env.CLIENT_SECRET}&per_page=100`
        )
        .then(response => {
            return response.data.reduce((acc,curr) => {
                acc += curr.stargazers_count;
                return acc;
            },0);
        });
    }
};
module.exports = api;

const generateHTML = require("./generateHTML");
const questions = [
    {
        type : "input",
        name :"github",
        message : "What is your GitHub username?"
    },

    {
        type : "list",
        name : "color",
        message : "What is your favorite color?",
        choices : ["red","blue","green","pink"]
    }
  
];

function writeToFile(fileName, data) {
 return fs.writeFileSync(path.join(process.cwd(),fileName),data);
}

function init() {
    inquirer.prompt(questions).then(({github,color}) => {
console.log("Searching...");

 api
    .getUser(github)
    .then(response =>
    api.getTotalStars(github).then(stars => {
        return generateHTML ({
          stars,
          color,
          ...response.data  
        });
    })
)
.then(html => {
    const conversion = convertFactory({
converterPath : convertFactory.converters.PDF
    });
conversion({html},function(err,result) {
    if (err) {
        return console.error(err);
    }

    result.stream.pipe(
    fs.createWriteStream(path.join(__dirname,"resume.pdf"))
    );
    conversion.kill();
});

open(path.join(process.cwd(),"resume.pdf"));
});

});

}


init();
