var assert = require('assert')
	, should = require('should')
	, ping = require('ping')
	, HtmlLoader = require('../')
	, _ = require('lodash');

describe('HtmlLoader', function() {

	this.timeout(5000);

    // Check for internet connectivity before running tests
	before(function(done){

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

    var htmlLoader;

	beforeEach(function(){
		htmlLoader = new HtmlLoader();
	});

	describe('Testing HtmlLader functionality', function () {

		it('should instantiate a new HtmlLoader instance', function (done) {
			should.exists(htmlLoader);
			assert(htmlLoader instanceof HtmlLoader, 'check instance');
			assert(_.isFunction(htmlLoader.toString), 'toString should be a function');
			htmlLoader.toString().should.be.a.String();
			done();
		});
        
		it('should instantiate a new LoaderItem instance', function (done) {
			var loaderItem = new HtmlLoader.LoaderItem('http://google.com');
			should.exists(loaderItem);
			assert(loaderItem instanceof HtmlLoader.LoaderItem);
			done();
		});
        
		it('should load 3 urls successfully', function (done) {
        
			var queue = [
				new HtmlLoader.LoaderItem('http://google.com'),
				new HtmlLoader.LoaderItem('https://www.google.com.au/#q=hello'),
				new HtmlLoader.LoaderItem('https://www.google.com.au/#q=nodejs')
			];
        
			htmlLoader.load(queue, function(err, results){
				assert(err === null, 'Error should not exist');
				assert(!_.isNull(results), 'results should exist');
				assert(_.isArray(results), 'results should be an Array');
				assert(results.length === 3, 'expect 3 results');
			
				_.each(results, function(result){
					assert(result instanceof HtmlLoader.LoaderItem, 'instance of LoaderItem');
					assert(result.getResult(), 'Result should exist');
					assert(result.getStatus() === HtmlLoader.LoaderItem.COMPLETE, 'Loader status should be complete');
					assert(_.isFunction(result.getResult().html), 'Result should be an instance of cheerio and have a function named html');
				});
				
				done();
			});
		});
        
        it('should fail one load and succeed two', function (done) {
        
			var queue = [
				new HtmlLoader.LoaderItem('http://google.com'),
				new HtmlLoader.LoaderItem('http://www.a-bad-url-that-will-fail'),
				new HtmlLoader.LoaderItem('https://www.google.com.au/#q=nodejs')
			];
        
			htmlLoader.load(queue, function(err, results){
				assert(err === null, 'Error should not exist');
				assert(!_.isNull(results) , 'results should exist');
				assert(_.isArray(results), 'results should be an Array');
				assert(results.length === 3, 'expect 3 results');
        
				_.each(results, function(result){
					assert(result instanceof HtmlLoader.LoaderItem, 'instance of LoaderItem');
				});
        
				assert(results[0].getResult() !== null, '1nd load result should not be empty');
				assert(results[1].getResult() === null, '2nd load result should be null');
				assert(results[2].getResult() !== null, '1nd load result should not be empty');
        
				done();
			});
        });
        
        it('should invoke "onItemLoadComplete" callback three times', function (done) {
        
			var count = 0,
				queue = [
					new HtmlLoader.LoaderItem('http://google.com'),
					new HtmlLoader.LoaderItem('https://www.google.com.au/#q=hello'),
					new HtmlLoader.LoaderItem('https://www.google.com.au/#q=nodejs')
				];

			htmlLoader.onItemLoadComplete(function(loaderItem, done){
				count++;
				done(loaderItem);
			});
			
			htmlLoader.load(queue, function(err, results){
				assert(err === null, 'Error should not exist');
				assert(!_.isNull(results), 'results should exist');
				assert(_.isArray(results), 'results should be an Array');
				assert(results.length === 3, 'expect 3 results');
				assert(count === 3, 'onLoadComplete callback fire 3 times');
        
				done();
			});
        });

        it('should count 3 warnings', function (done) {

            this.timeout(5000);

            var count = 0,
                queue = [
                    new HtmlLoader.LoaderItem('https://dsfsnffnsofdsoifsofdsofso.com'),
                    new HtmlLoader.LoaderItem('https://www.google.com.au/#q=hello')
                ];

            htmlLoader.setHttpTimeout(1000);
            htmlLoader.setNumRetries(3);

            htmlLoader.onWarning(function(loaderItem, done){
                count++;
                done(loaderItem);
            });

            htmlLoader.load(queue, function(err, results){
                assert(err === null, 'Error should not exist');
                assert(!_.isNull(results), 'results should exist');
                assert(_.isArray(results), 'results should be an Array');
                assert(results.length === 2, 'expect 3 results');
                assert(count === 3, 'onLoadComplete callback fire 3 times');
                done();
            });
        });

        it('should invoke callbacks for onError, onWarnings and onItemLoadComplete', function (done) {

            this.timeout(5000);

            var errorCount = 0,
                warningCount = 0,
                itemCompleteCount = 0,
                queue = [
                    new HtmlLoader.LoaderItem('https://bogus-url-that-should-fail'),
                    new HtmlLoader.LoaderItem('https://www.google.com.au/#q=hello')
                ];

            htmlLoader.onWarning(function(loaderItem, done){
                warningCount++;
                done(loaderItem);
            });

            htmlLoader.onError(function(loaderItem, done){
                errorCount++;
                done(loaderItem);
            });

            htmlLoader.onItemLoadComplete(function(loaderItem, done){
                itemCompleteCount++;
                //console.log(this.getProgress().loaded + '/' + this.getProgress().total);
                done(loaderItem);
            });

            htmlLoader.load(queue, function(err, results){
                assert(err === null, 'Error should not exist');
                assert(!_.isNull(results), 'results should exist');
                assert(_.isArray(results), 'results should be an Array');
                assert(errorCount === 1, 'Errorcount should be 1');
                assert(warningCount === 3, 'warningCount should be 3');
                assert(itemCompleteCount === 1, 'Errorcount should be 1');
                done();
            });
        });

        it('should support method chaining', function (done) {

            this.timeout(5000);

            var count = 0,
                queue = [
                    new HtmlLoader.LoaderItem('http://www.a-bad-url-that-will-fail'),
                    new HtmlLoader.LoaderItem('https://www.google.com.au/#q=hello')
                ];

            new HtmlLoader()
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

        it('should create a loaderItem using htmlLoader.getLoaderItem() method', function (done) {
            var loaderItem = htmlLoader.getLoaderItem('http://google.com', {});
            assert(loaderItem instanceof HtmlLoader.LoaderItem);
            done();
        });
    });
});
