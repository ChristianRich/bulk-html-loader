const Loader = require('../lib/BulkHtmlLoader');

// Create the queue
const queue = [
    'http://google.com',
    'https://www.bing.com',
    'https://www.yahoo.com'
];

// Create a new BulkHtmlLoader instance
const loader = new Loader();

    loader

    /**
     * Custom warning callback (optional)
     */
    .onWarning(function(loaderItem, next){
        console.log('WARN ' + this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom error callback (optional)
     */
    .onError(function(loaderItem, next){
        console.log('ERROR ' + this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom callback for any status change (optional)
     */
    .onChange(function(loaderItem){
        console.log('CHANGE ' + this.toString() + ' ' + loaderItem.toString()); // [Object BulkHtmlLoader] progress: 1/500, success: 1, warnings: 0, errors: 0, current open connections: 24, max concurrent connections: 25
    })

    /**
     * Start the queue and wait for final callback
     */
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        loaderItems.forEach(function(loaderItem){
            if(loaderItem.getStatus() === 'complete'){
                const cheerio = loaderItem.getResult();
                console.log(loaderItem.toString() + ' Html = ' + truncateString(cheerio.html()));
            }
        });
    });

/**
 * Helper
 * @param s
 * @param maxLen
 * @returns {*}
 */
const truncateString = function(s, maxLen){
    if(!s) return '';
    maxLen = maxLen || 100;
    if(s.length < maxLen + 1) return s;
    return s.substr(0, maxLen) + ' ... (truncated)';
};