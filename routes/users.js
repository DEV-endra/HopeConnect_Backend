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
  // console.log(posts);
  res.status(200).json(posts);
  // console.log('he he u can see the posts');
});

router.get('/chats', authMiddleware, async function (req, res) {
  const { username } = req.query;
  const user = await prisma.user.findFirst({
    where: {
      username: username
    }
  })
  const userId = user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1_id: userId },
        { user2_id: userId }
      ]
    }
  })

  const updatedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const anotherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

      // Fetch the username from the Users table
      const anotherUser = await prisma.user.findUnique({
        where: { id: anotherUserId },
        select: { username: true }
      });

      return {
        ...conv,
        another_user: anotherUser?.username || "Unknown"
      };
    })
  );

  // console.log(updatedConversations);

  const conversationIds = updatedConversations.map(conv => conv.id);

  const messages = await prisma.message.findMany({
    where: {
      conversationId: { in: conversationIds }
    },
    orderBy: {
      time: "asc"
    }
  });


  const updatedMessages = await Promise.all(
    messages.map(async (msg) => {
      const sender = await prisma.user.findUnique({
        where: { id: msg.sender_id },
        select: { username: true, avatar: true } // Fetch username & avatar
      });

      return {
        id: msg.conversationId, // Keep conversationId
        senderid: msg.sender_id, // Keep sender_id
        username: sender?.username || "Unknown",
        avatar: sender?.avatar || null, // Keep null if no avatar
        text: msg.text,
        time: msg.time,
        uniq: msg.id
      };
    })
  );

  res.status(200).json({ updatedConversations, updatedMessages });

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
