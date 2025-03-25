const { PrismaClient } = require('@prisma/client');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const prisma = new PrismaClient();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

async function main() {
  // await prisma.user.deleteMany()
  // const user = await prisma.user.create({
  //   data: {
  //     name: "dev",
  //     email: "dev@gmail.com",
  //     age: 20,
  //     userPreference: {
  //       create: {
  //         emailUpdates: true,
  //       }
  //     }
  //   },
  //   // include: {
  //   //     userPreference: true,
  //   // }

  //   // OR USE SELECT

  //   // select: {
  //   //   name: true,
  //   //   userPreference: true
  //   // }
  // })


  // console.log(user)
  const all = await prisma.user.findMany()
  console.log(all)
}

// main();

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
