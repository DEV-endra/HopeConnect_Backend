var express = require('express');
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const JWT_SECRET = "your_super_secret_key";
const { authMiddleware, roleMiddleware } = require("../controllers/authMiddleware");
const jwt = require("jsonwebtoken");

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
}

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

router.get('/newconversation', authMiddleware, async function (req, res) {

  var { peopleId } = req.query;
  const token = req.header("Authorization")?.split(" ")[1];
  console.log(token);
  var user1 = verifyToken(token);
  console.log(user1);
  await prisma.conversation.createMany({
    data: [
      {
        user1_id: user1,
        user2_id: peopleId,
        lastText: "",
      }
    ]
  });

  const newconv = await prisma.conversation.findFirst({
    where: {
      user1_id: user1,
      user2_id: peopleId,
    }
  })

  // console.log("RODIES");
  // console.log(newconv);

  const anotherUserId = newconv.user1_id === user1 ? newconv.user2_id : newconv.user1_id;

  const anotherUser = await prisma.user.findUnique({
    where: { id: anotherUserId },
    select: { username: true }
  });

  const newConversation = {
    id: newconv.id,
    user1_id: newconv.user1_id,
    user2_id: newconv.user2_id,
    lastText: newconv.lastText,
    another_user: anotherUser.username
  }

  //console.log(newConversation);
  res.status(200).json(newConversation);

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


  // extracting peoples from db
  const Peoples = await prisma.user.findMany({

    where: {
      NOT: {
        id: userId,
      }
    },

    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      avatar: true,
      description: true,
    }
  });

  res.status(200).json({ updatedConversations, updatedMessages, Peoples });

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
