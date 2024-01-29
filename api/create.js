const { createCanvas, loadImage } = require("@napi-rs/canvas");

/**
 * Extracts the file extension from a given URL.
 *
 * @param {string} url - the URL from which to extract the file extension
 * @return {string|null} the file extension in lowercase, or null if no extension is found
 */
function getFileExtensionFromUrl(url) {
    // Use a regular expression to extract the file extension
    const regex = /(?:\.([^.]+))?$/; // Match the last dot and anything after it
    const extension = regex.exec(url)[1]; // Extract the extension (group 1 in the regex)

    // Ensure the extension is in lowercase (optional)
    if (extension) {
        return extension.toLowerCase();
    } else {
        return null; // Return null if no extension is found
    }
}

/**
 * Calculates the new height based on the aspect ratio of the original width and height.
 *
 * @param {number} originalWidth - The original width
 * @param {number} originalHeight - The original height
 * @param {number} newWidth - The new width
 * @return {number} The calculated new height
 */
function aspect_height(originalWidth, originalHeight, newWidth) {
    // Calculate the aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Calculate the new height based on the aspect ratio
    const newHeight = newWidth / aspectRatio;

    return newHeight;
}

/**
 * A function to calculate the new y coordinate based on the given height and y coordinate.
 *
 * @param {number} newHeight - the new height value
 * @param {number} height - the current height value
 * @param {number} y - the current y coordinate value
 * @return {number} the new y coordinate value
 */
function aspectY(newHeight, height, y) {
    const newY = height > newHeight ? y + (height - newHeight) : y - ((newHeight - height)/2);
    return newY;
}

module.exports = async (req, res) => {
    console.log(req.query);

    if (req.method === 'POST' && req.url === '/api/create') {

        try {
            const { thumbnail_url, position_data, post_id, logo } = req.body;

            const file_ext = getFileExtensionFromUrl(thumbnail_url);
            let filename = post_id + '.' + file_ext;

            const thumbnailImage = await loadImage(thumbnail_url);
            const logoImage = await loadImage(logo);

            const canvas = createCanvas(thumbnailImage.width, thumbnailImage.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(thumbnailImage, 0, 0);

            // Draw logo at specified positions
            // logo_positions.forEach(position => {
            //     ctx.save();
            //     ctx.translate(position.x, position.y);
            //     ctx.rotate(position.angle);
            //     ctx.drawImage(
            //         logoImage,
            //         -position.width / 2,
            //         -position.height / 2,
            //         position.width,
            //         position.height
            //     );
            //     ctx.restore();
            // });

            if (position_data) {
                let { x, y, width, height, angle } = position_data;
    
                 ctx.save();
                 ctx.translate(x + width / 2, y + height / 2);
                 ctx.rotate(angle);
                 ctx.drawImage(logoImage, -width / 2, -height / 2, width, height);
                 ctx.restore();
            }

            const dataUrl = canvas.toDataURL('image/png');

            res.status(200).json({ 
                thumbnail_url: thumbnail_url,
                logo: logo,
                post_id: post_id,
                position_data: position_data,
                method: req.method,
                url: req.url,
                filename: filename,
                imageWidth: thumbnailImage.width,
                dataUrl: dataUrl
            });
   
        } catch (error) {
            console.error('Error:', error);
    
            res.setHeader('Content-Type', 'application/json');
            res.status(500).json({ error: 'Internal Server Error' });
        }        
    } else {
        res.status(200).json({ 
            message: 'Hello, World! This is a POST request.',
            body: 'req.body',
            method: req.method,
            url: req.url,
            query: req.query
        });
    }
};