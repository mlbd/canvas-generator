module.exports = async (req, res) => {
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.send(`
        404 Error: Whoops! Looks like this route took a wrong turn and ended up in the land of forgotten endpoints. We tried sending a search party, but they got lost too. Maybe it's time to use a GPS for your API calls? 🗺️ #LostInCyberspace
    `);
};