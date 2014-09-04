/**
 * Created by gaozhu on 2014/8/19.
 */
RiveScript = require("rivescript");
var bot = new RiveScript();

bot.loadDirectory("brain", function loading_done (batch_num) {
    console.log("初始化语料库成功");
    bot.sortReplies();
}, function loading_error (batch_num, error) {
    console.log("Error when loading files: " + error);
});

express = require('express');
bodyParser = require('body-parser')
var app = express();

var request = require('request');
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname+"/public"));
app.use(express.static(__dirname+"/html"));
app.use(bodyParser.urlencoded({ extended: false })).use(bodyParser.json());

app.all('*', function(req,res,next){
//    console.info("我拦截到了");
    next();
});
app.get('/robot|*', function (req, res) {
    res.redirect('/robot/index.html');
});

var askXiaoI = function(msg,callback){
    console.info("去找小i学习");
    request('http://rmbz.net/Api/AiTalk.aspx?key=rmbznet&talk=xiaoi&word='+msg, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if((msg == '天气')||(msg == '今天天气')){
                msg = '常州天气';
            }
            var body=eval("("+body+")");
            body.content = body.content && body.content.replace("%username%", "小小民");
            callback && callback(body.content);
        }else{
            callback && callback("我太忙了，等等哦，亲！")
        }
    });
}
app.post('/robot/say', function (req, res) {
    bot.setUservar("test-user","nickname","游客");
    var reply = bot.reply("test-user", req.body.say);
    if (reply == "伦家还听不懂呢，可以教教我哦！") {
        askXiaoI(req.body.say,function(xiaoisay){
            res.jsonp({reply:xiaoisay});
        });
        return;
    }
    res.jsonp({reply:reply});
});

app.listen(3000);
console.log("Listening on port 3000");