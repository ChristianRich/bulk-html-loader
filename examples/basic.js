var Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

module.exports = function(){

    // Each http request is encapsulated in a LoaderItem instance
    var queue = [
        new Loader.LoaderItem('http://google.com'),
        new Loader.LoaderItem('https://www.google.com/#q=hello'),
        new Loader.LoaderItem('https://www.google.com/#q=nodejs')
    ];

    // Create a BulkHtmlLoader instance and start the queue
    new Loader()
        .onError(function(loaderItem, proceed){
            console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
            proceed(loaderItem);
        })
        .onWarning(function(loaderItem, proceed){
            console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
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

                console.log(loaderItem.getStatus() + ' Html portion of \'' + loaderItem.getUrl() + '\' = "' + (truncateString(htmlRes) || null) + '"');
            });
        });
};

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