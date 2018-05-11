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
