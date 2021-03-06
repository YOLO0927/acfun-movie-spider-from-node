/**
 * Created by Administrator on 2016/12/12 0012.
 */
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var cheerio = require('cheerio');
var request = require('request');

//初始页码
var page = 1;
//初始url
var url = 'http://www.acfun.tv/list/getlist?channelId=96&sort=0&pageSize=20&pageNo='+page;

//封装一层函数
function fetchPage(x){
    startRequest(x);
}

function startRequest(x){
    //利用http模块向服务器发起一次get请求
    http.get(x,function(res){
        var html = '';  //用于存储请求网页的整个html内容
        res.setEncoding('utf-8');
        //监听data事件，每次取一块数据
        res.on('data',function(chunk){
            html += chunk;
        });

        //监听end事件,如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end',function(){
            var resData = JSON.parse(html).data.data;
            // var $ = cheerio.load(html);
            // var movie_items = {
            //     page : page +=1
            // };
            //打印页码
            // console.log(movie_items);
            console.log('正在爬取第'+page+'页');
            saveContent(resData,page);
            saveImg(resData,page);
            page++;
            //下一篇的url
            var nextLink = 'http://www.acfun.tv/list/getlist?channelId=96&sort=0&pageSize=20&pageNo='+page;
            if(page<=10){
                fetchPage(nextLink);
            }
        });
    }).on('error',function(err){
        console.log(err);
    });
}

function saveContent(resData,page){
    var str = '';
    // $('.column-left a.third-title').each(function(index,value){
    //     str += $(this).text().trim()+'\n'+'链接:http://www.acfun.tv'+$(this).attr('href')+'\n'+'up主:'+$(this).parent().next().find('p.up-name').text()+' 上传时间:'+$(this).parent().next().find('.video-num .video-time').text()+' 被观看次数:'+$(this).parent().next().find('.video-num .icon-view-player').text()+'\n\n';
    // });
    for(var i=0;i<resData.length;i++){
        str += resData[i].title +'\r\n'+'链接:http://www.acfun.tv'+resData[i].link+'\r\n'+'up主:'+resData[i].username+' 上传时间:'+resData[i].contributeTimeFormat+' 被观看次数:'+resData[i].viewCount+'\r\n\r\n'
    }
    //存储文本内容
    fs.appendFile('./data/第'+page+'页电影列表.txt',str,'utf-8',function(err){
        if(err){
            console.log(err);
        }
    });
}

function saveImg(resData,page){
    // $('.column-left a.fl.img-wp img').each(function(index,value){
    //     var img_title = $(this).parent().next('.text-over').text();
    //     var img_filename = img_title+'jpg';
    //     var img_src = $(this).attr('src');
    //
    //     //用request请求图片
    //     request.head(img_src,function(err,res,body){
    //         if(err){
    //             console.log(err);
    //         }
    //     });
    //     //request流
    //     request(img_src).pipe(fs.createWriteStream('./image/'+img_filename));
    // })

    for(var i=0;i<resData.length;i++){
        var img_title = page+'-'+(i+1);
        var img_type = resData[i].coverImage;
        img_type = img_type.slice(img_type.lastIndexOf('.'));
        var img_src = resData[i].coverImage;
        console.log(img_src);
        //用request请求图片
        request.head(img_src,function(err,res,body){
            if(err){
                console.log(err)
            }
        });
        //request流
        console.log(img_title+img_type);
        request(img_src).pipe(fs.createWriteStream('./image/'+img_title+img_type)).on('error',function(err){
            if(err){
                console.log(err);
            }
        });
        console.log(img_title+'Done');
    }
}

fetchPage(url);