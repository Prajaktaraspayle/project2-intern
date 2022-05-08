const mongoose = require("mongoose")
const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  //if (!value) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (requestbody) {
  return Object.keys(requestbody).length > 0;
};



const createColleges = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({
          status: false,
          msg: "Invalid request parameters. Please provide College Details",
        });
      return
    }
    //Extract Params
    const { name, fullName, logoLink, isDeleted } = requestBody;

    //Validation Starts
    if (!isValid(name)) {
      res.status(400).send({ status: false, msg: "College name is required" });
      return;
    }
    if (!isValid(fullName)) {
      res
        .status(400)
        .send({ status: false, msg: "College Fullname is required" });
      return;
    }
    if (!isValid(logoLink)) {
      res
        .status(400)
        .send({ status: false, msg: "College Logo link is required" });
      return;
    }
    if(!(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(logoLink))){

    res.status(400).send({ status: false, message: 'Please provide valid URL'})
    return;
  }
    if (isDeleted == true) {
      res
        .status(400)
        .send({ status: false, msg: "Cannot input isDeleted as true while registering" });
      return;
    }
    //Validation Ends
    const isNameAlreadyUsed = await collegeModel.findOne({ name });
    if (isNameAlreadyUsed) {
      res
        .status(400)
        .send({
          status: false,
          message: `${name} Collegename is already registered`,
        });
      return;
    }
    const isfullNameAlreadyUsed = await collegeModel.findOne({ fullName });
    if (isfullNameAlreadyUsed) {
      res
        .status(400)
        .send({
          status: false,
          message: `College full name is already registered`,
        });
      return;
    }
    const newCollege = await collegeModel.create(requestBody);
    res
      .status(201)
      .send({
        status: true,
        msg: "New College created successfully",
        data: newCollege,
      });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const collegeDetails = async function (req, res) {
  try {
    const collegeName = req.query.name

    if (!collegeName) {
      return res.status(404).send({ status: false, msg: "valid query is mandatory" })
    }

    const college = await collegeModel.findOne({ name: collegeName });
    if (!college) {
      return res.status(404).send({ status: false, msg: "no such college present" })
    }
    const interData = await internModel.find({ collegeId: college._id });
    if (!interData) {
      return res.status(404).send({ status: false, msg: "no such intern" })
    }

    const interns = interData.map(intern => {
      return {
        _id: intern._id,
        name: intern.name,
        email: intern.email,
        mobile: intern.mobile
      }
    });



    const data = {
      collegename: college.name,
      fullName: college.fullName,
      logoLink: college.logoLink,
      interns: interns
    };

    res.status(200).send({
      status: true,
      data: data,
    });

  } catch (error) {
    res.status(500).send({ status: false, message: error.message });

  }

};


module.exports.createColleges = createColleges
module.exports.colleageDetails = collegeDetails