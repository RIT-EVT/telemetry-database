document.addEventListener("DOMContentLoaded", function () {
    var captions = document.querySelectorAll(".wy-nav-side p.caption");

    captions.forEach(function (caption) {
        caption.style.cursor = "pointer";
        caption.classList.add("collapsible-caption");

        caption.addEventListener("click", function () {
            this.classList.toggle("caption-closed");
            var list = this.nextElementSibling;
            if (list && list.tagName === "UL") {
                list.style.display = list.style.display === "none" ? "block" : "none";
            }
        });
    });
});
