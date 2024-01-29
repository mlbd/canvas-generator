module.exports = async (req, res) => {
    res.status(200).json({ 
        message: "404 Error: Whoops! Looks like this route took a wrong turn and ended up in the land of forgotten endpoints. We tried sending a search party, but they got lost too. Maybe it's time to use a GPS for your API calls? 🗺️ #LostInCyberspace",
        body: 'req.body',
        method: req.method,
        url: req.url,
        query: req.query
    });
};