# LoadBalancerReply
A SPA for generic application monitoring powered by React and Redux


Example for Api response:

{
    "rows":[
        {
            "start":"2016-02-01T09:15:29.3050805+01:00",
            "end":"2016-02-01T11:00:30.7562673+01:00",
            "results":{
                "loadBalancerReply.Web.PageAxdRequester":{
                    "flag":true,
                    "modalDialogContent":"11:00:30 > 0.8 secs<br/>10:59:30 > 0.3 secs<br/>10:58:30 > 0.2 secs<br/>10:57:31 > 1.7 secs<br/>10:56:32 > 2.2 secs<br/>10:55:31 > 1.5 secs<br/>10:54:30 > 0.2 secs<br/>"
                },
                "loadBalancerReply.Web.NullRefExceptionSeek":{
                    "flag":true,
                    "modalDialogContent":"11:00:30<br/>10:59:30<br/>10:58:30<br/>10:57:31<br/>10:56:32<br/>10:55:31<br/>10:54:30<br/>"
                }
            },
            "isOk":true
        },
        {
            "start":"2016-02-01T09:14:48.4325565+01:00",
            "end":"2016-02-01T09:14:48.4325565+01:00",
            "results":{
                "loadBalancerReply.Web.PageAxdRequester":{
                    "flag":false,
                    "modalDialogContent":"09:14:48 > WebException during request #1 to page.axd => System.Net.WebException: The operation has timed out   at System.Net.HttpWebRequest.GetResponse()   at LoadBalancerReply.Web.PageAxdRequester.Process()<br/>"
                },
                "loadBalancerReply.Web.NullRefExceptionSeek":{
                    "flag":null,
                    "modalDialogContent":""
                }
            },
            "isOk":false
        },
        {
            "start":"2016-02-01T09:13:28.3723301+01:00",
            "end":"2016-02-01T09:13:28.3879303+01:00",
            "results":{
                "loadBalancerReply.Web.PageAxdRequester":{
                    "flag":true,
                    "modalDialogContent":"09:13:28 > 0.0 secs<br/>"
                },
                "loadBalancerReply.Web.NullRefExceptionSeek":{
                    "flag":false,
                    "modalDialogContent":"09:13:28 > 16 Nullref(s)<br/>"
                }
            },
            "isOk":false
        }
    ],
    "isAlerting":false
}
