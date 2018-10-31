const express = require('express');
const router = express.Router();

const Nightmare = require('nightmare');

// wait for page to fully render
const DELAY = 6000;

router.get('/', (req, res) => {
    res.render('index',  { pipelineGraph: '<h1>Pipeline API: Go to /pipeline?host=${host}&project=${project}&branch=${branch}&id=${id} to get pipeline data.</h1>' });
});

router.get('/pipeline', (req, res) => {
    const { host, project, branch, id } = req.query;

    const url = `${host}/service/jenkins/blue/organizations/jenkins/${project}/detail/${branch}/${id}/pipeline`;

    // download the current css libraries
    var jenkins_css = ["service/jenkins/adjuncts/5a4bffce/io/jenkins/blueocean/blueocean-core-js.css", "service/jenkins/adjuncts/5a4bffce/io/jenkins/blueocean/blueocean.css", "service/jenkins/adjuncts/5a4bffce/io/jenkins/blueocean/jenkins-design-language.css"];
    var wget = require('node-wget');

    function downloadCSS(css) {
        wget({
                url:  `${host}/${css}`,
                dest: './public/stylesheets/',      // destination path or path with filenname, default is ./
                timeout: 2000       // duration to wait for request fulfillment in milliseconds, default is 2 seconds
            },
            function (error, response, body) {
                if (error) {
                    console.log('--- error:');
                    console.log(error);            // error encountered
                } else {
                    console.log('--- headers:');
                    console.log(response.headers); // response headers
                    console.log('--- body:');
                    console.log(body);             // content of package
                }
            }
        );
    }

    jenkins_css.forEach(downloadCSS);

    const nightmare = Nightmare({
        switches: {
            'ignore-certificate-errors': true
        }
    });
    nightmare
        .goto(url)
        .wait(DELAY)
        .evaluate(() => {
            const elements = Array.from(document.getElementsByClassName('PipelineGraph-container'));
            return elements.map(function(element) {
                return {
                    html: element.innerHTML
                }
            });
        })
        .end()
        .then(content => {
            if(content.length > 0) {
                res.send({
                    html: content[0].html
                });
            } else {
                res.send({
                    error: {
                        message: "pipeline not found"
                    }
                });
            }
        });
});

router.get('/pipeline-demo', (req, res) => {
    const { host, project, branch, id } = req.query;

    const url = `${host}/service/jenkins/blue/organizations/jenkins/${project}/detail/${branch}/${id}/pipeline`;

    const nightmare = Nightmare({
        switches: {
            'ignore-certificate-errors': true
        }
    });
    nightmare
        .goto(url)
        .wait(DELAY)
        .evaluate(() => {
            const elements = Array.from(document.getElementsByClassName('PipelineGraph-container'));
            return elements.map(function(element) {
                return {
                    html: element.innerHTML
                }
            });
        })
        .end()
        .then(content => {
            if(content.length > 0) {
                res.render('index', { pipelineGraph: content[0].html });
            } else {
                res.render('index',  { pipelineGraph: '<h1>No Pipeline Found</h1>' });
            }
        });
});

module.exports = router;
