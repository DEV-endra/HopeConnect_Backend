var express = require('express');
var router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authMiddleware, roleMiddleware } = require("../controllers/authMiddleware");
const jwt = require("jsonwebtoken");
const ImageKit = require("imagekit");
const process = require('process');
require("dotenv").config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    include: {
      User: {
        select: {
          avatar: true
        }
      }
    }
  });

  const formattedPosts = posts.map(post => ({
    ...post,
    avatar: post.User?.avatar || null
  }));

  res.status(200).json(formattedPosts);

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
        lastText: "xhf jbvjbi hfv",
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
    another_user: anotherUser.username,
    avatar: anotherUser.avatar,
  }

  //console.log(newConversation);
  res.status(200).json(newConversation);

});


router.get('/history', authMiddleware, async function (req, res) {

  const token = req.header("Authorization")?.split(" ")[1];
  console.log(token);
  var user1 = verifyToken(token);
  console.log(user1);

  const userdata = await prisma.user.findFirst({
    where: {
      id: user1
    },
    select: {
      username: true,
    }
  });

  const username = userdata.username;
  // console.log(username);
  const chats = await prisma.gemini.findMany({
    where: {
      username: username,
    },
  });
  // console.log(chats);

  const sending_chats = chats.map(chat => ({
    id: chat.id,
    username: chat.sender,
    text: chat.text,
    time: chat.time

  }));


  // console.log(sending_chats);
  res.status(200).json(sending_chats);

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
      });

      return {
        ...conv,
        another_user: anotherUser?.username || "Unknown",
        avatar: anotherUser.avatar,
      };
    })
  );

  console.log(updatedConversations);

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
  res.status(200).json("post uploaded");
});

router.get('/philosophy', authMiddleware, async function (req, res) {

  const { query } = req.query;
  const token = req.header("Authorization")?.split(" ")[1];
  var userId = verifyToken(token);

  const userdata = await prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      username: true,
    }
  });

  const username = userdata.username;

  // inserting user's last chat
  const chat = await prisma.gemini.create({
    data: {
      username: username,
      sender: username,
      text: query,
    }
  });

  try {
    const response = await fetch("http://127.0.0.1:8000/philosophy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    const ans = await response.json();

    const chat = await prisma.gemini.create({
      data: {
        username: username,
        sender: "gemini",
        text: ans.answer,
      }
    });

    console.log(chat);
    res.status(200).json({ id: chat.id, text: chat.text, time: chat.time, username: "gemini" });
  } catch (error) {
    console.error("Error:", error);
  }

});

router.get('/auth', function (req, res) {
  const authParams = imagekit.getAuthenticationParameters();
  res.json(authParams); // returns { token, expire, signature }
});

router.post('/verify', async function (req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ status: "error", message: "Token not provided" });
  }
  const payload = verifyToken(token);

  if (payload) {
    res.status(200).json({ status: "valid", user: payload });
  } else {
    res.status(401).json({ status: "invalid", message: "Invalid or expired token" });
  }
});

router.post('/update', authMiddleware, async function (req, res) {
  dat = req.body;
  console.log(dat);
  const user = await prisma.user.update({
    where: { username: dat.username },
    data: {
      avatar: dat.avatar,
    }
  });
  // console.log(user);
  res.status(200).json("updated successfully");
});

module.exports = router;
