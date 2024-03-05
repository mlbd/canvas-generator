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

function generateUniqueKey() {
    // Get current timestamp in milliseconds
    const timestamp = new Date().getTime();

    // Generate a random string
    const randomString = Math.random().toString(36).substring(2, 8);

    // Combine timestamp and random string
    const uniqueKey = timestamp.toString() + randomString;

    // Take the first 20 characters
    const truncatedKey = uniqueKey.substring(0, 20);

    return truncatedKey;
}

function aspect_height(originalWidth, originalHeight, newWidth) {
    // Calculate the aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Calculate the new height based on the aspect ratio
    const newHeight = newWidth / aspectRatio;

    return newHeight;
}

function aspectY(newHeight, height, y) {
    const newY = height > newHeight ? y + (height - newHeight) : y - ((newHeight - height)/2);
    return newY;
}

function get_orientation(attachment_metadata) {
    // Get attachment metadata
    if (attachment_metadata) {

        // Calculate the threshold for height to be less than 60% of width
        const heightThreshold = 0.6 * attachment_metadata.width;

        // Check if width and height are equal (square)
        if (attachment_metadata.width === attachment_metadata.height) {
            return 'square';
        } else if (attachment_metadata.height < heightThreshold) {
            return 'horizontal';
        } else {
            return 'square';
        }
    }
    return 'square';
}
  

module.exports = async (req, res) => {
    console.log(req.query);

    if (req.method === 'POST' && req.url === '/api/create') {

        try {
            const { thumbnail_url, position_data, type, post_id, logo } = req.body;

            // Check if thumbnail_url or logo is empty
            if (!thumbnail_url) {
                return res.status(400).json({ error: 'thumbnail_url is required' });
            }

            if (!logo) {
                return res.status(400).json({ error: 'logo is required' });
            }

            const file_ext = getFileExtensionFromUrl(thumbnail_url);
            let filename = generateUniqueKey() + '.' + file_ext;

            const thumbnailImage = await loadImage(thumbnail_url);
            const logoImage = await loadImage(logo);

            let get_type = get_orientation(logoImage);
            
            // check if type is not empty then overwrite get_type with type
            if( type ) get_type = type;

            const getPositionData = position_data[get_type][0];

            if (!getPositionData) {
                return res.status(400).json({ error: 'getPositionData with type ' + get_type + ' is empty' });
            }

            console.log(getPositionData);

            const canvas = createCanvas(thumbnailImage.width, thumbnailImage.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(thumbnailImage, 0, 0);

            if (getPositionData) {
                let { x, y, width, height, angle } = getPositionData;

                // Use the original width and height of the logo
                const originalWidth = logoImage.width;
                const originalHeight = logoImage.height;

                const newHeight = aspect_height(originalWidth, originalHeight, width);
                const newY =  aspectY(newHeight, height, y);

                // Draw the background square
                // ctx.fillStyle = 'lightblue';
                // ctx.fillRect(x, y, width, height);

                // Draw the logo with a border
                const borderWidth = 5; // Set the border width as needed
                ctx.save();
                ctx.translate(x + width / 2, y + height / 2);
                ctx.rotate(angle);
                ctx.drawImage(logoImage, -width / 2, -newHeight / 2, width, newHeight);
                ctx.restore();
            }

            const dataUrl = canvas.toDataURL('image/png');

            res.status(200).json({ 
                thumbnail_url: thumbnail_url,
                logo: logo,
                post_id: post_id,
                position_data: getPositionData,
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