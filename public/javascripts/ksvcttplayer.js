/**
 * Created by lixiaopeng on 16/6/3.
 */

    var myVideo = document.getElementById("share_video");

    //接口
    var getTokenUrl = "http://183.131.21.162:8000/v1.0/account/visitorcreatetoken";
    var getUserInfo = "http://183.131.21.162:8000/v1.0/room/enterroombyh5";

    //XMLHttpRequest object
    var xmlrequest;

    //data first from app
    var businessId;
    var roomId;
    var anchorOpenId;

    //data second from app
    var visitorOpenId;
    var clientType;


    // 接受数据
    var responseTokenData;
    var responseUserData;
    var token;

    //用户具体信息
    var headPicUrl;
    var name;
    var roomNumber;
    var posterUrl;
    var pullStreamUrl;
    var appDownLoadUrl;
    var liveType;


    //get url
    var url = window.location.href;
    console.log('url =' + url);

    businessId = getUrl(url, 'BusinessId');
    roomId = getUrl(url, 'RoomId');
    anchorOpenId = getUrl(url, 'AnchorOpenId');
    clientType = getUrl(url, 'ClientType');

    businessId = Number(businessId);
    roomId = Number(roomId);
    anchorOpenId = Number(anchorOpenId);
    clientType = Number(clientType);

    console.log('businessId >>>>>>' + businessId);
    console.log('roomId >>>>>>' + roomId);
    console.log('anchorOpenId >>>>>>' + anchorOpenId);
    console.log('clientType >>>>>>' + clientType);


    //需要添加播放按钮
    document.getElementById("pause_button").onclick = function() {ksvcPause()};
    document.getElementById("anchor").onclick = function() {ksvcAnchor()};
    document.getElementById("download").onclick = function() {ksvcDownload()};

    document.getElementById("pop_close").onclick = function() {ksvcClose()};
    document.getElementById("pop_down").onclick = function() {ksvcDown()};


    postGetToken(getTokenUrl);

    function ksvcPause()
    {
        console.log('lixp ksvcPause .......');

        //原生video
        myVideo.play();

        document.getElementById("pause_button").style.display = "none";

    }

    function getUrl(str, name) {
        var arr, reg = new RegExp('(^|)' + name + '=([^&\\s]*)(|$)');
        // window.console.log(reg, str.match(reg));
        console.log('reg =' + reg + "<<>>str.match(reg)=" + str.match(reg));
        if (arr = str.match(reg)) {
            return decodeURI(arr[2]);
        } else {
            return '';
        }
    }


    function ksvcAnchor()
    {
        console.log('lixp ksvcAnchor ......');

        document.getElementById("pops").style.display = "block";

    }


    function ksvcDownload()
    {
        console.log('lixp ksvcDownload ......');
        window.open(appDownLoadUrl);

    }

    function ksvcClose()
    {
        document.getElementById("pops").style.display = "none";

    }

    function ksvcDown()
    {
        console.log('lixp down ..........');
        window.open(appDownLoadUrl);

    }


    //first: 发送请求，获取token和userId，数据从app传来  url, data
    function postGetToken(url) {

        var sendData = {
            //"BusinessId" : 1000,
            //"RoomId": 50,
            //"AnchorOpenId": 9

            "BusinessId" : businessId,
            "RoomId": roomId,
            "AnchorOpenId": anchorOpenId
        };

        console.log(sendData);

        createXMLHttpRequest();

        xmlrequest.open("POST", url);
        xmlrequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xmlrequest.send(JSON.stringify(sendData));
        xmlrequest.onreadystatechange = function() {

            console.log('xmlrequest.readyState =' + xmlrequest.readyState + "－－－－－xmlrequest.status ＝" + xmlrequest.status);
            if ((xmlrequest.readyState == 4) && (xmlrequest.status == 200)) {

                responseTokenData = xmlrequest.responseText;
                console.log('responseTokenData 1111 =' + responseTokenData);

                var responseData = JSON.parse(responseTokenData).RspJson;
                var responseRspData = JSON.parse(responseData);
                console.log('responseData=' + responseData);

                visitorOpenId = responseRspData.VisitorOpenId;
                token = responseRspData.Token;

                console.log('visitorOpenId =' + visitorOpenId);
                console.log('post first success .. ');


                initRongIMClient(token);
                postGetUserInfo(getUserInfo);

            } else {

                console.log('post first fail .. ');
            }
        }
    }


    function createXMLHttpRequest() {
        if(window.XMLHttpRequest)
        {
            //DOM 2浏览器
            xmlrequest = new XMLHttpRequest();
        }
        else if (window.ActiveXObject)
        {
            // IE浏览器
            try
            {
                xmlrequest = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e)
            {
                try
                {
                    xmlrequest = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (e)
                {
                }
            }
        }
    }


    // second: init rongyun and connection
    function initRongIMClient(rong_token) {

        RongIMClient.init("lmxuhwagxqugd");

        // 设置连接监听状态 （ status 标识当前连接状态）
        // 连接状态监听器
        RongIMClient.setConnectionStatusListener({
            onChanged: function (status) {
                switch (status) {
                    //链接成功
                    case RongIMLib.ConnectionStatus.CONNECTED:
                        console.log('链接成功');
                        break;
                    //正在链接
                    case RongIMLib.ConnectionStatus.CONNECTING:
                        console.log('正在链接');
                        break;
                    //重新链接
                    case RongIMLib.ConnectionStatus.DISCONNECTED:
                        console.log('断开连接');
                        break;
                    //其他设备登陆
                    case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                        console.log('其他设备登陆');
                        break;
                    //网络不可用
                    case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                        console.log('网络不可用');
                        break;
                }
            }});

        // 消息监听器
        RongIMClient.setOnReceiveMessageListener({
            // 接收到的消息
            onReceived: function (message) {
                // 判断消息类型
                switch(message.messageType){
                    case RongIMClient.MessageType.TextMessage:
                        // 发送的消息内容将会被打印
                        console.log(message.content.content);
                        break;
                    case RongIMClient.MessageType.VoiceMessage:
                        // 对声音进行预加载
                        // message.content.content 格式为 AMR 格式的 base64 码
                        RongIMLib.RongIMVoice.preLoaded(message.content.content);
                        break;
                    case RongIMClient.MessageType.ImageMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.DiscussionNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.LocationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.RichContentMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.DiscussionNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.InformationNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ContactNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ProfileNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.CommandNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.CommandMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.UnknownMessage:
                        // do something...
                        break;
                    default:
                    // 自定义消息
                    // do something...
                }
            }
        });


        //通过token建立连接
        var token = rong_token;
        console.log('token =' + token);

        // 连接融云服务器。
        RongIMClient.connect(token, {
            onSuccess: function(userId) {
                console.log("Login successfully." + userId);
            },
            onTokenIncorrect: function() {
                console.log('token无效');
            },
            onError:function(errorCode){
                var info = '';
                switch (errorCode) {
                    case RongIMLib.ErrorCode.TIMEOUT:
                        info = '超时';
                        break;
                    case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                        info = '未知错误';
                        break;
                    case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                        info = '不可接受的协议版本';
                        break;
                    case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                        info = 'appkey不正确';
                        break;
                    case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                        info = '服务器不可用';
                        break;
                }
                console.log(errorCode);
            }
        });
    }


    //third: send request to get data
    function postGetUserInfo(url) {

        var sendData = {
            //"BusinessId" : 1000,
            //"RoomId": 50,
            //"VisitorOpenId": 9,
            //"ClientType":1

            "BusinessId" : businessId,
            "RoomId": roomId,
            "VisitorOpenId": visitorOpenId,
            "ClientType":clientType
        };

        console.log(sendData);

        createXMLHttpRequest();

        xmlrequest.open("POST", url);
        xmlrequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xmlrequest.send(JSON.stringify(sendData));
        xmlrequest.onreadystatechange = function() {

            console.log('xmlrequest.readyState =' + xmlrequest.readyState + "－－－－－xmlrequest.status ＝" + xmlrequest.status);
            if ((xmlrequest.readyState == 4) && (xmlrequest.status == 200)) {

                responseUserData = xmlrequest.responseText;
                console.log('responseUserData=' + responseUserData);
                var rspData = JSON.parse(responseUserData).RspJson;
                console.log(rspUserData);
                var rspUserData = JSON.parse(rspData);
                console.log(rspUserData);

                anchorOpenId = rspUserData.AnchorOpenId;
                headPicUrl = rspUserData.Url;
                name = rspUserData.Name;
                roomNumber = rspUserData.RoomNumber;
                posterUrl = rspUserData.Poster;
                pullStreamUrl = rspUserData.PullStreamUrl;
                appDownLoadUrl = rspUserData.AppDownLoadUrl;
                liveType = rspUserData.LiveType;

                document.getElementById("share_video").poster = posterUrl;
                document.getElementById("share_video").src = "http://test.live.ks-cdn.com/live/1000_50/index.m3u8";
                document.getElementById("anchor").src = headPicUrl;
                document.getElementById("anchor_name").innerHTML = name;
                document.getElementById("fans_number").innerHTML = roomNumber;

                console.log(document.getElementById("share_video").src);
                //console.log('anchorOpenId=' + anchorOpenId);
                //console.log('headPicUrl =' + headPicUrl);
                //console.log('name =' + name);
                //console.log('posterUrl =' + posterUrl);
                //console.log('pullStreamUrl =' + pullStreamUrl);
                //console.log('appDownLoadUrl =' + appDownLoadUrl);
                //console.log('liveType =' + liveType);


                console.log('post second success .. ');

            } else {

                console.log('post second fail .. ');
            }
        }
    }






