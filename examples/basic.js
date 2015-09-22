var HtmlLoader = require('../lib/HtmlLoader')
    , _ = require('lodash');

module.exports = function(){

    // Each http request is kept in a LoaderItem instance
    var queue = [
        new HtmlLoader.LoaderItem('http://google.com'),
        new HtmlLoader.LoaderItem('https://www.google.com.au/#q=hello'),
        new HtmlLoader.LoaderItem('https://www.google.com.au/#q=nodejs')
    ];

    // Create a HtmlLoader instance
    var loader = new HtmlLoader();

    // Start the load
    loader.load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        // Print out the results
        _.each(loaderItems, function(loaderItem){

            if(loaderItem.getResult()){
                var cheerio = loaderItem.getResult();

                console.log(' \n-------------------- Html portion of ' + loaderItem.getUrl() + ' --------------------\n');
                console.log(cheerio.html());
            }
        });
    });
};