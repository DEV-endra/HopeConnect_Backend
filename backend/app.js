const { PrismaClient } = require('@prisma/client');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const prisma = new PrismaClient();
const fs = require('fs')
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

async function creat() {

  await prisma.message.createMany({
    data: [
      {
        sender_id: "55ccfdd3-41c7-41fc-8ad4-5e8dfa575c52", // DEVENDRA CHAND
        text: "Hey Soumya, how are you?",
        conversationId: 4
      },
      {
        sender_id: "82904a2a-5aee-471d-a4ec-37b53b736e57", // soumyajyoti mohanta
        text: "Hey! I'm good. What about you?",
        conversationId: 4
      },
      {
        sender_id: "55ccfdd3-41c7-41fc-8ad4-5e8dfa575c52",
        text: "I'm doing great! Just working on some Prisma stuff.",
        conversationId: 4
      },
      {
        sender_id: "82904a2a-5aee-471d-a4ec-37b53b736e57",
        text: "Oh nice! Need any help?",
        conversationId: 4
      }
    ]
  });

  const all = await prisma.message.findMany()
  console.log(all)
}

async function del() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
}

async function print() {
  const all = await prisma.message.findMany()
  console.log(all)
}

// del();
// print();
// creat();
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
