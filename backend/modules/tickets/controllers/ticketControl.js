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
const createTicket = async(req, res, next) => {
    try {
        let filesArray = [];
        req.files.forEach((element) => {
            const file = {
                fileName: element.originalname,
                filePath: element.path,
                fileType: element.mimetype,
                fileSize: fileSizeFormatter(element.size, 2),
            };
            filesArray.push(file);
        });
        console.log(filesArray);

        const oneDay = 1000 * 60 * 60 * 24 * 1; // millisec * min * huor * day * how many days
        const priortyUpdation = new Date(Date.now() + oneDay);

    const ticket = await Ticket.create({
      title: req.body.title,
      description: req.body.description,
      department: req.body.department,
      attachment: filesArray,
      ticketUpdatedTime: priortyUpdation,
      user: req.user.userId
    });
    res.status(StatusCodes.CREATED).json(ticket);
    //sendTicketConfirmation(User.name, User.email, req.body._id);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error.message);
  }
};

const updateTicket = async(req, res) => {
    const allowedUpdates = ["title", "description"];
    const keys = Object.keys(req.body);
    const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
    if (!isUpdationValid)
        res
        .status(StatusCodes.BAD_REQUEST)
        .json(`You can only update ${allowedUpdates}`);

    try {
        const { id: ticketID } = req.params;
        const ticket = await Ticket.findOneAndUpdate({
                _id: ticketID,
            },
            req.body, {
                new: true,
                runValidators: true,
                maxTimeMS: 2
            }
        );
        if (!ticket)
            return res
                .status(StatusCodes.NOT_FOUND)
                .json(`No ticket with id : ${ticketID}`);

        res.status(StatusCodes.OK).json(ticket);
        //sendTicketUpdation(Agent.name, Agent.email, req.body._id);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(error);
    }
};

const assignTicket = async(req, res) => {
    const allowedUpdates = ["priorty", "status"];
    const keys = Object.keys(req.body);
    const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
    if (!isUpdationValid)
        res
        .status(StatusCodes.BAD_REQUEST)
        .json(`You can only assign ${allowedUpdates}`);
    try {
        const { id: ticketID } = req.params;
        const ticket = await Ticket.findOneAndUpdate({
                _id: ticketID,
            },
            req.body, {
                new: true,
                runValidators: true
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

const solveTicket = async(req, res) => {
    const allowedUpdates = ["reply"];
    const keys = Object.keys(req.body);
    const isUpdationValid = keys.every((key) => allowedUpdates.includes(key));
    if (!isUpdationValid)
        res.status(StatusCodes.BAD_REQUEST).json("You can only reply");
    try {
        const { id: ticketID } = req.params;
        const ticket = await Ticket.findOneAndUpdate({
                _id: ticketID,
            },
            req.body, {
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

const deleteTicket = asyncWrapper(async(req, res) => {
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
  const {
    user: { userId },
    params: { id: ticketID },
  } = req
  const ticket = await Ticket.findOne({
    _id: ticketID,
    custID: userId,
  })
  if (!ticket) {
    throw new NotFoundError(`No Ticket with id ${ticketID}`)
  }
  res.status(StatusCodes.OK).json({ ticket })
});

const getAllTickets = asyncWrapper(async(req, res) => {
    const tickets = await Ticket.find()
        .sort({ createdAt: "desc" })
        .limit(10)
        .exec();
    res.status(StatusCodes.OK).json({ tickets });
});

// Func that find tickets that been created by a user
const getMyTickts = asyncWrapper(async(req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("Ticket");
    res.status(StatusCodes.OK).json({ user });
});

// const updateData = () => {
//   try {
//     const {priorty} = req.
//     const tickets = await Ticket.find({})
//     if(!tickets = )
//   } catch (error) {

//   }
// };

module.exports = {
    getAllTickets,
    getTicket,
    assignTicket,
    solveTicket,
    getMyTickts,
    createTicket,
    updateTicket,
    deleteTicket,
    //test,
};