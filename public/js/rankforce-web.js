var rankforce = {};

Mixjs.module("Base", rankforce, {
    TWITTER_URL: "Twitter:@rankforce"
});

Mixjs.module("API", rankforce, {
    include: [Http],

    mixed: function() {
        console.log("init");
    },

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

    getOthreThreadData: function(num, callback) {
        this.getData("/rest/ranking/today/" + num, callback);
    }
});

Mixjs.module("UI", rankforce, {
    followButton: function() {
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    },
});

function initPage(threadId) {
    var module = rankforce.Base.mix(rankforce.Data, rankforce.UI);
    var st = sidetap();
    var elem_map = {
        thread_info  : $("#thread_info"),
        detail_info  : $("#detail_info"),
        twitter_info : $("#twitter_info")
    };

    module.followButton();

    module.getThreadData(threadId, function(response) {
        $('#thread_title').text(response.title);
        $("#ikioi span").append(response.ikioi.average);
        var twitter_res = $("#twitter_res");
        twitter_res.find(".retweet").append(response.tweet.retweet);
        twitter_res.find(".favorite").append(response.tweet.favorite);
        twitter_res.find(".reply").append(response.tweet.reply);

        $("#ikioi_info").show();
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

    module.getOthreThreadData(5, function(response) {
        $("#other_thread_info").show();
        var html = "<ul>";
        response.forEach(function(data) {
            html += "<li><a href='/" + data.id + "'>" + data.title + "</a> (" + data.ikioi + ")</li>\n";
        });
        html += "</ul>";

        $("#other_threads").html(html);
    });

    $('header .menu').click(st.toggle_nav);
    st.show_section(elem_map.thread_info);
}
