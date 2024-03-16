const express = require('express');
const jwt = require('jsonwebtoken');
const dbStart = require("./dbstart");
const config = require('./env-variables');
const app = express();
const bodyParser = require('body-parser');
const PORT = config.port;
const SECRET_KEY = config.jwtSecret;
app.use(bodyParser.json());


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user.userId;
        next();
    });
}

function authenticateAdminUser(req, res, next) {
    return new Promise(function (resolve, reject) {
        try {
            console.log("control here");
            global.databaseConnection.models.users.findOne({
                where: { id: req.user, isAdmin: true }
            })
                .then(function (result) {
                    if (result) {
                        resolve();
                        next();
                    }
                    else {
                        reject()
                        return res.sendStatus(401)
                    }
                });
        } catch (error) {
            reject()
            return res.sendStatus(401)
        }
    });
}



/*Routes Start*/

app.post('/jobs', authenticateToken, authenticateAdminUser, async (req, res) => {
    try {
        await validateIncomingJob(req.body);
        const Job = await createJobInDb(req.body);
        if (Job) {
            res.status(200).json({ message: `${Job.title} created successfuly` });
        }
        //else
    } catch (error) {
        console.error("Error creating Job:", error); // Log any errors
        res.status(500).json({ error: error.message });
    }
});

app.put('/archive/:jobId', authenticateToken, authenticateAdminUser, async (req, res) => {
    try {
        const Job = await archiveJob(req.params.jobId);
        if (Job) {
            res.status(200).json({ message: `${Job.title} archived successfuly` });
        }
        //else
    } catch (error) {
        console.error("Error archived Job:", error); // Log any errors
        res.status(500).json({ error: error.message });
    }
});

//get all jobs
app.get('/jobs', authenticateToken, async (req, res) => {
    try {
        const jobs = await getAllJobs(req.user, req.query);
        if (jobs?.length) {
            console.log("jobs fetched");
            res.status(200).json({ jobs });
        } else {
            console.log("No jobs Found");
            res.status(400).json({ error: "No jobs Found" });
        }
    } catch (error) {
        console.error("Error fetching jobs:", error); // Log any errors
        res.status(500).json({ error: error.message });
    }
});

app.post('/register', async (req, res) => {
    try {
        await validateUserCredentials(req.body);
        const user = await createUser(req.body);
        if (user) {
            console.log("User created:", user); // Log the created user
            // res.json({ token });
            const token = jwt.sign({ userId: user.id }, SECRET_KEY);

            res.status(200).json({ token, message: `user with phone ${user.phoneNumber} created successfully` });
        } else {
            console.log("User not created"); // Log if user creation failed
            res.status(400).json({ error: "user not created" });
        }
    } catch (error) {
        console.error("Error registering user:", error); // Log any errors
        res.status(500).json({ error: error.message });
    }
})

app.post('/signin', async (req, res) => {
    try {
        await validateSignIn(req.body);
        let user = await getUser(req.body)
        if (user) {
            const token = jwt.sign({ userId: user.id }, SECRET_KEY);
            res.status(200).json({ token, message: `user with phone ${user.emailId} logged in successfully` });

        } else {
            console.log("User not created"); // Log if user creation failed
            res.status(400).json({ error: "user not created" });
        }
    } catch (error) {
        console.error("Error registering user:", error); // Log any errors
        res.status(500).json({ error: error.message });
    }
})

app.post('/apply/:jobId', authenticateToken, async (req, res) => {
    try {
        let appliation = await createJobApplication(req.params.jobId, req.user)
        if (appliation) {
            res.status(200).json({ appliation, message: `Job Applied Successfuly` });
        } else {
            console.log("appliation not created"); // Log if user creation failed
            res.status(400).json({ error: "appliation not created" });
        }
    } catch (error) {
        console.error("Error registering appliation:", error); // Log any errors
        res.status(500).json({ error: error.message });
    }
})


function createJobInDb({ title, description, contactPhoneNumber, contactEmail, location, dueDate }) {
    return new Promise(function (resolve, reject) {
        dueDate = new Date(dueDate);
        global.databaseConnection.models.jobs.create({
            title, description, contactPhoneNumber, contactEmail, location, dueDate, isActive: true
        }).then(function (result) {
            if (result) {
                let job = result.dataValues;
                resolve(job);
                return;
            }
            else {
                reject();
                return;
            }
        }).catch(function (err) {
            reject(err);
            return;
        })
    })
}


