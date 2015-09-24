var Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');


// Each http request is encapsulated in a LoaderItem instance which keeps track of load progress, errors etc.
var queue = [
    new Loader.LoaderItem('http://google.com'),
    new Loader.LoaderItem('https://www.google.com/#q=hello'),
    new Loader.LoaderItem('https://www.google.com/#q=nodejs')
];

// Create a BulkHtmlLoader instance and start the queue
new Loader()

    /**
     * Custom warning callback (optional)
     */
    .onWarning(function(loaderItem, proceed){
        console.log(loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
        proceed(loaderItem);
    })

    /**
     * Custom error callback (optional)
     */
    .onError(function(loaderItem, proceed){
        console.log(loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        proceed(loaderItem);
    })
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        _.each(loaderItems, function(loaderItem){

            var htmlRes;

            if(loaderItem.getResult()) {
                var cheerio = loaderItem.getResult();
                htmlRes = cheerio.html()
            }

            console.log(loaderItem.toString() + ' Html = "' + (truncateString(htmlRes) || null) + '"');
        });
    });

// Helper
var truncateString = function(s, maxLen){

    if(!s){
        return '';
    }

    maxLen = maxLen || 100;

    if(s.length < maxLen + 1){
        return s;
    }

    return s.substr(0, maxLen) + ' ... (truncated)';
};