var HtmlLoader = require('../lib/HtmlLoader')
    , _ = require('lodash');

module.exports = function(){

    // Each http request is kept in a LoaderItem instance
    var queue = [
        new HtmlLoader.LoaderItem('http://www.google.com'),
        new HtmlLoader.LoaderItem('http://www.youtube.com'),
        new HtmlLoader.LoaderItem('http://www.twitter.com')
    ];

    // Create a HtmlLoader instance
    var loader = new HtmlLoader();

    // Custom callback handler for warnings
    loader.onWarning(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem)
    });

    // Custom callback handler for errors
    loader.onError(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    });

    // Custom callback handler for individual successful loads e.g data base updates or notifications
    loader.onItemLoadComplete(function(loaderItem, proceed){
        console.log('Success', this.getProgress().loaded + '/' + this.getProgress().total + ' '+ loaderItem.getStatus()  + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    });

    // Start the load
    loader.load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        // Print out the results
        _.each(loaderItems, function(loaderItem){

            // Only handle successful loads
            if(loaderItem.getStatus() === HtmlLoader.LoaderItem.COMPLETE){

                console.log('\n-------------------- Link extraction ' + loaderItem.getUrl() + ' --------------------\n');

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
};