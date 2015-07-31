// importing the bluebird promise library.
// there are several decent options including bluebird and q. bluebird is faster and has better error handling so i would normally choose bluebird when possible.
// one thing to note is that you should avoid using es6 promises because they are slow and have bad error handling

var Promise = require('bluebird');
var fakeapi = require('./fakeapi');

// example function to illustrate creation and use of promises
function slowadd(a,b) {
  // create a new promise and immediately return it.

  return new Promise(function(resolve,reject) {
    // impose an artificial delay so we can see the async in action
    setTimeout(function() {
      if (typeof a === 'number' && typeof b === 'number') {
        // resolve will call the first .then handler that was assigned to our returned promise
        resolve(a+b);
      } else {
        // reject will call .catch or if it doesn't exist .done, or if neither exist it will re-throw the error (this is the behavior that changes the most between different promise libraries, so this is bluebird specific.)
        reject(new Error('slowadd will only add numbers'));
      }
    },500);
  });
}


// Examples of using slowadd
// Note: all the examples below will run at the same time, so probably comment everything out that you don't want running :)

// simplest use-case. will log 3 in .5 secs.
slowadd(1,2).then(function(data) {console.log(data);});


// how to chain promises for sequential execution
// the reason to chain them instead of nesting them is so we avoid having pyramid code
slowadd(1,1).then(function(data) {
  console.log(data);
  // here we have evaluated the first promise and have our data = 2
  // now we create another promise that will be resolved with 1+2 and return it
  return slowadd(1,data);
  // when the returned promise is resolved, the next .then handler in the sequence is called with the new result
}).then(function(data2) {
  console.log(data2);
  return slowadd(1,data2);
}).then(function(data3) {
  console.log(data3);
});


// nesting promises
console.log("\nnesting");
slowadd(1,1).then(function(data) {
  slowadd(1,data).then(function(data2) {
    slowadd(1,data2).then(function(data3) {
      // the reason to nest promises is so that you have access to all the results at the same time.
      console.log(data,data2,data3);
    });
  });
});


// running arrays of promises in parallel
// this is when you really need to be using promises
Promise.all([
  slowadd(1,2),
  slowadd(3,5),
  slowadd(2,10),
  slowadd(1,9)
]).then(function(arr) {
  console.log(arr);
});


// // how to catch errors. this works basically the same with any of the above examples
// // bluebird also has catching of specific errors which i'm not getting into here
// Promise.all([
//   slowadd(1,2),
//   slowadd(3,'5'),
//   slowadd(2,10),
//   slowadd(1,9)
// ]).then(function(arr) {
//   console.log(arr);
// }).catch(function(err) {
//   console.log('Error: ',err);
// });

// // if the error isn't caught bluebird will throw an exception.
// Promise.all([
//   slowadd(1,2),
//   slowadd(3,'5'),
//   slowadd(2,10),
//   slowadd(1,9)
// ]).then(function(arr) {
//   console.log(arr);
// });

// // if you were using Q you need to call .done() to catch all unhandled errors
// Promise.all([
//   slowadd(1,2),
//   slowadd(3,'5'),
//   slowadd(2,10),
//   slowadd(1,9)
// ]).then(function(arr) {
//   console.log(arr);
// }).done();



// Example of accessing an api with pagination using bluebird promises and concurrency
var numpages;
// make an initial request to the api so we know how many pages we need to get
fakeapi.getData().then(function(result) {
  // grab the numpages from the result. here we could also grab the first page of data, but it slightly complicates things so we're just chucking it for now so we can get all the data in the 2nd step.
  numpages = result.numpages;

  // create an array of pagenumbers for us to map to promises
  var pagenumbers = [];
  for (var i = 1; i < numpages; i++) {
    pagenumbers.push(i);
  }

  // convert our array of pagenumbers into an array of promises for those pages.
  return Promise.map(pagenumbers,function(pagenum) {
    return fakeapi.getData(pagenum);
  }, {concurrency: 2}); // concurrency 2 will cause us to only hit the api 2 at a time.
}).then(function(secondresult) {
  // now we have our array of pages normally we would concatenate them or whatever, but for demonstration we are just console.logging the results.
  console.log(secondresult);
});
