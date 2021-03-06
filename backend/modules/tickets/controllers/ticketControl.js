const User = require("../../users/Model/user.model");
const Admin = require("../../users/Model/user.model");
const Agent = require("../../users/Model/user.model");
const Ticket = require("../model/ticket.model");
const asyncWrapper = require("../../../middlewares/async");
const { StatusCodes } = require("http-status-codes");
const fileSizeFormatter = require("../../../utils/fileSize");
const {
  sendTicketConfirmation,
  sendTicketAssgin,
  sendTicketSolution,
  sendTicketUpdation,
} = require("../../../utils/Mails");

// this function for creating a ticket  =>
const createTicket = async (req, res, next) => {
  try {
    let filesArray = [];
    req.files.forEach((element) => {
      if (
        element.mimetype === "image/jpg" ||
        element.mimetype === "image/jpeg" ||
        element.mimetype === "image/png"
      ) {
        const file = {
          fileName: element.originalname,
          filePath: element.path,
          fileType: element.mimetype,
          fileSize: fileSizeFormatter(element.size, 2),
        };
        filesArray.push(file);
      }
    });
    console.log(filesArray);

    const audioArray = req.files
      .filter((file) => file.mimetype === "audio/webm")
      .map((file) => {
        return {
          fileName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: fileSizeFormatter(file.size, 2),
        };
      });
    console.log(audioArray);

    const { title, description, department, userID } = req.body;
    const ticket = await Ticket.create({
      title,
      description,
      department,
      user: userID,
      audioRecord: audioArray,
      attachment: filesArray,
    });

    let userTickets = await Ticket.find({ user: userID });

    const sendTicket = await User.findOneAndUpdate(
      { _id: userID },
      {
        createdThings: [...userTickets],
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(StatusCodes.CREATED).json(ticket);
    //sendTicketConfirmation(User.name, User.email, req.body._id);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error.message);
  }
};

const assignTicket = async (req, res) => {
  const allowedUpdates = ["priorty", "status"];
  const keys = Object.keys(req.body);
  const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
  if (!isUpdationValid)
    res
      .status(StatusCodes.BAD_REQUEST)
      .json(`You can only assign ${allowedUpdates}`);
  try {
    const { id: ticketID } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketID,
      },
      { priorty: req.body.priorty, status: req.body.status },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ticket)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(`No ticket with id : ${ticketID}`);
    res.status(StatusCodes.OK).json(ticket);
    //sendTicketSolution(User.name, User.email, req.body._id);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
};

const editTicket = async (req, res) => {
  const allowedUpdates = [
    "title",
    "department",
    "description",
    "attachment",
    "audioRecord",
  ];
  const keys = Object.keys(req.body);
  const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
  if (!isUpdationValid)
    res.status(StatusCodes.BAD_REQUEST).json("You can only reply");
  try {
    const { id: ticketID } = req.params;

    let filesArray = [];
    req.files.forEach((element) => {
      if (
        element.mimetype === "image/jpg" ||
        element.mimetype === "image/jpeg" ||
        element.mimetype === "image/png"
      ) {
        const file = {
          fileName: element.originalname,
          filePath: element.path,
          fileType: element.mimetype,
          fileSize: fileSizeFormatter(element.size, 2),
        };
        filesArray.push(file);
      }
    });
    console.log(filesArray);

    const audioArray = req.files
      .filter((file) => file.mimetype === "audio/webm")
      .map((file) => {
        return {
          fileName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: fileSizeFormatter(file.size, 2),
        };
      });
    console.log(audioArray);

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketID,
      },
      {
        title: req.body.title,
        department: req.body.department,
        description: req.body.description,
        attachment: filesArray,
        audioRecord: audioArray,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ticket)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(`No ticket with id : ${ticketID}`);
    res.status(StatusCodes.OK).json(ticket);
    //sendTicketSolution(User.name, User.email, req.body._id);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
};

const solveTicket = async (req, res) => {
  const allowedUpdates = ["solve", "agent"];
  const keys = Object.keys(req.body);
  const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
  if (!isUpdationValid)
    res.status(StatusCodes.BAD_REQUEST).json("You can only reply");
  try {
    const { id: ticketID } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketID,
      },
      {
        $push: { solve: req.body.solve },
        status: "User-Reply",
        agent: req.body.agent,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ticket)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(`No ticket with id : ${ticketID}`);
    res.status(StatusCodes.OK).json(ticket);
    //sendTicketSolution(User.name, User.email, req.body._id);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
};

const replyTicket = async (req, res) => {
  const allowedUpdates = ["reply"];
  const keys = Object.keys(req.body);
  const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
  if (!isUpdationValid)
    res.status(StatusCodes.BAD_REQUEST).json("You can only reply");
  try {
    const { id: ticketID } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketID,
      },
      { $push: { reply: req.body.reply }, status: "In-Progress" },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!ticket)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(`No ticket with id : ${ticketID}`);
    res.status(StatusCodes.OK).json(ticket);
    //sendTicketSolution(User.name, User.email, req.body._id);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
};

const deleteTicket = asyncWrapper(async (req, res) => {
  const { id: ticketID } = req.params;
  const ticket = await Ticket.findOneAndDelete({ _id: ticketID });
  if (!ticket) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(`No ticket with id : ${ticketID}`);
  }
  res.status(StatusCodes.OK).json({ ticket });
});

const getTicket = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findOne({
    _id: id,
  });
  if (!ticket) {
    throw new NotFoundError(`No Ticket with id ${ticket}`);
  }
  res.status(StatusCodes.OK).json({ ticket });
});

const getAllTickets = asyncWrapper(async (req, res) => {
  const tickets = await Ticket.find({}, {}, { sort: { _id: -1 } }).exec();
  res.status(StatusCodes.OK).json({ tickets });
});

// Func that find tickets that been created by a user
const getMyTickts = asyncWrapper(async (req, res) => {
  const { id: userID } = req.params;

  let userTickets = await Ticket.find(
    { user: userID },
    {},
    { sort: { _id: -1 } }
  );

  if (!userTickets) {
    throw new NotFoundError(`No Ticket with user_id ${userTickets}`);
  }
  res.status(StatusCodes.OK).json({ userTickets, count: userTickets.length });
});

const getAgentTickts = asyncWrapper(async (req, res) => {
  const { id: agentID } = req.params;

  let agentTickets = await Ticket.find(
    { agent: agentID },
    {},
    { sort: { _id: -1 } }
  );

  if (!agentTickets) {
    throw new NotFoundError(`No Ticket with agent_id ${agentTickets}`);
  }
  res.status(StatusCodes.OK).json({ agentTickets, count: agentTickets.length });
});

const ticketDept = asyncWrapper(async (req, res) => {
  const { id: agentID } = req.params;

  let ticketDept = await Ticket.find({ department });
  let agentDept = await User.findOne({ _id: agentID, department: ticketDept });

  if (ticketDept === agentDept)
    res.status(StatusCodes.OK).json({ ticketDept, count: ticketDept.length });
});

const test = asyncWrapper(async (req, res) => {
  let test = await User.find({ role: "admin" });
  res.status(StatusCodes.OK).json({ test });
});

module.exports = {
  getAllTickets,
  getTicket,
  assignTicket,
  solveTicket,
  getMyTickts,
  createTicket,
  replyTicket,
  deleteTicket,
  editTicket,
  getAgentTickts,
  ticketDept,
  test,
};
