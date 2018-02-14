let express = require('express');
let router = express.Router();

router.get('/repo/:repoName', function(req, res, next) {
	res.json({
		data:[
			"test",
			"test1",
			"test2",
			"test3"
		],
		status: true
	});
});

router.get('/repos', function(req, res, next) {
	res.json({
		status: true, 
		data: [
			{"name": "test1"}, 
			{"name": "test2"}, 
			{"name": "test3"}, 
			{"name": "test4"}, 
			{"name": "test5"}, 
			{"name": "test6"}, 
			{"name": "test7"}, 
			{"name": "test8"}, 
			{"name": "test9"} 
		]
	});
});

router.get('/branches/:msrp', function(req, res, next) {
	res.json({
		status: true, 
		data: [
			{
				repo: "test1", 
				branches: [
					"test-100000-test branch"
				], 
				all: [
					"DEV", 
					"test-100000-test branch", 
					"test-100001-test branch2", 
					"test-100002-test branch3", 
					"MASTER9.10",
				]
			},
			{
				repo: "test2", 
				branches: [
					"test-100000-test branch"
				], 
				all: [
					"DEV", 
					"test-100000-test branch", 
					"test-100001-test branch2", 
					"test-100002-test branch3", 
					"MASTER9.10",
				]
			},
			{
				repo: "test3", 
				branches: [
					"test-100000-test branch"
				], 
				all: [
					"DEV", 
					"test-100000-test branch", 
					"test-100001-test branch2", 
					"test-100002-test branch3", 
					"MASTER9.10",
				]
			},
		]
	});
});

module.exports = router;
