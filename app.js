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

async function creat() {
  // await prisma.user.deleteMany()

  const post = await prisma.post.createMany({
    data: [{
      title: "Mental Health",
      role: "Mental Health Professional",
      content: "Remember, it's okay to not be okay. Taking care of your mental health is just as important as taking care of your physical health. What are some self-care practices you've found helpful?",
      fullcontent: "Remember, it's okay to not be okay. Taking care of your mental health is just as important as taking care of your physical health. What are some self-care practices you've found helpful? Here are some tips to get started:\n\n1. Practice mindfulness daily\n2. Stay connected with loved ones\n3. Get regular exercise\n4. Maintain a healthy sleep schedule\n5. Seek professional help when needed\n\nRemember, you're not alone in this journey.",
      likes: 234,
      comments: 45,
      username: "DEV-endra"
    }, {
      title: "Mental Health",
      role: "Mental Health Professional",
      content: "Remember, it's okay to not be okay. Taking care of your mental health is just as important as taking care of your physical health. What are some self-care practices you've found helpful?",
      fullcontent: "Remember, it's okay to not be okay. Taking care of your mental health is just as important as taking care of your physical health. What are some self-care practices you've found helpful? Here are some tips to get started:\n\n1. Practice mindfulness daily\n2. Stay connected with loved ones\n3. Get regular exercise\n4. Maintain a healthy sleep schedule\n5. Seek professional help when needed\n\nRemember, you're not alone in this journey.",
      likes: 234,
      comments: 45,
      username: "dev2005"
    },
    {
      title: "Mental Health",
      role: "Mental Health Professional",
      content: "Remember, it's okay to not be okay. Taking care of your mental health is just as important as taking care of your physical health. What are some self-care practices you've found helpful?",
      fullcontent: "Remember, it's okay to not be okay. Taking care of your mental health is just as important as taking care of your physical health. What are some self-care practices you've found helpful? Here are some tips to get started:\n\n1. Practice mindfulness daily\n2. Stay connected with loved ones\n3. Get regular exercise\n4. Maintain a healthy sleep schedule\n5. Seek professional help when needed\n\nRemember, you're not alone in this journey.",
      likes: 234,
      comments: 45,
      username: "DEV-endra"
    }
    ]
  })
  // console.log(user)
  const all = await prisma.post.findMany()
  console.log(all)
}

async function del() {
  await prisma.post.deleteMany();
}

async function print() {
  const all = await prisma.post.findMany()
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
