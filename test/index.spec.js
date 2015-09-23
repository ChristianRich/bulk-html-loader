var assert = require('assert')
	, should = require('should')
	, ping = require('ping')
	, Loader = require('../')
	, _ = require('lodash')
    , timeOutPerAsyncTest = 20000;

describe('HtmlLoader', function() {

    // Check for internet connectivity before running tests
	beforeEach(function(done){

		var hosts = ['google.com'];
		
		hosts.forEach(function(host){
			
			ping.sys.probe(host, function(isAlive){
				
				if(isAlive){
                    return done();
				}
				
				throw new Error('Host ' + hosts + ' not responding. Check internet connectivity.');
			});
		});
	});

    it('should instantiate a new BulkHtmlLader instance', function (done) {

        var loader = new Loader();

        should.exists(loader);
        assert(loader instanceof Loader, 'check instance');
        assert(_.isFunction(loader.toString), 'toString should be a function');
        loader.toString().should.be.a.String();
        done();
    });

    it('should instantiate a new LoaderItem instance', function (done) {
        var loaderItem = new Loader.LoaderItem('http://google.com');
        should.exists(loaderItem);
        assert(loaderItem instanceof Loader.LoaderItem);
        done();
    });

    it('should create a loaderItem using static method BulkHtmlLoader.getLoaderItem()', function (done) {
        var loaderItem = Loader.getLoaderItem('http://google.com');
        assert(loaderItem instanceof Loader.LoaderItem);
        done();
    });

    it('should load 3 urls successfully', function (done) {

        this.timeout(timeOutPerAsyncTest);

        var queue = [
            new Loader.LoaderItem('http://google.com'),
            new Loader.LoaderItem('http://www.google.com/#q=hello'),
            new Loader.LoaderItem('http://www.google.com/#q=nodejs')
        ];

        var loader = new Loader();
        loader.setHttpTimeout(5000);

        loader.load(queue, function(err, results){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(results), 'results should exist');
            assert(_.isArray(results), 'results should be an Array');
            assert(results.length === 3, 'expect 3 results');

            _.each(results, function(result){
                assert(result instanceof Loader.LoaderItem, 'instance of LoaderItem');
                assert(result.getResult(), 'Result should exist');
                assert(result.getStatus() === Loader.LoaderItem.COMPLETE, 'Loader status should be complete');
                assert(_.isFunction(result.getResult().html), 'Result should be an instance of cheerio and have a function named html');
            });

            done();
        });
    });

    it('should fail one load and succeed two', function (done) {

        this.timeout(timeOutPerAsyncTest);

        var queue = [
            new Loader.LoaderItem('http://google.com'),
            new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
            new Loader.LoaderItem('http://www.google.com/#q=nodejs')
        ];

        var loader = new Loader();
        loader.setHttpTimeout(5000);

        loader.load(queue, function(err, loaderItems){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(loaderItems) , 'results should exist');
            assert(_.isArray(loaderItems), 'results should be an Array');
            assert(loaderItems.length === 3, 'expect 3 results');

            var successCount = 0;

            _.each(loaderItems, function(loaderItem){
                assert(loaderItem instanceof Loader.LoaderItem, 'instance of LoaderItem');

                if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){
                    successCount++;
                }
            });

            assert(successCount === 2, 'One load should fail');
            done();
        });
    });

    it('should invoke onItemLoadComplete callback three times', function (done) {

        this.timeout(timeOutPerAsyncTest);

        var count = 0,
            queue = [
                new Loader.LoaderItem('http://google.com'),
                new Loader.LoaderItem('http://www.google.com/#q=hello'),
                new Loader.LoaderItem('http://www.google.com/#q=nodejs')
            ];

        var loader = new Loader();
        loader.setHttpTimeout(5000);
        loader.onItemLoadComplete(function(loaderItem, done){
            count++;
            done(loaderItem);
        });

        loader.load(queue, function(err, results){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(results), 'results should exist');
            assert(_.isArray(results), 'results should be an Array');
            assert(results.length === 3, 'expect 3 results');
            assert(count === 3, 'onLoadComplete callback fire 3 times');

            done();
        });
    });

    it('should count 3 warnings', function (done) {

        this.timeout(timeOutPerAsyncTest);

        var warningCount = 0,
            queue = [
                new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
                new Loader.LoaderItem('http://www.google.com/#q=hello')
            ];

        var loader = new Loader();

        loader.setHttpTimeout(5000);

        loader.onWarning(function(loaderItem, done){
            warningCount++;
            //console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
            done(loaderItem);
        });

        loader.load(queue, function(err, results){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(results), 'results should exist');
            assert(_.isArray(results), 'results should be an Array');
            assert(results.length === 2, 'expect 2 results');
            assert(warningCount === 3, 'warningCount should be 3');
            done();
        });
    });

    it('should invoke callbacks for onError, onWarning and onItemLoadComplete', function (done) {

        this.timeout(timeOutPerAsyncTest);

        var errorCount = 0,
            warningCount = 0,
            itemCompleteCount = 0,
            queue = [
                new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
                new Loader.LoaderItem('http://www.google.com/#q=hello')
            ];

        var loader = new Loader();
        loader.setHttpTimeout(5000);
        loader.onWarning(function(loaderItem, done){
            warningCount++;
            //console.log(loaderItem.getStatus() + ' ' + this.getProgress().loaded + '/' + this.getProgress().total);
            done(loaderItem);
        });

        loader.onError(function(loaderItem, done){
            errorCount++;
            //console.log(loaderItem.getStatus() + ' ' + this.getProgress().loaded + '/' + this.getProgress().total);
            done(loaderItem);
        });

        loader.onItemLoadComplete(function(loaderItem, done){
            itemCompleteCount++;
            //console.log(loaderItem.getStatus() + ' ' + this.getProgress().loaded + '/' + this.getProgress().total);
            done(loaderItem);
        });

        loader.load(queue, function(err, results){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(results), 'results should exist');
            assert(_.isArray(results), 'results should be an Array');
            assert(errorCount === 1, 'Errorcount should be 1');
            assert(warningCount === 3, 'warningCount should be 3');
            assert(itemCompleteCount === 1, 'itemCompleteCount should be 1');
            done();
        });
    });

    it('should support method chaining', function (done) {

        this.timeout(timeOutPerAsyncTest);

        var queue = [
            new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
            new Loader.LoaderItem('http://www.google.com/#q=hello')
        ];

        new Loader()
        .setHttpTimeout(1000)
        .setNumRetries(3)
        .setHttpThrottle(5)
        .onWarning(function(loaderItem, done){
            done(loaderItem);
        })

        .onError(function(loaderItem, done){
            done(loaderItem);
        })

        .onItemLoadComplete(function(loaderItem, done){
            done(loaderItem);
        })

        .load(queue, function(err, results){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(results), 'results should exist');
            assert(_.isArray(results), 'results should be an Array');
            done();
        });
    });
});
