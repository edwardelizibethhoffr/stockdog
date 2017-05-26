'use strict';

angular.module('stockDogApp')
  .service('QuoteService', function QuoteService($http, $interval) {
   	var stocks = [];
   	var BASE = 'https://query.yahooapis.com/v1/public/yql';

   	//[1] handles updating stock model with appropiate data from quote
   	var update = function (quotes) {
   		console.log(quotes);
   		if (quotes.length === stocks.length) {
   			_.each(quotes, function (quote, idx) {
   				var stock = stocks[idx];
   				stock.lastPrice = parseFloat(quote.LastTradePriceOnly)+ _.random(-0.5,0.5); //append random number to trigger pricechange fade effect
   				stock.change = quote.Change;
   				stock.percentChange = quote.ChangeinPercent;
   				stock.marketValue = stock.shares * stock.lastPrice;
   				stock.dayChange = stock.shares * parseFloat(stock.change);
   				stock.save();
   			});
   		}
   	};

   	//[2] helper functions for managing which stocks to pull quotes for 
   	this.register = function (stock) {
   		stocks.push(stock);
   	};
   	this.deregister = function (stock) {
   		_.remove(stocks, stock);
   	};
   	this.clear = function () {
   		stocks = [];
   	};

   	// [3] Main processing function for communicating with Yahoo Finance API
   	this.fetch = function () {
   		var symbols = _.reduce(stocks, function (symbols, stock) {
   			symbols.push(stock.company.symbol);
   			return symbols;
   		}, []);
   		var query = encodeURIComponent('select * from yahoo.finance.quotes where symbol in (\'' + symbols.join(',') + '\')');
   		var url = BASE + '?' + 'q=' + query + '&format=json&diagnostics=false&env=store://datatables.org/alltableswithkeys';
   		console.log(url)
   		$http.jsonp(url + '&callback=JSON_CALLBACK')
   			.success(function (data) {
   				if (data.query.count) {
   					var quotes = data.query.count > 1 ? data.query.results.quote : [data.query.results.quote];
   					update(quotes);
   				}
   			})
   			.error(function (data) {
   				console.log(data);
   			});
   	};

   	//[4] used to fetch new quote data every 5 seconds
   	$interval(this.fetch, 5000);
  });
