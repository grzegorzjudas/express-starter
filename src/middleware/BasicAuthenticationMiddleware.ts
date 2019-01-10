export default function () {
    return [ (req, res, next) => {
        let credentials = req.headers.authorization;

        if (!credentials) return next();

        credentials = credentials.replace(/^[a-zA-Z]+ /, '');
        credentials = Buffer.from(credentials, 'base64').toString().split(':');

        if (credentials.length !== 2) return next();

        req.authentication = {
            username: credentials[0],
            password: credentials[1]
        };

        return next();
    } ];
}
