let express=require("express");
let router=express.Router();
let Interview=require("../models/Interview");
router.post("/interview", async (req, res) => {
    
        let { userId, role, experience, difficulty, interviewType, numberOfQuestions, questions } = req.body;

        try{
            if(!experienct || !role || !difficulty || !interviewType || !numberOfQuestions || !questions){
                return res.status(400).json({ message: "All fields are required" });
            }

            await Interview.create({
                experience,role,numberOfQuestions,questions
            })
            return res.send("done")
        }catch(err){
            return res.status(500).json({ message: "Error creating interview" });
        }
    })