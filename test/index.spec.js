const assert = require('assert')
	, should = require('should')
	, ping = require('ping')
    , nock = require('nock')
	, Loader = require('../')
	, _ = require('lodash')
    , Promise = require('bluebird')
    , fs = Promise.promisifyAll(require('fs'));

describe('HtmlLoader', function() {

    this.timeout(8000);

    let mockBing,
        mockGoogle,
        mockYahoo;

    /**
     * Load the mock HTML response data into memory
     */
    before(function(done){

        fs.readFileAsync(
            process.cwd() + '/test/mock/bing.com.html',
            'utf-8'
        )

        .then(function(data){

            mockBing = data;

            return fs.readFileAsync(
                process.cwd() + '/test/mock/google.com.html',
                'utf-8'
            );
        })

        .then(function(data){

            mockGoogle = data;

            return fs.readFileAsync(
                process.cwd() + '/test/mock/yahoo.com.html',
                'utf-8'
            );
        })

        .then(function(data){
            mockYahoo = data;
            done();
        })

        .catch(done);
    });

    afterEach(function(){
        nock.cleanAll();
    });

    it('should instantiate a new BulkHtmlLoader instance', function () {

        const loader = new Loader();

        should.exists(loader);
        assert(loader instanceof Loader, 'check instance');
        assert(_.isFunction(loader.toString), 'toString should be a function');
        loader.toString().should.be.a.String();
    });

    it('should instantiate a new LoaderItem instance', function () {
        const loaderItem = new Loader.LoaderItem('http://google.com');
        should.exists(loaderItem);
        assert(loaderItem instanceof Loader.LoaderItem);
    });

    it('should create a loaderItem using static method BulkHtmlLoader.getLoaderItem()', function () {
        const loaderItem = Loader.getLoaderItem('http://google.com');
        assert(loaderItem instanceof Loader.LoaderItem);
    });

    it('should load 3 urls successfully', function (done) {

        const queue = [
            'http://bing.com',
            'http://google.com',
            'http://yahoo.com'
        ];

        nock(queue[0])
            .get('/')
            .reply(200, mockBing);

        nock(queue[1])
            .get('/')
            .reply(200, mockGoogle);

        nock(queue[2])
            .get('/')
            .reply(200, mockYahoo);

        const loader = new Loader();

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

    it('should produce two successful and one failed load', function (done) {

        const queue = [
            'http://bing.com',
            'http://should-fail-and-produce-404.com',
            'http://yahoo.com'
        ];

        nock(queue[0])
            .get('/')
            .reply(200, mockBing);

        nock(queue[1])
            .get('/')
            .reply(404);

        nock(queue[2])
            .get('/')
            .reply(200, mockYahoo);

        const loader = new Loader();

        loader.load(queue, function(err, loaderItems){
            assert(err === null, 'Error should not exist');
            assert(!_.isNull(loaderItems) , 'results should exist');
            assert(_.isArray(loaderItems), 'results should be an Array');
            assert(loaderItems.length === 3, 'expect 3 results');

            let successCount = 0;

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

        const queue = [
            'http://bing.com',
            'http://google.com',
            'http://yahoo.com'
        ];

        nock(queue[0])
            .get('/')
            .reply(200, mockBing);

        nock(queue[1])
            .get('/')
            .reply(200, mockGoogle);

        nock(queue[2])
            .get('/')
            .reply(200, mockYahoo);

        let count = 0;
        const loader = new Loader();

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

    it('should produce 3 warnings', function (done) {

        let warningCount = 0,
            queue = [
                new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
                new Loader.LoaderItem('http://www.google.com')
            ];

        nock(queue[0].getUrl())
            .get('/')
            .reply(404);

        nock(queue[1].getUrl())
            .get('/')
            .reply(200, mockGoogle);

        const loader = new Loader();

        loader.onWarning(function(loaderItem, next){
            warningCount++;
            next(loaderItem);
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

        let errorCount = 0,
            warningCount = 0,
            itemCompleteCount = 0,
            queue = [
                new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
                new Loader.LoaderItem('http://www.google.com')
            ];

        nock(queue[0].getUrl())
            .get('/')
            .reply(404);

        nock(queue[1].getUrl())
            .get('/')
            .reply(200, mockGoogle);

        const loader = new Loader();

        loader.onWarning(function(loaderItem, done){
            warningCount++;
            done(loaderItem);
        });

        loader.onError(function(loaderItem, done){
            errorCount++;
            done(loaderItem);
        });

        loader.onItemLoadComplete(function(loaderItem, done){
            itemCompleteCount++;
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

        const queue = [
            new Loader.LoaderItem('http://www.a-bad-url-that-will-fail'),
            new Loader.LoaderItem('http://www.google.com')
        ];

        nock(queue[0].getUrl())
            .get('/')
            .reply(404);

        nock(queue[1].getUrl())
            .get('/')
            .reply(200, mockGoogle);

        new Loader()
            .setHttpTimeout(1000)
            .setNumRetries(3)
            .setMaxConcurrentConnections(5)
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

    it('should change events.EventEmitter.defaultMaxListeners', function (done) {

        const queue = [
            'http://www.google.com'
        ];

        nock(queue[0])
            .get('/')
            .reply(200, mockGoogle);

        const loader1 = new Loader();
        loader1.setMaxConcurrentConnections(100);
        assert(loader1._maxConcurrentConnections === 100, 'events.EventEmitter.defaultMaxListeners should be 100');
        const loader2 = new Loader();
        assert(loader2._maxConcurrentConnections === 10, 'Should reset global var "events.EventEmitter.defaultMaxListeners" to 10 when creating a new loader instance');
        done();
    });
});
