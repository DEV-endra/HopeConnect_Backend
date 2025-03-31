var express = require('express');
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const JWT_SECRET = "your_super_secret_key";
const { authMiddleware, roleMiddleware } = require("../controllers/authMiddleware");

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/posts', authMiddleware, async function (req, res) {
  const posts = await prisma.post.findMany({
    distinct: ['username'],
    orderBy: { createdAt: 'desc' },
  });
  console.log(posts);
  res.status(200).json(posts);
  // console.log('he he u can see the posts');
});

router.post('/posted', authMiddleware, async function (req, res) {
  dat = req.body;
  const post = await prisma.post.create({
    data: dat,
  });
  //console.log(post);
  res.status(200).json("post uploaded");
  // const posts = await prisma.post.findMany({
  //   distinct: ['username'],
  //   orderBy: { createdAt: 'desc' },
  // });
  // console.log(posts);
  // res.status(200).json(posts);
  // console.log('he he u can see the posts');
});




module.exports = router;
