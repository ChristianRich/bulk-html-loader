const Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

// Build a queue with arbitrary data objects that is attached to the LoaderItem
// Instead of injecting String urls into the queue, you have to wrap the urls in LoaderItem instances
const queue = [
    new Loader.LoaderItem('http://smh.com.au', {
        country: 'Australia'
    }),

    new Loader.LoaderItem('http://google.com', {
        country: 'USA'
    }),

    new Loader.LoaderItem('http://techrepublic.com', {
        country: 'USA'
    }),

    new Loader.LoaderItem('http://cbs.com', {
        country: 'USA'
    }),

    new Loader.LoaderItem('http://thesun.co.uk', {
        country: 'United Kingdom'
    })
];

// Create a BulkHtmlLoader instance and start the queue
new Loader()

    /**
     * Optional callback for any status change
     */
    .onChange(function(loaderItem){
        console.log(this.toString() + ' ' + loaderItem.toString()); // [BulkHtmlLoader] progress: {Number}/{Number}, success: {Number}, warnings: {Number}, errors: {Number}, open conn: {Number}, max conn: {Number} [LoaderItem] complete {url}
    })

    /**
     * Start the queue and wait for final callback
     */
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        // Sort the results after country

        const uk = _.filter(loaderItems, function(loaderItem){
            return loaderItem.getData().country === 'United Kingdom';
        });

        const us = _.filter(loaderItems, function(loaderItem){
            return loaderItem.getData().country === 'USA';
        });

        const au = _.filter(loaderItems, function(loaderItem){
            return loaderItem.getData().country === 'Australia';
        });
    });
