var Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

// Each http request is encapsulated in a LoaderItem instance
var queue = [
    new Loader.LoaderItem('http://google.com'),
    new Loader.LoaderItem('http://stackoverflow.com'),
    new Loader.LoaderItem('http://www.techrepublic.com')
];

// Create a BulkHtmlLoader instance and starts the queue
new Loader()
    .onError(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    })
    .onWarning(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    })
    .onItemLoadComplete(function(loaderItem, proceed){
        // Do some processing here, like Mongo DB saving or any other async task
        proceed(loaderItem);
    })
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        _.each(loaderItems, function(loaderItem){

            var $cheerio = loaderItem.getResult();
            // Print out the anchor text for all links on the loaded page
            if($cheerio){
                $cheerio('a').filter(function() {
                    var text = $cheerio(this).text().trim();

                    if(text.length){
                        console.log(text);
                    }
                });
            }
        });
    });

