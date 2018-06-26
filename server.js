const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/video/video1.mp4');
})


app.get('/videolist', (req, res) => {
    let videoLlist = { 'videos': ['video1.mp4', 'video2.mp4'] };
    res.status(200).send(videoLlist);
})

app.get('/video/:name', (req, res) => {
    let videoName = req.params.name;
    const path = 'videos/' + videoName;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        // next subsequest request will have range header
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(path, { start, end });
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, headers);
        file.pipe(res);
    } else {
        // first request will be in else
        const headers = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, headers);
        fs.createReadStream(path).pipe(res);
    }
})

app.listen(3000, () => {
    console.log('server started on port 3000');
})
