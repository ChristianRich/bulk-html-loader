# Bulk HTML Loader

Scrape the HTML from thousands of web pages in a single go. The loader supports multiple attempts and queueing and will not stop because some items fail to load.

Supports:

  - Multiple retries
  - Continuous loading should some loads time out or otherwise fail
  - Set the maximum number of concurrent HTTP requests (default is 10)
  - Set the maximum number of retries (default is 3)
  - Set the maximum timeout per load (default is 1500 ms)
  
# Example

```js
var HtmlLoader = require('HtmlLoader')
    , _ = require('lodash');

var queue = [
    new HtmlLoader.LoaderItem('http://google.com'),
    new HtmlLoader.LoaderItem('https://www.twitter.com'),
    new HtmlLoader.LoaderItem('https://www.github.com')
];

var loader = new HtmlLoader();
loader.load(queue, function(err, loaderItems){

    if(err){
        throw err;
    }
    
    _.each(loaderItems, function(loaderItem){
        if(loaderItem.getResult()){
            var html = loaderItem.getResult().html();
            console.log(html);
        }
    });
});
```

### Version
1.0.0

### Installation

```sh
$ npm install bulk-html-loader --save
```

License
----

MIT
