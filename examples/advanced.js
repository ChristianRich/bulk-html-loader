var Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

// Each http request is encapsulated in a LoaderItem instance
var queue = [
    new Loader.LoaderItem('http://google.com'),
    new Loader.LoaderItem('http://stackoverflow.com'),
    new Loader.LoaderItem('http://www.techrepublic.com')
];

// Create a BulkHtmlLoader instance and start the queue
new Loader()

    /**
     * Custom warning callback (optional)
     */
    .onWarning(function(loaderItem, next){
        console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Custom error callback (optional)
     */
    .onError(function(loaderItem, next){
        console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Individual url load complete callback (optional)
     * Here you can save the result to a database, process the result etc.
     * Or you can just wait the the entire queue to finish and handle all the items in the final callback
     */
    .onItemLoadComplete(function(loaderItem, next){
        console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
        next(loaderItem);
    })

    /**
     * Final callback once the queue completes
     */
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        _.each(loaderItems, function(loaderItem){

            // Only process successful LoaderItems
            if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){

                // Results are essentially jQuery objects
                var $cheerio = loaderItem.getResult();

                // Print out the anchor text for all links on the loaded page
                $cheerio('a').filter(function() {
                    var text = $cheerio(this).text().trim();

                    if(text.length){
                        console.log(text);
                    }
                });
            }
        });
    });

