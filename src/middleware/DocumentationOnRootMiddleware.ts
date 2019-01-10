/* Libraries */
import express from 'express';
import fs from 'fs';

export default function () {
    return [ (req, res, next) => {
        res.set('Content-Type', 'text/html');

        express.static(`${fs.existsSync('build') ? 'build/' : ''}doc`, {
            index: 'index.html'
        })(req, res, next);
    } ];
}
