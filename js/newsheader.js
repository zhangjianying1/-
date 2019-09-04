apiready = function() {
    var app = new APP();
    app.handlePage();
    var thisItem = "showNews"; //默认选中第一个
    app.trigger("newsChooseItem", thisItem);
    $("#chooseitem li").click(function() {
        if( !$(this).hasClass('isChosed') ){
            $(this).addClass('isChosed');
            $(this).siblings('li').removeClass('isChosed');
            thisItem = $(this).attr("data-listname");
            $("#chooseitem li>P").css({
                fontSize: "0.28rem",
                fontweight: "normal"
            })
            $("#chooseitem li>b").css({
                borderBottomColor: "#fff"
            })
            $(this).find("p").css({
                fontSize: "0.31rem",
                fontweight: "bold"
            })
            $(this).find("b").css({
                borderBottomColor: "#ffc103"
            })
            app.trigger("newsChooseItem", thisItem);
        }
    });
};