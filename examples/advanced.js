var Loader = require('../lib/BulkHtmlLoader')
    , _ = require('lodash');

module.exports = function(){

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
};









//var Loader = require('../lib/BulkHtmlLoader')
//    , _ = require('lodash');
//
//module.exports = function(){
//
//    // Each http request is kept in a LoaderItem instance
//    var queue = [
//        new Loader.LoaderItem('http://www.google.com'),
//        new Loader.LoaderItem('http://www.youtube.com'),
//        new Loader.LoaderItem('http://www.twitter.com')
//    ];
//
//    // Create a HtmlLoader instance
//    var loader = new Loader();
//
//    // Custom callback handler for warnings
//    loader.onWarning(function(loaderItem, proceed){
//        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
//        proceed(loaderItem)
//    });
//
//    // Custom callback handler for errors
//    loader.onError(function(loaderItem, proceed){
//        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
//        proceed(loaderItem);
//    });
//
//    // Custom callback handler for individual successful loads e.g data base updates or notifications
//    loader.onItemLoadComplete(function(loaderItem, proceed){
//        console.log('Success', this.getProgress().loaded + '/' + this.getProgress().total + ' '+ loaderItem.getStatus()  + ' ' + loaderItem.getUrl());
//        proceed(loaderItem);
//    });
//
//    // Start the load
//    loader.load(queue, function(err, loaderItems){
//
//        if(err){
//            throw err;
//        }
//
//        // Print out the results
//        _.each(loaderItems, function(loaderItem){
//
//            // Only handle successful loads
//            if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){
//
//                console.log('\n-------------------- Link extraction ' + loaderItem.getUrl() + ' --------------------\n');
//
//                var $cheerio = loaderItem.getResult();
//
//                // Print out the anchor text for all links on the loaded page
//                $cheerio('a').filter(function() {
//                    var text = $cheerio(this).text().trim();
//
//                    if(text.length){
//                        console.log(text);
//                    }
//                });
//            }
//        });
//    });
//};