/* Libraries */
import express from 'express';

export default function RobotsStaticFileMiddleware (env: string) {
    return [ '/robots.txt', express.static(`${env === 'development' ? 'dist/' : ''}robots.txt/`) ];
}
