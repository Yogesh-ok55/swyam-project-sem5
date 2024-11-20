var express = require('express');
const app = express();
let bodyParser = require('body-parser');
let expressSession = require('express-session');
let { ObjectId } = require('mongodb');
let db = require('./database.js');

app.use(expressSession({secret: "node_mongo123!@#", resave:true, saveUninitialized: true}));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req,res){
	let msg = "";
	if(req.session.msg != undefined && req.session.msg != ""){
		msg = req.session.msg;
	}
	res.render('home', {msg : msg});
});

app.get('/adduser', function(req, res){
	res.render("adduser_view");
})

app.post('/addUserSubmit',async function(req,res){
	const UserObj = db.collection('user');
	const UserCollection ={
        name : req.body.name,
        email:req.body.email,
        password: req.body.password,
        role:req.body.role,
        gender:req.body.gender,
        enrolled_courses: req.body.enrolled_courses
    };
        const result = await UserObj.insertOne(UserCollection);

        if (result.acknowledged === true) {
            req.session.msg = "User added successfully.";
            res.redirect("/");
        } else {
            req.session.msg = "Failed to add user.";
            res.redirect("/");
        }
})

app.get('/listUser', async function(req,res){
	
	const usersCollection = db.collection("user");
	const result = await usersCollection.find().toArray();
	res.render("userlist_view", {userData:result});
});

app.get("/deleteUser",async function(req,res){
	let user_id =req.query ['userId'];
	const usersCollection = db.collection("user");

	const result = await usersCollection.deleteOne({_id:new ObjectId(user_id)});
	
	if(result.deletedCount === 1){
		req.session.msg = "user deleted";
		res.redirect("/");
	}
	else{
		req.session.msg = "can not delete user";
		res.redirect("/");
	}
	
});

app.get("/editUser",async function(req,res){
	const usersCollection = db.collection("user");
	const userId = req.query['userId'];
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
	
	res.render("useredit_view", { user: user });
});
app.post("/EditUserSubmit", async function(req, res) {
    const usersCollection = db.collection("user");

  
    const userId = req.body.userId;
    const updatedUserData = {
        name : req.body.name,
        email:req.body.email,
        password: req.body.password,
        role:req.body.role,
        gender:req.body.gender,
        enrolled_courses: req.body.enrolled_courses
    };

    
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) }, 
            { $set: updatedUserData }
        );

        if (result.modifiedCount === 1) {
            req.session.msg = "User updated successfully";
            res.redirect("/listUser"); 
        } else {
            req.session.msg = "User update failed or no changes made";
            res.redirect("useredit_view/?userId=" + userId); 
        }

});




//category crud

app.get('/addcategory', function(req, res){
	res.render("addcategory_view");
})

app.post('/addCategorySubmit',async function(req,res){
	const CategoryObj = db.collection('category');
	const CategoryCollection ={
        name : req.body.name,
        description:req.body.description
    };
	
        const result = await CategoryObj.insertOne(CategoryCollection);

        if (result.acknowledged === true) {
            req.session.msg = "Category added successfully.";
            res.redirect("/");
        } else {
            req.session.msg = "Failed to add Category.";
            res.redirect("/");
        }
})


app.get('/listCategory', async function(req,res){
	
	const categoryCollection = db.collection("category");
	const result = await categoryCollection.find().toArray();
	res.render("categorylist_view", {categoryData:result});
});

app.get("/deleteCategory", async function(req, res) {
    let cat_id = req.query['catId'];
    const CategoryCollection = db.collection("category");

    const result = await CategoryCollection.deleteOne({_id: new ObjectId(cat_id)});

    if(result.deletedCount === 1) {
        req.session.msg = "Category deleted";
        res.redirect("/"); // Redirecting to the list of categories
    } else {
        req.session.msg = "Cannot delete category"; // Improved error message
        res.redirect("/");
    }
});


app.get("/editCategory", async function(req, res) {
    const CategoryCollection = db.collection("category");
    const catId = req.query['catId']; // Fixed the query parameter name
    const category = await CategoryCollection.findOne({ _id: new ObjectId(catId) });

    res.render("categoryedit_view", { category: category });
});

