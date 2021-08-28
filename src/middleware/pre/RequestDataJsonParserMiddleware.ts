import express from 'express';

export default function RequestDataJsonParserMiddleware () {
    return [ express.json({ strict: true }) ];
}
