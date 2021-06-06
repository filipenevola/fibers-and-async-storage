const Fiber = require('fibers');
const { AsyncLocalStorage } = require('async_hooks')

const asyncLocalStorage = new AsyncLocalStorage();

function logWithId(msg) {
  const id = asyncLocalStorage.getStore();
  console.log(`${id != null ? JSON.stringify(id) : '-'}:`, msg);
}
async function sleepAsync(ms) {
  const store = asyncLocalStorage.getStore();
  console.log(`sleepAsync sleeping for ${store.userId}`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sleep(ms) {
  const fiber = Fiber.current;
  console.log(`sleep sleeping for ${fiber.userId}`);
  setTimeout(function () {
    fiber.run();
  }, ms);
  Fiber.yield();
}

const connect = require('connect');
const http = require('http');

const PORT = 3000;

const app = connect();

// gzip/deflate outgoing responses
const compression = require('compression');
app.use(compression());

// store session state in browser cookie
const cookieSession = require('cookie-session');
app.use(cookieSession({
  keys: ['secret1', 'secret2']
}));

// parse urlencoded request bodies into req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

// respond to all requests
app.use(function (req, res) {
  const {query} = req._parsedUrl;

  const {userId} = (query || "").split('&').reduce((acc, queryParam) => {
    const [key, value] = queryParam.split('=');
    return {...acc, [key]: value};
  }, {});

  res.write(`Hello from Connect ${userId || 'anon'}!`);
  if (!userId) {
    res.end();
    return;
  }
  Fiber(function () {
    Fiber.current.userId = userId;
    console.log('wait... ' + new Date);
    sleep(1000);
    res.write(`\nMore data ${userId}!`);
    console.log('ok... ' + new Date);
    res.end();

    asyncLocalStorage.run(Fiber.current, () => {
      logWithId('start');
      // Imagine any chain of async operations here
      setImmediate(async () => {
        logWithId('finish');
        console.log('wait from asyncLocalStorage... ' + new Date);
        await sleepAsync(1000);
        console.log('ok from asyncLocalStorage... ' + new Date);
      });
    });
  }).run();
  console.log('async running');
});

http.createServer(app).listen(PORT);

console.log(`listening http://localhost:${PORT}`)