app.post("/EditCategorySubmit", async function(req, res) {
    const categoryCollection = db.collection("category");

    const catId = req.body.catId;
    const updatedCategoryData = {
        name: req.body.name,
        description: req.body.description
    };

    const result = await categoryCollection.updateOne(
        { _id: new ObjectId(catId) }, 
        { $set: updatedCategoryData }
    );

    if (result.modifiedCount === 1) {
        req.session.msg = "Category updated successfully";
        res.redirect("/listCategory"); 
    } else {
        req.session.msg = "Category update failed or no changes made"; // Fixed the error message
        res.redirect("/editCategory?catId=" + catId); // Fixed the redirect URL parameter
    }
});



//lesson CRUD :

app.get('/addLesson', function(req, res) {
    res.render('addlesson_view');  
});


    app.post('/addLessonSubmit', async function(req, res) {
        const lessonsCollection = db.collection('Lessons');

        const lessonData = {
            title: req.body.title,
            content: req.body.content,
            order: parseInt(req.body.order),
            quiz: {
                questions: [
                    {
                        question: req.body.question,
                        answer: req.body.answer
                    }
                ]
            }
        };

        const result = await lessonsCollection.insertOne(lessonData);

        if (result.acknowledged === true) {
            req.session.msg = "Lesson added successfully.";
            res.redirect("/listLesson");
        } else {
            req.session.msg = "Failed to add Lesson.";
            res.redirect("/addlesson_view");
        }
    });


    app.get('/listLesson', async function(req, res) {
        const lessonsCollection = db.collection("Lessons");
        const result = await lessonsCollection.find().toArray();
        res.render("lessonlist_view", { lessonData: result });
    });


    app.get("/deleteLesson", async function(req, res) {
        let lessonId = req.query['lessonId'];
        const lessonsCollection = db.collection("Lessons");

        const result = await lessonsCollection.deleteOne({ _id: new ObjectId(lessonId) });

        if (result.deletedCount === 1) {
            req.session.msg = "Lesson deleted successfully.";
            res.redirect("/listLesson");
        } else {
            req.session.msg = "Failed to delete lesson.";
            res.redirect("/listLesson");
        }
    });


    app.get("/editLesson", async function(req, res) {
        const lessonsCollection = db.collection("Lessons");
        const lessonId = req.query['lessonId'];
        const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });

        res.render("lessonedit_view", { lesson: lesson });
    });


    app.post("/editLessonSubmit", async function(req, res) {
        const lessonsCollection = db.collection("Lessons");

        const lessonId = req.body.lessonId;
        const updatedLessonData = {
            title: req.body.title,
            content: req.body.content,
            order: parseInt(req.body.order), 
            quiz: {
                questions: [
                    {
                        question: req.body.question, 
                        answer: req.body.answer
                    }
                ]
            }
        };

        const result = await lessonsCollection.updateOne(
            { _id: new ObjectId(lessonId) },
            { $set: updatedLessonData }
        );

        if (result.modifiedCount === 1) {
            req.session.msg = "Lesson updated successfully.";
            res.redirect("/listLesson");
        } else {
            req.session.msg = "Failed to update lesson or no changes made.";
            res.redirect("/editLesson?lessonId=" + lessonId);
        }
    });


// Notification CRUD :

app.get('/listNotification', async function(req, res) {
    const notificationsCollection = db.collection('Notifications');
    const result = await notificationsCollection.find().toArray();
    res.render('notificationlist_view', { notificationsData: result });
});

// Display a form to add a new notification
app.get('/addNotification', function(req, res) {
    res.render('addnotification_view');
});

// Handle form submission to add a new notification
app.post('/addNotificationSubmit', async function(req, res) {
    const notificationsCollection = db.collection('Notifications');

    const notificationData = {
        name: req.body.name,
        message: req.body.message,
        date: req.body.date,
        status: req.body.status
    };

    const result = await notificationsCollection.insertOne(notificationData);

    if (result.acknowledged === true) {
        req.session.msg = 'Notification added successfully.';
        res.redirect('/listNotifications');
    } else {
        req.session.msg = 'Failed to add Notification.';
        res.redirect('/addNotification');
    }
});

