# Bulk HTML Loader

Scrape HTML from thousands of web pages in a single go.

Features:

  - Queueing
  - Automatic retries
  - Graceful error handling
  - Continous loading on errors (don't stop the queue because some urls fail)
  - Configure maximum number of concurrent HTTP requests, retries and load timeout
  - Random user agent string in each HTTP request (lower risk of the remote server rejecting the request)
  - Event driven so you can handle individual warnings, errors and comleted loads before the queue completes
  
### Installation

```sh
$ npm install bulk-html-loader --save
```
  
# Examples

### Basic

```js

   var Loader = require('bulk-html-loader')
       , _ = require('lodash');
   
   
   // Each http request is encapsulated in a LoaderItem instance which keeps track of load progress, errors etc.
   var queue = [
       new Loader.LoaderItem('http://google.com'),
       new Loader.LoaderItem('https://www.google.com/#q=hello'),
       new Loader.LoaderItem('https://www.google.com/#q=nodejs')
   ];
   
   // Create a BulkHtmlLoader instance and start the queue
   new Loader()
   
       /**
        * Custom warning callback (optional)
        */
       .onWarning(function(loaderItem, proceed){
           console.log(loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
           proceed(loaderItem);
       })
   
       /**
        * Custom error callback (optional)
        */
       .onError(function(loaderItem, proceed){
           console.log(loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
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
                   htmlRes = cheerio.html()
               }
   
               console.log(loaderItem.toString() + ' Html = "' + (truncateString(htmlRes) || null) + '"');
           });
       });
   
   // Helper - not important for this example
   var truncateString = function(s, maxLen){
   
       if(!s){
           return '';
       }
   
       maxLen = maxLen || 100;
   
       if(s.length < maxLen + 1){
           return s;
       }
   
       return s.substr(0, maxLen) + ' ... (truncated)';
   };
```

### Extracting all links from 3 websites

```js

   var Loader = require('bulk-html-loader')
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
       .onWarning(function(loaderItem, proceed){
           console.log(loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
           proceed(loaderItem);
       })
   
       /**
        * Custom error callback (optional)
        */
       .onError(function(loaderItem, proceed){
           console.log(loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
           proceed(loaderItem);
       })
   
       /**
       * Individual url load complete callback (optional)
       * Here you can save the result to a database, process the result etc.
       * Or you can just wait for the entire queue to finish and handle all the items in the final callback
       */
       .onItemLoadComplete(function(loaderItem, proceed){
           proceed(loaderItem);
       })
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
   
```

### Get the raw HTML from a LoaderItem

LoaderItem results are cheerio / jQuery objects. This is how you get the raw HTML string:

```js
    loaderItem.getResult().html()   
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
   
           // Sort the results after country
   
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

For each queue you can define the maximum number of concurrent http requests, timeout and number of retries

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

### Handling rejected http requests
When loading hundreds or even thousands of pages from the same host eventually the requests are bound to be rejected. This happens for a number of reasons, typically because the host has a maximum number of requests per IP address per time unit.
I've tested the tool and have loaded 20,000+ pages from the same host, but only one request at a time. It took 8 hours but completed without any errors or warnings. Just go easy and set the http throttle to 1. E.g myLoader.setHttpThrotte(1)

### VPN
If you need to load large quantities of pages from the same host I recommend doing so behind a VPN and switch IP from time to time.
If one IP has been blacklistet from the host, you just switch country and start again.

### Database integration
If you're serious about loading large quantities of data from other websites you need some kind of persistant storage to keep track of which loads were successful and which were not.
This way, and if anything goes haywire and the loader stops, you can restart the script from where you left off without any gaps in your data.

If you have this need flick me an email and I can give an example written in MongoDB.

### Unit tests
Are located in /test

### Examples
Are location in /examples

### Limitations
When loading HTML pages anything that is not HTML (scripts, css, iframes, noscript etc) is stripped away.
If this bothers you please lodge a ticket on Github and I will look into it.

### Legalities
I'm a software engineer and don't know the legalities around scraping contents from websites. Just be aware that you might be in violation with the website's terms of use. If you republish the contents you are likely to be in violation with copyright laws as well.
So... If you do dodgy things with this software and get nasty letters from lawyers don't come knocking on my door! Use responsibly.


License
----

MIT
