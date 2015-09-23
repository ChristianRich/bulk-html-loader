# Bulk HTML Loader

Scrape HTML from thousands of web pages in a single go.

Supports:

  - Queueing
  - Multiple retries
  - Graceful error handling
  - Continous loading on errors (don't stop the queue because some urls fail)
  - Set the maximum number of concurrent HTTP requests (default is 10)
  - Set the maximum number of retries (default is 3)
  - Set the maximum timeout per load (default is 1500 ms)
  - On http timeout errors, increase the timeout and try again
  
# Examples

### Basic

```js

    var Loader = require('bulk-html-loader')
        , _ = require('lodash');
        
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
                    console.log(cheerio.html())
                }
            });
        });
    };
```

### Extracting all links from 3 websites

```js

    var Loader = require('bulk-html-loader')
        , _ = require('lodash');
    
    var queue = [
        new Loader.LoaderItem('http://google.com'),
        new Loader.LoaderItem('http://stackoverflow.com'),
        new Loader.LoaderItem('http://www.techrepublic.com')
    ];
    
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
```

### Attach a custom object to each load

In some cases you want to attach specific information to each load.
In below example we are setting a country variable which will be accessible once the load completes.

```js

   var Loader = require('bulk-html-loader')
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

```

### Granular control

For each queue you can define maximum concurrent http requests, timeout and number of retries

```js
    var Loader = require('bulk-html-loader')
        , _ = require('lodash');
    
    var queue = [
        new Loader.LoaderItem('http://google.com'),
        new Loader.LoaderItem('https://www.google.com/#q=hello'),
        new Loader.LoaderItem('https://www.google.com/#q=nodejs')
    ];
    
    new Loader()
        .setHttpThrottle(10) // Process 10 urls at a time
        .setHttpTimeout(2000) // Retry loads that do not complete after 2 seconds
        .setNumRetries(5) // Should any errors occur, retry 5 times. After this the load is flagged as error and will not have a result
        .load(queue, function(err, loaderItems){
            //   
        });

```

### Installation

```sh
$ npm install bulk-html-loader --save
```

License
----

MIT