function archiveJob(jobId) {
    return new Promise(function (resolve, reject) {
        global.databaseConnection.models.jobs.update({ isActive: false }, { where: { id: jobId } }).then(function (result) {
            if (result) {
                let job = result.dataValues;
                resolve(job);
                return;
            }
            else {
                reject();
                return;
            }
        }).catch(function (err) {
            reject(err);
            return;
        })
    })
}


function createJobApplication(jobId, userId) {
    return new Promise(function (resolve, reject) {
        global.databaseConnection.models.applications.create({
            jobId, userId
        }).then(function (result) {
            if (result) {
                let application = result.dataValues;
                resolve(application);
                return;
            }
            else {
                reject();
                return;
            }
        }).catch(function (err) {
            reject(err);
            return;
        })
    })
}

function getUser({ emailId, password }) {
    return new Promise(function (resolve, reject) {
        let whereCondition = {
            emailId,
            password
        }
        global.databaseConnection.models.users.findOne({ where: whereCondition }).then(function (result) {
            if (result) {
                let user = result;
                resolve(user);
                return;
            }
            else {
                reject();
                return;
            }
        }).catch(function (err) {
            reject(err);
            return;
        })
    })
}


function getAllJobs(currentUser, params) {
    return new Promise(function (resolve, reject) {
        //   let whereCondition ={
        //     userId: currentUser
        //   }
        //if current user isAdmin== show all jobs 
        global.databaseConnection.models.jobs.findAll().then(function (result) {
            if (result) {
                let jobs = result;
                resolve(jobs);
                return;
            }
            else {
                reject();
                return;
            }
        }).catch(function (err) {
            reject(err);
            return;
        })
    })
}

function createUser({ phoneNumber, emailId, isAdmin, password }) {
    return new Promise(function (resolve, reject) {
        global.databaseConnection.models.users.create({
            phoneNumber, emailId, isAdmin, password
        }).then(function (result) {
            if (result) {
                let user = result.dataValues;
                resolve(user);
                return;
            }
            else {
                reject();
                return;
            }
        }).catch(function (err) {
            reject(err);
            return;
        })
    })
}
function validateUserCredentials(body) {
    return new Promise(function (resolve, reject) {
        try {
            if (!body?.phoneNumber) {
                throw new Error("Please enter phoneNumber")
            }
            if (!body?.emailId) {
                throw new Error("Please enter emailId")
            }
            if (!body?.password) {
                throw new Error("Please enter password")
            }
            if (body?.isAdmin == undefined) {
                throw new Error("Please specify isAdmin")
            }
            resolve(body);
            return;
        } catch (error) {
            reject(error);
            return;
        }
    })
}

function validateApplication(body) {
    return new Promise(function (resolve, reject) {
        try {
            if (!body?.jobId) {
                throw new Error("Please enter jobId")
            }
            if (!body?.userId) {
                throw new Error("Please specify userId")
            }
            resolve(body);
            return;
        } catch (error) {
            reject(error);
            return;
        }
    })
}
function validateSignIn(body) {
    return new Promise(function (resolve, reject) {
        try {
            if (!body?.emailId) {
                throw new Error("Please enter emailId")
            }
            if (!body?.password) {
                throw new Error("Please specify password")
            }
            resolve(body);
            return;
        } catch (error) {
            reject(error);
            return;
        }
    })
}

function validateIncomingJob(body) {
    return new Promise(function (resolve, reject) {
        try {
            if (!body?.title) {
                throw new Error("Please enter title")
            }
            if (!body?.description) {
                throw new Error("Please enter description")
            }
            if (!body?.contactEmail) {
                throw new Error("Please enter contactEmail")
            }
            if (!body?.contactPhoneNumber) {
                throw new Error("Please enter contactPhoneNumber")
            }
            if (!body?.location) {
                throw new Error("Please enter location")
            }
            if (!body?.dueDate) {
                throw new Error("Please enter dueDate")
            }
            resolve(body);
            return;
        } catch (error) {
            reject(error);
            return;
        }
    })
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});