# fibers and async storage

The idea here is to validate the behavior of Fibers with AsyncLocalStorage.

We received this feedback https://github.com/meteor/meteor/issues/11311#issuecomment-774503320 but trying to reproduce the issue we found a different behavior.

You can check locally by running:
```shell
git clone git@github.com:filipenevola/fibers-and-async-storage.git
cd fibers-and-async-storage
nvm install 14.17
npm install
npm start
open your browser at http://localhost:3000?userId=filipe
```

You should see this in the browser:
```txt
Hello from Connect filipe!
More data filipe!
```

And this in the server console with different timestamps:
```txt
listening http://localhost:3000
wait... Sun Jun 06 2021 08:05:30 GMT-0400 (Amazon Standard Time)
sleep sleeping for filipe
async running
ok... Sun Jun 06 2021 08:05:31 GMT-0400 (Amazon Standard Time)
{"userId":"filipe"}: start
{"userId":"filipe"}: finish
wait from asyncLocalStorage... Sun Jun 06 2021 08:05:31 GMT-0400 (Amazon Standard Time)
sleepAsync sleeping for filipe
ok from asyncLocalStorage... Sun Jun 06 2021 08:05:32 GMT-0400 (Amazon Standard Time)
```

Am I missing something to reproduce the reported error?
