const Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

const queue = [
    'http://google.com',
    'http://stackoverflow.com',
    'http://some-invalid-url-that-should-not-stop-the-processing.com', // If an url cannot load after x attempts it is skipped
    'http://www.techrepublic.com'
];

/**
 * In this example we are loading web pages in a serial pattern, applying processing and saving to database then proceeding to the next load
 * @type {BulkHtmlLoader}
 */
const loader = new Loader(false); // Pass true for verbose logging

    loader.setMaxConcurrentConnections(1);

    /**
     * Individual url load complete callback (optional)
     * Here you can save the result to a database, process the result etc.
     * Or you can just wait the the entire queue to finish and handle all the items in the final callback
     */
    loader.onItemLoadComplete(function(loaderItem, next){
        processResult(
            loaderItem,
            next
        );
    })

    /**
     * Log the overall progress and events to console
     */
    .onChange(function(loaderItem){
        console.log(this.toString() + ' ' + loaderItem.toString()); // [Object BulkHtmlLoader] progress: 1/500, success: 1, warnings: 0, errors: 0, current open connections: 24, max concurrent connections: 25
    })

    /**
     * Final callback once the queue completes
     */
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        console.log('*** PROCESSING COMPLETE ***');
    });

/**
 * Emulating processing the HTML result (e.g extracting text and links from a website)
 * @param {LoaderItem} loaderItem
 * @param {function} next
 */
const processResult = function(loaderItem, next){

    const url = loaderItem.getUrl(),
        html = loaderItem.getResult().html();

    console.log('Processing result from: ' + loaderItem.getUrl());

    // Emulating an async event
    setTimeout(function(){
        saveToDB(loaderItem, html, next);
    }, 1000);
};

/**
 * Emulating saving a processed result to a database
 * @param {LoaderItem} loaderItem
 * @param {*} result - the data you are saving to DB
 * @param {function} next
 */
const saveToDB = function(loaderItem, result, next){

    console.log('Saving result to database from: ' + loaderItem.getUrl());

    // Emulating an async event (think database call)
    setTimeout(function(){
        next(loaderItem);
    }, 1000);
};