// Display a form to edit an existing notification
app.get('/editNotification', async function(req, res) {
    const notificationsCollection = db.collection('Notifications');
    const notificationId = req.query['notificationId'];
    const notification = await notificationsCollection.findOne({ _id: new ObjectId(notificationId) });

    res.render('notificationedit_view', { notification: notification });
});

// Handle form submission to update an existing notification
app.post('/editNotificationSubmit', async function(req, res) {
    const notificationsCollection = db.collection('Notifications');

    const notificationId = req.body.notificationId;
    const updatedNotificationData = {
        name: req.body.name,
        message: req.body.message,
        date: req.body.date,
        status: req.body.status
    };

    const result = await notificationsCollection.updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: updatedNotificationData }
    );

    if (result.modifiedCount === 1) {
        req.session.msg = 'Notification updated successfully.';
        res.redirect('/listNotifications');
    } else {
        req.session.msg = 'Failed to update notification or no changes made.';
        res.redirect('/editNotification?notificationId=' + notificationId);
    }
});

// Delete a notification
app.get('/deleteNotification', async function(req, res) {
    let notificationId = req.query['notificationId'];
    const notificationsCollection = db.collection('Notifications');

    const result = await notificationsCollection.deleteOne({ _id: new ObjectId(notificationId) });

    if (result.deletedCount === 1) {
        req.session.msg = 'Notification deleted successfully.';
        res.redirect('/listNotifications');
    } else {
        req.session.msg = 'Failed to delete notification.';
        res.redirect('/listNotifications');
    }
});


// Course CRUD :

app.get('/listCourse', async function(req, res) {
    const coursesCollection = db.collection('Courses');
    const result = await coursesCollection.find().toArray();
    res.render('courselist_view', { coursesData: result });
});

// Display a form to add a new course
app.get('/addCourse', function(req, res) {
    res.render('addcourse_view');
});

// Handle form submission to add a new course
app.post('/addCourseSubmit', async function(req, res) {
    const coursesCollection = db.collection('Courses');

    const courseData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category
    };

    const result = await coursesCollection.insertOne(courseData);

    if (result.acknowledged === true) {
        req.session.msg = 'Course added successfully.';
        res.redirect('/listCourse');
    } else {
        req.session.msg = 'Failed to add Course.';
        res.redirect('/addCourse');
    }
});

// Display a form to edit an existing course
app.get('/editCourse', async function(req, res) {
    const coursesCollection = db.collection('Courses');
    const courseId = req.query['courseId'];
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });

    res.render('courseedit_view', { course: course });
});

// Handle form submission to update an existing course
app.post('/editCourseSubmit', async function(req, res) {
    const coursesCollection = db.collection('Courses');

    const courseId = req.body.courseId;
    const updatedCourseData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category
    };

    const result = await coursesCollection.updateOne(
        { _id: new ObjectId(courseId) },
        { $set: updatedCourseData }
    );

    if (result.modifiedCount === 1) {
        req.session.msg = 'Course updated successfully.';
        res.redirect('/listCourse');
    } else {
        req.session.msg = 'Failed to update course or no changes made.';
        res.redirect('/editCourse?courseId=' + courseId);
    }
});

// Delete a course
app.get('/deleteCourse', async function(req, res) {
    let courseId = req.query['courseId'];
    const coursesCollection = db.collection('Courses');

    const result = await coursesCollection.deleteOne({ _id: new ObjectId(courseId) });

    if (result.deletedCount === 1) {
        req.session.msg = 'Course deleted successfully.';
        res.redirect('/listCourse');
    } else {
        req.session.msg = 'Failed to delete course.';
        res.redirect('/listCourse');
    }
});

app.listen(8080, () => console.log("CRUD Server running at http://localhost:8080/"));