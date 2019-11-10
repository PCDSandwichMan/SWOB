const Notifications = require('../models/Notification');
const router = require('express').Router();
const exTools = require('../utils/extractTools');
const valTools = require('../utils/validators');
const battle = require('../controllers/battleController');

// Get Chat Messages
router.get('/messages/:type', async (req, res) => {
  // Verifies the that the path param is valid
  if (
    req.params.type !== 'battle' &&
    req.params.type !== 'general' &&
    req.params.type !== 'chat'
  ) {
    return res
      .status(400)
      .json({ userMessages: 'you did not send a valid type in you parameter' });
  }

  if (req.params.type === 'battle') {
  }

  // Verify token and get user from token
  const user = await exTools.tokenExtract(req);
  // TODO for testing can delete me
  // console.log('========= NOTIFICATION ROUTES =============');
  // console.log(user);
  // console.log('========= NOTIFICATION ROUTES =============');
  if (user) {
    if (user.errors) {
      return res.status(400).json(user.errors);
    }

    const userId = user._id;
    const getAllMessageType = await Notifications.find({
      $and: [
        { $or: [{ receiver: userId }, { sender: userId }] },
        { readStatus: false },
        { messageType: req.params.type }
      ]
    })
      .sort({ createdAt: 'desc' })
      .limit(10);
    if (getAllMessageType.length <= 0) {
      return res
        .status(404)
        .json({ chatMessages: 'there are not chat messages for this user' });
    }
    return res.status(200).json(getAllMessageType);
  }
  return res.status(500).json({
    notifications: 'an error occurred while gather notification for this user'
  });
});

// Handle Battles
router.post('/battle', async (req, res) => {
  const handleBattle = await battle.battleHandler(req);
  if (!handleBattle) {
    return res
      .status(500)
      .json({ message: 'an error occurred while fetching the users posts' });
  }
  if (!handleBattle.success) {
    return res.status(400).json(handleBattle.errors);
  }
  return res.status(200).json(handleBattle.sampleResponse);
});

// Create new message
router.post('/messages/create', async (req, res) => {
  // - Check for token and validates then returns user or errors
  const user = await exTools.tokenExtract(req);
  if (user.errors) {
    return res.status(400).json(user.errors);
  }
  // - validates message info
  const senderIdFromToken = user._id;
  const validateMessageInfo = valTools.validateChatMessage(req.body);
  if (!validateMessageInfo.valid) {
    return res.status(400).json(validateMessageInfo.errors);
  }
  const newMessage = new Notifications({
    messageType: req.body.messageType,
    sender: senderIdFromToken,
    receiver: req.body.receiver,
    message: req.body.message,
    battleStatus: req.body.battleStatus
  });

  newMessage.save((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'an error occurred while trying to save your message'
      });
    }
    res.status(200).json(result);
  });
});

// Change message read status
router.post('/messages/readStatus', async (req, res) => {
  // - Check for token and validates then returns user or errors
  const user = await exTools.tokenExtract(req);
  if (user.errors) {
    return res.status(400).json(user.errors);
  }
  // - validate info to change status
  const validateChangeInfo = await valTools.validateMessageStatus(req.body);
  if (!validateChangeInfo.valid) {
    return res.status(400).json(validateChangeInfo.errors);
  }

  // - Changes message status
  const changeStatus = await Notifications.findByIdAndUpdate(
    req.body.messageId,
    {
      readStatus: req.body.status
    }
  );
  return res.status(200).json({ message: 'working on it' });
});

module.exports = router;
