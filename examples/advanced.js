const Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

const queue = [
    'http://google.com',
    'http://stackoverflow.com',
    'http://www.techrepublic.com'
];

// Create a BulkHtmlLoader instance and start the queue
const loader = new Loader(true) // Pass true for verbose logging

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
        //console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}

        console.log('item complete ' + loader.toString())
        next(loaderItem);
    })

    /**
     * Final callback once the queue completes
     */
    .load(queue, function(err, loaderItems){

        console.log('******* Final callback')
        return console.log(loader.toString());

        if(err){
            throw err;
        }

        _.each(loaderItems, function(loaderItem){

            // Only process successful LoaderItems
            if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){

                // Results are essentially jQuery objects
                let $cheerio = loaderItem.getResult();

                // Print out the anchor text for all links on the loaded page
                $cheerio('a').filter(function() {
                    let text = $cheerio(this).text().trim();

                    if(text.length){
                        console.log(text);
                    }
                });
            }
        });
    });

