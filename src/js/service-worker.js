// ToDo: Add swervice worker to cache images, styles and js
if ('serviceWorker' in navigator) {
    console.log('Register serviceworker');
    navigator.serviceWorker.register('/service-worker.js')
        .then(function() {
            console.log('Registration complete.');
        }, function() {
            console.log('Registration failure.');
        });
  } else {
    console.log('Service worker not supported.');
  }
