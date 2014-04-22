var rankforce = {};

Mixjs.module("Base", rankforce, {
    TWITTER_URL: "Twitter:@rankforce"
});

Mixjs.module("API", rankforce, {
    include: Http,

    getData: function(url, callback) {
        var self = this;
        self.xhr({
            url: url,
            args: {type: "get", dataType: "json"},
            success: function(response) {
                callback(response);
            }
        });
    },
});

Mixjs.module("Data", rankforce, {
    include: rankforce.API,

    getThreadData: function(id, callback) {
        this.getData("/rest/" + id, callback);
    },
    getRecentThreadData: function(num, callback) {
        this.getData("/rest/recent/" + num, callback);
    },
    getRankingData: function(num, callback) {
        this.getData("/rest/ranking/today/" + num, callback);
    }
});

Mixjs.module("UI", rankforce, {
    followButton: function() {
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
    },
    isSmartDevice: function() {
        return /(?:ip(?:[ao]d|hone)|android)/.test(window.navigator.userAgent.toLowerCase());
    }
});

function initPage(threadId) {
    var module = rankforce.Base.mix(rankforce.Data, rankforce.UI);
    var st = sidetap();
    var elem_map = {
        thread_info  : $("#thread_info"),
        ranking_info : $("#ranking_info"),
        detail_info  : $("#detail_info"),
        twitter_info : $("#twitter_info")
    };
    var about = $("#about");

    module.followButton();

    module.getThreadData(threadId, function(response) {
        $('#thread_title').html("<a href='" + response.url + "'>" + response.title + "</a>");
        $("#ikioi").append("<span class='sub-header-color'>" + response.ikioi.average + "</span>");

        var twitter_res = $("#twitter_res");
        twitter_res.find(".retweet").append("<span class='sub-header-color'>" + response.tweet.retweet + "</span>");
        twitter_res.find(".favorite").append("<span class='sub-header-color'>" + response.tweet.favorite + "</span>");
        twitter_res.find(".reply").append("<span class='sub-header-color'>" + response.tweet.reply + "</span>");

        var twitterUrl = "https://twitter.com/rankforce";
        if (module.isSmartDevice()) {
            twitterUrl = "Twitter:@rankforce";
        }
        $("#social-twitter").attr("href", twitterUrl);
        $("#social-line").attr("href", "http://line.naver.jp/R/msg/text/?" + response.line_msg);

        $("#sub-header").show();
        $("#thread_summary")
            .html(response.summary)
            .jTruncSubstr({
                length: 200,
                minTrail: 199,
                moreAni: "fast",
                lessAni: "fast"
            });

        st.stp_nav.find('nav a').click(function() {
            st.toggle_nav();
            var menu_name = $(this).attr("data-menu");

            if (menu_name === "detail_info") {
                $(this).addClass('selected').siblings().removeClass('selected');
                st.show_section(elem_map[menu_name]);
                location.href = response.url;
            }
            else if (menu_name === "twitter_info") {
                location.href = module.TWITTER_URL;
            }
            else {
               $(this).addClass('selected').siblings().removeClass('selected');
               st.show_section(elem_map[menu_name]);
            }
        });
    });

    module.getRecentThreadData(5, function(response) {
        $("#other_thread_info").show();
        var html = "<ul>";
        response.forEach(function(data) {
            html += "<li><a href='/" + data.id + "'>" + data.title + "</a> (" + data.ikioi + ")</li>\n";
        });
        html += "</ul>";

        $("#other_threads").html(html);
    });

    module.getRankingData(10, function(response) {
        var html = "";
        for (var i = 0; i < response.length; i++) {
            var rank_no = i + 1;
            html += "<li class='rank" + (i+1) + "'>\n";
            if (i === 0 || i === 1 || i === 2) {
                html += "<img src='/images/icon-rank" + rank_no + ".png' alt='" + rank_no + "'/>";
            }
            else {
                html += "<span class='rank-other'>" + rank_no + "</span>";
            }
            html += "<a href='/" + response[i].id + "'>" + response[i].title + "</a> (" + response[i].ikioi + ")\n";
            html += "</li>\n";
        }
        $("#ranking").html(html);
    });

    $('header .menu').click(st.toggle_nav);
    $('header .info').click(function() {
        $("#back-menu").attr("data-menu", $(this).find("span").data("menu"));
        return st.show_section(about, {
            animation: 'upfrombottom'
        });
    });
    $('#about a.cancel').click(function() {
        var menu = $(this).find("span").data("menu");
        return st.show_section(elem_map[menu], {
            animation: 'downfromtop'
        });
    });

    st.show_section(elem_map.thread_info);
}
