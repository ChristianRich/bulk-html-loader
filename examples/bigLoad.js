var Loader = require('../lib/BulkHtmlLoader');

// Each http request is encapsulated in a LoaderItem instance which keeps track of load progress, errors etc.
var queue = [
    new Loader.LoaderItem('http://google.com'),
    new Loader.LoaderItem('https://www.bing.com'),
    new Loader.LoaderItem('https://www.yahoo.com')
];

// Create a BulkHtmlLoader instance and start the queue
new Loader()

    /**
     * Custom warning callback (optional)
     */
    .onWarning(function(loaderItem, next){
        console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom error callback (optional)
     */
    .onError(function(loaderItem, next){
        console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Final callback once the queue completes
     */
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        loaderItems.forEach(function(loaderItem){
            if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){
                var cheerio = loaderItem.getResult();
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
var truncateString = function(s, maxLen){
    if(!s) return '';
    maxLen = maxLen || 100;
    if(s.length < maxLen + 1) return s;
    return s.substr(0, maxLen) + ' ... (truncated)';
};