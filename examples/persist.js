var Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

// Build a queue with arbitrary data objects that is attached to the LoaderItem
var queue = [
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
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        var uk = _.filter(loaderItems, function(loaderItem){
            return loaderItem.getData().country === 'United Kingdom';
        });

        var us = _.filter(loaderItems, function(loaderItem){
            return loaderItem.getData().country === 'USA';
        });

        var au = _.filter(loaderItems, function(loaderItem){
            return loaderItem.getData().country === 'Australia';
        });

        console.log(uk);
        console.log(us);
        console.log(au);
    });
